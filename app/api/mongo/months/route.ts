import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { CONFIG } from '@/config';

export async function GET() {
  const db = await getDb();
  const months = await db.collection(CONFIG.collections.CHESHBONIT).distinct('חודש_חישוב');
  return NextResponse.json(months);
}
