import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "US Stock Screener | AI-Powered Analysis",
  description: "Screen and analyze US stocks with AI-powered recommendations. Filter by market cap, P/E ratio, sector, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <a href="/" className="text-xl font-bold hover:underline">
              US Stock Screener
            </a>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t py-4">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            Powered by Finnhub • AI Analysis by Mistral
          </div>
        </footer>
      </body>
    </html>
  );
}