import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Signal — Web3 Hackathon Ideas",
  description:
    "Mine real complaints from Reddit to find your next Web3 hackathon project idea. Data-driven, global-scale problem discovery.",
  openGraph: {
    title: "Signal — Web3 Hackathon Ideas",
    description:
      "Mine real complaints from Reddit to find your next Web3 hackathon project idea.",
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
      <body
        className={`${inter.variable} font-sans antialiased bg-[#0A0A0A]`}
      >
        {children}
      </body>
    </html>
  );
}
