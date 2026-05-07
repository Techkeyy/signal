import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Signal — Web3 Hackathon Ideas",
  description:
    "Mine real Reddit complaints to find Web3 hackathon project ideas. Every card backed by a real person's frustration.",
  openGraph: {
    title: "Signal — Web3 Hackathon Ideas",
    description:
      "Web3 hackathon ideas from real complaints on Reddit. Global-scale problem discovery.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
