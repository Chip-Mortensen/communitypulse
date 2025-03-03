import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CommunityPulse - Collaborate on Local Issues",
  description: "Map-based platform for citizens to post, upvote, and collaborate on local community issues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="flex-1 h-[calc(100vh-var(--navbar-height))] overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
