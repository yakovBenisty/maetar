'use client';

import { useState } from 'react';

type Result = { filename: string; status: string; collection?: string; rows?: number; error?: string };

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'replace'>('skip');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!files?.length) return;
    setLoading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('files', f));
    fd.append('duplicateStrategy', duplicateStrategy);
    const res = await fetch('/api/import', { method: 'POST', body: fd });
    const data = await res.json();
    setResults(data.results ?? []);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">העלאת קבצי CSV</h2>
      <div className="card space-y-3">
        <input className="input" type="file" multiple onChange={(e) => setFiles(e.target.files)} />
        <input className="input" type="file" multiple webkitdirectory="true" directory="" onChange={(e) => setFiles(e.target.files)} />
        <select className="input" value={duplicateStrategy} onChange={(e) => setDuplicateStrategy(e.target.value as 'skip' | 'replace')}>
          <option value="skip">דלג על כפולות</option>
          <option value="replace">דרוס כפולות</option>
        </select>
        <button className="btn" onClick={upload} disabled={loading}>{loading ? 'מעלה...' : 'התחל ייבוא'}</button>
      </div>

      <div className="card overflow-auto">
        <table className="table">
          <thead><tr><th>קובץ</th><th>קולקשן</th><th>שורות</th><th>סטטוס</th><th>שגיאה</th></tr></thead>
          <tbody>
            {results.map((r) => <tr key={r.filename}><td>{r.filename}</td><td>{r.collection ?? '-'}</td><td>{r.rows ?? '-'}</td><td>{r.status}</td><td>{r.error ?? '-'}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
