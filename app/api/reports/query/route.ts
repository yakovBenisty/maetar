import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';

export async function POST(req: NextRequest) {
  const { collection, filter = {}, limit = 100 } = await req.json();
  if (!collection) return NextResponse.json({ error: 'חסר collection' }, { status: 400 });
  const db = await getDb();
  const rows = await db.collection(String(collection)).find(filter).limit(Number(limit)).toArray();
  return NextResponse.json({ rows });
}
