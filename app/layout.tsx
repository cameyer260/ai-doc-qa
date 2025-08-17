import { Providers } from "@/components/Providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocuQuery",
  description:
    "AI-powered document Q&A app where you can upload files and instantly query their contents using vector search.",
  icons: { icon: "/favicon.ico", apple: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <Providers>
          <div className="mx-auto max-w-3xl p-6">
            <header className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Doc Q&A (RAG)</h1>
              <nav className="flex gap-4 text-sm">
                <Link className="underline" href="/">
                  Home
                </Link>
                <Link className="underline" href="/upload">
                  Upload
                </Link>
                <Link className="underline" href="/ask">
                  Ask
                </Link>
              </nav>
            </header>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
