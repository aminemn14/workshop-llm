import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeClient from "@/components/ThemeClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workshop LLM",
  description: "Utility app UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeClient>{children}</ThemeClient>
      </body>
    </html>
  );
}
