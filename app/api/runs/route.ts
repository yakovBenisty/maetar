import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { CONFIG } from '@/config';

export async function GET() {
  const db = await getDb();
  const runs = await db.collection(CONFIG.collections.RUNS).find().sort({ started_at: -1 }).limit(50).toArray();
  return NextResponse.json(runs);
}
