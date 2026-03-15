import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { CONFIG } from '@/config';

function n(v: unknown) {
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

export async function GET() {
  const db = await getDb();
  const items = await db.collection(CONFIG.collections.MOSDOT).find().sort({ code: 1 }).toArray();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const doc = {
    code: String(body.code),
    name: body.name,
    nihul_atsmi: n(body.nihul_atsmi),
    hazana: n(body.hazana),
    krav: n(body.krav),
    sachar: n(body.sachar),
  };
  await db.collection(CONFIG.collections.MOSDOT).updateOne({ code: doc.code }, { $set: doc }, { upsert: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'חסר code' }, { status: 400 });
  const db = await getDb();
  await db.collection(CONFIG.collections.MOSDOT).deleteOne({ code: String(code) });
  return NextResponse.json({ ok: true });
}
