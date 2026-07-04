import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "一球速報ボード",
  description: "NPBの試合を選んで、一球ごとのカウントと得点をリアルタイムに追う",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
