import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { getDb } from '@/lib/mongo';
import { CONFIG, IMPORT_TYPES } from '@/config';
import { formatValue, normalizeColumnName, parseDateString } from '@/lib/utils';

export const runtime = 'nodejs';

const FILE_RE = /^(\d+)_(\d{1,2})_(\d{4})([A-Z0-9]+)\.csv$/i;

export async function POST(req: NextRequest) {
  const db = await getDb();
  const form = await req.formData();
  const files = form.getAll('files') as File[];
  const duplicateStrategy = (form.get('duplicateStrategy') as string) || 'skip';
  const runId = `import_${Date.now()}`;
  const results: any[] = [];

  for (const file of files) {
    const rawFilename = file.name || 'unknown.csv';
    const filename = rawFilename.split('/').pop()?.split('\\').pop() || rawFilename;
    const match = filename.match(FILE_RE);
    if (!match) {
      results.push({ filename, status: 'error', error: 'שם קובץ לא תואם לפורמט' });
      continue;
    }

    const fileType = match[4].toUpperCase();
    if (!IMPORT_TYPES.has(fileType)) {
      results.push({ filename, status: 'error', error: 'סוג קובץ לא נתמך' });
      continue;
    }

    const collectionName = (CONFIG.collections as Record<string, string>)[fileType] || fileType;
    const existingCount = await db.collection(collectionName).countDocuments({ source_file: filename });
    if (existingCount > 0 && duplicateStrategy === 'skip') {
      results.push({ filename, collection: collectionName, rows: existingCount, status: 'skipped' });
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const records: Record<string, unknown>[] = [];

    await new Promise<void>((resolve, reject) => {
      Readable.from(buffer.toString('utf-8'))
        .pipe(csvParser({ mapHeaders: ({ header }) => normalizeColumnName(header), quote: '\x00', escape: '\x00' }))
        .on('data', (data: Record<string, unknown>) => {
          Object.keys(data).forEach((key) => {
            if (key === 'חודש_חישוב' || key === 'חודש_תחולה') {
              data[key] = parseDateString(String(data[key])) || data[key];
            } else {
              data[key] = formatValue(data[key]);
            }
          });
          data.source_file = filename;
          data.import_timestamp = new Date();
          data.run_id = runId;
          data.file_type = fileType;
          records.push(data);
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    if (records.length === 0) {
      results.push({ filename, collection: collectionName, status: 'error', error: 'קובץ ריק' });
      continue;
    }

    if (existingCount > 0 && duplicateStrategy === 'replace') {
      await db.collection(collectionName).deleteMany({ source_file: filename });
      await db.collection(collectionName).insertMany(records);
      results.push({ filename, collection: collectionName, rows: records.length, status: 'replaced' });
    } else {
      await db.collection(collectionName).insertMany(records);
      results.push({ filename, collection: collectionName, rows: records.length, status: 'imported' });
    }
  }

  return NextResponse.json({ runId, results });
}
