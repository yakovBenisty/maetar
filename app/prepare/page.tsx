'use client';

import { useState } from 'react';

export default function PreparePage() {
  const [calcMonth, setCalcMonth] = useState('');
  const [splitMonth, setSplitMonth] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const res = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calc_month: calcMonth, split_month: splitMonth }),
    });
    setResult(await res.json());
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">הכנת פקודה</h2>
      <div className="card grid md:grid-cols-2 gap-3">
        <label>חודש חישוב<input className="input" type="month" value={calcMonth} onChange={(e) => setCalcMonth(e.target.value)} /></label>
        <label>חודש פיצול<input className="input" type="month" value={splitMonth} onChange={(e) => setSplitMonth(e.target.value)} /></label>
        <button className="btn md:col-span-2" onClick={run} disabled={loading}>{loading ? 'מעבד...' : 'הפק פקודה'}</button>
      </div>
      {result && <pre className="card overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
