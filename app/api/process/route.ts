import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongo';
import { CONFIG } from '@/config';
import { monthToDate } from '@/lib/utils';

const TEXT_TO_FIELD: Record<string, string> = { 'ניהול עצמי': 'nihul_atsmi', 'הזנה': 'hazana', 'קרב': 'krav', 'שכר': 'sachar' };

function resolveSeif(noseData: any, mosadData: any) {
  const result: { hova: string | null; zhut: string | null } = { hova: null, zhut: null };
  for (const field of ['seif_hova', 'seif_zhut']) {
    const val = noseData[field];
    if (!val) continue;
    if (!Number.isNaN(Number(val))) {
      result[field === 'seif_hova' ? 'hova' : 'zhut'] = String(val);
    } else {
      const mosadField = TEXT_TO_FIELD[String(val)];
      if (!mosadField || !mosadData || !mosadData[mosadField]) return null;
      result[field === 'seif_hova' ? 'hova' : 'zhut'] = String(mosadData[mosadField]);
    }
  }
  return result;
}

export async function POST(req: NextRequest) {
  const { calc_month, split_month } = await req.json();
  if (!calc_month || !split_month) {
    return NextResponse.json({ error: 'חובה לבחור חודש חישוב וחודש פיצול' }, { status: 400 });
  }

  const db = await getDb();
  const calcDate = monthToDate(calc_month);
  const splitDate = monthToDate(split_month);
  const run_id = `run_${Date.now()}`;
  const started_at = new Date();
  const logs: any[] = [];
  const rejected: any[] = [];
  const comparison: any[] = [];
  const commands: any[] = [];

  try {
    const [noseme, mosdot, invoices, mucarim, sharatim, yadanim] = await Promise.all([
      db.collection(CONFIG.collections.NOSEME).find().toArray(),
      db.collection(CONFIG.collections.MOSDOT).find().toArray(),
      db.collection(CONFIG.collections.CHESHBONIT).find({ חודש_חישוב: calcDate }).toArray(),
      db.collection(CONFIG.collections.MUCARIM).find({ חודש_חישוב: calcDate }).toArray(),
      db.collection(CONFIG.collections.SHARATIM).find({ חודש_חישוב: calcDate }).toArray(),
      db.collection(CONFIG.collections.YADANIIM).find({ חודש_חישוב: calcDate }).toArray(),
    ]);

    const noseMap = Object.fromEntries(noseme.map((n: any) => [String(n.code), n]));
    const mosdotMap = Object.fromEntries(mosdot.map((m: any) => [String(m.code), m]));
    const allCodes = [...new Set(invoices.map((inv: any) => String(inv.קוד_נושא)))];

    for (const code of allCodes) {
      const noseData = noseMap[code];
      if (!noseData) {
        logs.push({ level: 'שגיאה', code, message: 'נושא לא קיים ב-NOSEME' });
        rejected.push({ code, reason: 'נושא לא קיים' });
        continue;
      }

      if (noseData.table_type === 'שונות') {
        const byTchula: Record<string, { tchula: Date; total: number }> = {};
        invoices.filter((inv: any) => String(inv.קוד_נושא) === code).forEach((inv: any) => {
          if (!inv.חודש_תחולה) return;
          const tch = new Date(inv.חודש_תחולה);
          const key = tch.toISOString();
          byTchula[key] ||= { tchula: tch, total: 0 };
          byTchula[key].total += Number(inv.יתרת_ביצוע_החודש) || 0;
        });
        for (const item of Object.values(byTchula)) {
          const seifs = resolveSeif(noseData, null);
          if (!seifs) {
            rejected.push({ code, reason: 'סעיף חסר' });
            continue;
          }
          commands.push({
            seif_hova: seifs.hova,
            seif_zhut: seifs.zhut,
            date_val: item.tchula,
            description: `${noseData.name} | ${code}`,
            nose_id: code,
            mosad_id: null,
            amount: item.total,
            חודש_חישוב: calcDate,
            period: item.tchula > splitDate ? 'ראשונה' : 'שנייה',
          });
        }
        continue;
      }

      const invRows = invoices.filter((inv: any) => String(inv.קוד_נושא) === code);
      const mucRows = mucarim.filter((m: any) => String(m.קוד_נושא) === code);
      const shaRows = sharatim.filter((s: any) => String(s.קוד_נושא) === code);
      const yadRows = yadanim.filter((y: any) => String(y.קוד_נושא) === code);

      const invoiceTotal = invRows.reduce((s: number, r: any) => s + (Number(r.יתרת_ביצוע_החודש) || 0), 0);
      const baseTotal = [...mucRows, ...shaRows].reduce((s: number, r: any) => s + (Number(r.הפרש_מחושב) || 0), 0);
      const yadaniTotal = yadRows.reduce((s: number, r: any) => s + (Number(r.סכום_מחושב) || 0), 0);
      comparison.push({ code, name: noseData.name, invoiceTotal, baseTotal, yadaniTotal });

      let sourceRows: any[] = [];
      if (Math.abs(invoiceTotal - baseTotal) <= 0.01) sourceRows = [...mucRows, ...shaRows];
      else if (Math.abs(invoiceTotal - (baseTotal + yadaniTotal)) <= 0.01) sourceRows = [...mucRows, ...shaRows, ...yadRows];
      else {
        logs.push({ level: 'שגיאה', code, message: `חוסר התאמה בנושא ${noseData.name}` });
        rejected.push({ code, name: noseData.name, amount: invoiceTotal, reason: 'חוסר התאמה כספית' });
        continue;
      }

      const grouped: Record<string, { mosadCode: string; tchula: Date; total: number }> = {};
      sourceRows.forEach((row) => {
        if (!row.חודש_תחולה) return;
        const mosadCode = String(row.סמל_מוסד);
        const tchula = new Date(row.חודש_תחולה);
        const key = `${code}_${mosadCode}_${tchula.toISOString()}`;
        grouped[key] ||= { mosadCode, tchula, total: 0 };
        grouped[key].total += Number(row.הפרש_מחושב ?? row.סכום_מחושב ?? 0);
      });

      for (const item of Object.values(grouped)) {
        const mosadData = mosdotMap[item.mosadCode] || null;
        const seifs = resolveSeif(noseData, mosadData);
        if (!seifs) {
          logs.push({ level: 'שגיאה', code, message: `סעיף חסר למוסד ${item.mosadCode}` });
          rejected.push({ code, mosadCode: item.mosadCode, amount: item.total, reason: 'סעיף חסר' });
          continue;
        }
        commands.push({
          seif_hova: seifs.hova,
          seif_zhut: seifs.zhut,
          date_val: item.tchula,
          description: `${noseData.name} | ${code} | ${mosadData?.name ?? item.mosadCode}`,
          nose_id: code,
          mosad_id: item.mosadCode,
          amount: item.total,
          חודש_חישוב: calcDate,
          period: item.tchula > splitDate ? 'ראשונה' : 'שנייה',
        });
      }
    }

    await db.collection(CONFIG.collections.COMMANDS).deleteMany({ חודש_חישוב: calcDate });
    if (commands.length) await db.collection(CONFIG.collections.COMMANDS).insertMany(commands);

    const summary = {
      invoices: invoices.length,
      commands: commands.length,
      total: commands.reduce((s, c) => s + (Number(c.amount) || 0), 0),
    };

    await db.collection(CONFIG.collections.RUNS).insertOne({
      run_id,
      calculation_month: calcDate,
      split_month: splitDate,
      status: 'completed',
      started_at,
      ended_at: new Date(),
      summary,
      errors_count: logs.filter((l) => l.level === 'שגיאה').length,
      warnings_count: logs.filter((l) => l.level === 'אזהרה').length,
      unprocessed_count: rejected.length,
    });

    return NextResponse.json({ run_id, summary, period1: commands.filter((c) => c.period === 'ראשונה'), period2: commands.filter((c) => c.period === 'שנייה'), logs, comparison, rejected });
  } catch (error) {
    await db.collection(CONFIG.collections.RUNS).insertOne({
      run_id,
      calculation_month: calcDate,
      split_month: splitDate,
      status: 'error',
      started_at,
      ended_at: new Date(),
      error_message: error instanceof Error ? error.message : 'שגיאה לא ידועה',
    });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'שגיאה לא ידועה' }, { status: 500 });
  }
}
