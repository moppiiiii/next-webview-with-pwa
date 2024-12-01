import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/layouts/main/Main.layout";

export const metadata: Metadata = {
  title: "Weather",
  description: "あなたの街の天気を見る",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body>
          <MainLayout>{children}</MainLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
