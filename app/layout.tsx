import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SözlüAI — Yapay Zeka Destekli Açık Uçlu Test Platformu',
  description:
    'Bilişim Teknolojileri ve Yazılım dersi için yapay zeka destekli açık uçlu test ve anında geri bildirim platformu.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
