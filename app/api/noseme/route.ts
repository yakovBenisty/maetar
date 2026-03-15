import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { CONFIG } from '@/config';

export async function GET() {
  const db = await getDb();
  const items = await db.collection(CONFIG.collections.NOSEME).find().sort({ code: 1 }).toArray();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  await db.collection(CONFIG.collections.NOSEME).updateOne({ code: String(body.code) }, { $set: { ...body, code: String(body.code) } }, { upsert: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'חסר code' }, { status: 400 });
  const db = await getDb();
  await db.collection(CONFIG.collections.NOSEME).deleteOne({ code: String(code) });
  return NextResponse.json({ ok: true });
}
