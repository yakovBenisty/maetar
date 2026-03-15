'use client';

import { useState } from 'react';

export default function ReportsPage() {
  const [collection, setCollection] = useState('COMMANDS');
  const [rows, setRows] = useState<any[]>([]);

  const query = async () => {
    const res = await fetch('/api/reports/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ collection, limit: 100 }) });
    const data = await res.json();
    setRows(data.rows ?? []);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">מחולל דוחות</h2>
      <div className="card flex gap-2">
        <input className="input" value={collection} onChange={(e) => setCollection(e.target.value)} />
        <button className="btn" onClick={query}>הרץ שאילתה</button>
      </div>
      <pre className="card overflow-auto text-xs">{JSON.stringify(rows, null, 2)}</pre>
    </div>
  );
}
