import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "熊貓救援隊：四邊形秘境",
  description: "親手量度、變形和分類，探索四邊形的關係。七關救援任務，老師主動帶隊。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-HK">
      <body className="antialiased">{children}</body>
    </html>
  );
}
