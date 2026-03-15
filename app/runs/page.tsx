async function getRuns() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}/api/runs`, { cache: 'no-store' });
  return res.ok ? res.json() : [];
}

export default async function RunsPage() {
  const runs = await getRuns();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">היסטוריית ריצות</h2>
      <div className="card overflow-auto">
        <table className="table"><thead><tr><th>run_id</th><th>חודש חישוב</th><th>סטטוס</th><th>פקודות</th><th>סה"כ</th><th>התחלה</th></tr></thead>
          <tbody>
            {runs.map((r: any) => <tr key={r.run_id}><td>{r.run_id}</td><td>{new Date(r.calculation_month).toLocaleDateString('he-IL')}</td><td>{r.status}</td><td>{r.summary?.commands ?? 0}</td><td>{r.summary?.total ?? 0}</td><td>{new Date(r.started_at).toLocaleString('he-IL')}</td></tr>)}
          </tbody></table>
      </div>
    </div>
  );
}
