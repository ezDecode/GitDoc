import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

// We're now using PPMori font from local files
// But keeping Geist Mono for code blocks
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitDocify - AI-Powered Documentation Generator",
  description:
    "Generate comprehensive documentation for your GitHub repositories using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} font-sans antialiased bg-background text-text-primary`}
      >
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
