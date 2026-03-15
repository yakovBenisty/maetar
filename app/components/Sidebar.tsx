'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'דשבורד' },
  { href: '/upload', label: 'העלאת קבצים' },
  { href: '/prepare', label: 'הכנת פקודה' },
  { href: '/runs', label: 'היסטוריית ריצות' },
  { href: '/reports', label: 'מחולל דוחות' },
  { href: '/noseme', label: 'ניהול נושאים' },
  { href: '/mosdot', label: 'ניהול מוסדות' },
];

export default function Sidebar({ connected }: { connected: boolean | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-sidebar border-l border-border h-screen fixed right-0 top-0 p-4 flex flex-col">
      <h1 className="text-lg font-bold mb-4">מערכת פקודות תשלום</h1>
      <nav className="space-y-2 flex-1">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`block rounded-md px-3 py-2 ${pathname === l.href ? 'bg-surface text-blue' : 'text-text hover:bg-surface'}`}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="text-sm border border-border rounded-lg p-2 bg-card">
        <div className="text-muted">MongoDB</div>
        <div className={connected ? 'text-green' : 'text-red'}>{connected ? 'מחובר' : 'לא מחובר'}</div>
      </div>
    </aside>
  );
}
