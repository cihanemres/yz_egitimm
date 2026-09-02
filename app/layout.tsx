import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SözlüAI",
  description: "Yapay zeka destekli açık uçlu test ve anında geri bildirim platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  );
}
