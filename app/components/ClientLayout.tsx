'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => setConnected(Boolean(d.mongoConnected)))
      .catch(() => setConnected(false));
  }, []);

  return (
    <>
      <button onClick={() => setOpen((v) => !v)} className="md:hidden fixed top-3 right-3 z-50 btn-outline">☰</button>
      <div className="hidden md:block"><Sidebar connected={connected} /></div>
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-56 h-full" onClick={(e) => e.stopPropagation()}><Sidebar connected={connected} /></div>
        </div>
      )}
      <main className="md:mr-56 p-6">{children}</main>
    </>
  );
}
