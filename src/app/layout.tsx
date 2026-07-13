import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enmish ダッシュボード",
  description: "営業・業務・会議を一枚で構造化する",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
