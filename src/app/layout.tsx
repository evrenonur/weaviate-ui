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
  title: "Weaviate Dashboard - Vector Database Management Interface",
  description: "A modern, responsive web interface for managing and exploring Weaviate vector databases. Features schema management, object browsing, GraphQL interface, and multi-connection support.",
  keywords: ["weaviate", "vector database", "dashboard", "ai", "machine learning", "graphql", "schema management"],
  authors: [{ name: "Weaviate Dashboard Contributors" }],
  openGraph: {
    title: "Weaviate Dashboard",
    description: "Modern web interface for Weaviate vector databases",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weaviate Dashboard",
    description: "Modern web interface for Weaviate vector databases",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
