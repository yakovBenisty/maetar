async function getStats() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/dashboard/stats`, { cache: 'no-store' });
    return await res.json();
  } catch {
    return { mongoConnected: false, totalCommands: 0, recentRuns: 0, totalSubjects: 0 };
  }
}

export default async function DashboardPage() {
  const s = await getStats();
  const cards = [
    ['חיבור MongoDB', s.mongoConnected ? 'מחובר' : 'לא מחובר'],
    ['סה"כ פקודות', s.totalCommands ?? 0],
    ['ריצות אחרונות', s.recentRuns ?? 0],
    ['סה"כ נושאים', s.totalSubjects ?? 0],
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">דשבורד</h2>
      <div className="grid md:grid-cols-4 gap-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="card">
            <div className="text-muted">{label}</div>
            <div className="text-xl font-bold mt-2">{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
