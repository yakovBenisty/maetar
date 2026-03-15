import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './components/ClientLayout';

export const metadata: Metadata = {
  title: 'מערכת ניהול פקודות תשלום',
  description: 'עיריית נתיבות',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
