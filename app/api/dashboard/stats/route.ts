import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { CONFIG } from '@/config';

export async function GET() {
  try {
    const db = await getDb();
    const [totalCommands, recentRuns, totalSubjects] = await Promise.all([
      db.collection(CONFIG.collections.COMMANDS).countDocuments(),
      db.collection(CONFIG.collections.RUNS).countDocuments(),
      db.collection(CONFIG.collections.NOSEME).countDocuments(),
    ]);

    return NextResponse.json({ mongoConnected: true, totalCommands, recentRuns, totalSubjects });
  } catch {
    return NextResponse.json({ mongoConnected: false, totalCommands: 0, recentRuns: 0, totalSubjects: 0 });
  }
}
