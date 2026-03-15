'use client';

import { useEffect, useState } from 'react';

export default function MosdotPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ code: '', name: '', nihul_atsmi: '', hazana: '', krav: '', sachar: '' });

  const load = async () => setItems(await (await fetch('/api/mosdot')).json());
  useEffect(() => { void load(); }, []);

  const save = async () => {
    await fetch('/api/mosdot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ code: '', name: '', nihul_atsmi: '', hazana: '', krav: '', sachar: '' });
    await load();
  };

  const del = async (code: string) => { await fetch(`/api/mosdot?code=${code}`, { method: 'DELETE' }); await load(); };

  return <div className="space-y-4"><h2 className="text-2xl font-bold">ניהול מוסדות</h2>
    <div className="card grid md:grid-cols-3 gap-2">
      {Object.entries(form).map(([k, v]) => <input key={k} className="input" placeholder={k} value={v} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />)}
      <button className="btn md:col-span-3" onClick={save}>שמור</button>
    </div>
    <div className="card overflow-auto"><table className="table"><thead><tr><th>קוד</th><th>שם</th><th>פעולות</th></tr></thead><tbody>
      {items.map((i) => <tr key={i.code}><td>{i.code}</td><td>{i.name}</td><td><button className="btn-outline" onClick={() => del(i.code)}>מחק</button></td></tr>)}
    </tbody></table></div></div>;
}
