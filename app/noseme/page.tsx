'use client';

import { useEffect, useState } from 'react';

export default function NosemePage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ code: '', name: '', table_type: 'מוסדות', seif_hova: '', seif_zhut: '' });

  const load = async () => setItems(await (await fetch('/api/noseme')).json());
  useEffect(() => { void load(); }, []);

  const save = async () => {
    await fetch('/api/noseme', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ code: '', name: '', table_type: 'מוסדות', seif_hova: '', seif_zhut: '' });
    await load();
  };

  const del = async (code: string) => { await fetch(`/api/noseme?code=${code}`, { method: 'DELETE' }); await load(); };

  return <div className="space-y-4"><h2 className="text-2xl font-bold">ניהול נושאים</h2>
    <div className="card grid md:grid-cols-5 gap-2">
      {Object.entries(form).map(([k, v]) => <input key={k} className="input" placeholder={k} value={v} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}
      <button className="btn md:col-span-5" onClick={save}>שמור</button>
    </div>
    <div className="card overflow-auto"><table className="table"><thead><tr><th>קוד</th><th>שם</th><th>סוג</th><th>פעולות</th></tr></thead><tbody>
      {items.map((i) => <tr key={i.code}><td>{i.code}</td><td>{i.name}</td><td>{i.table_type}</td><td><button className="btn-outline" onClick={() => del(i.code)}>מחק</button></td></tr>)}
    </tbody></table></div></div>;
}
