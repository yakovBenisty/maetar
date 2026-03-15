import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { CONFIG } from '@/config';

export async function GET() {
  const db = await getDb();
  const rows = await db.collection(CONFIG.collections.NOSEME).find({}, { projection: { code: 1, name: 1, _id: 0 } }).toArray();
  return NextResponse.json(rows);
}
