import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import { Header } from "@/components/layout/header";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "teachMe - Learn Any Text Your Way",
  description:
    "Transform dense academic text into digestible formats. Built for students with ADHD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${instrumentSerif.variable} ${dmSans.variable} font-sans antialiased bg-gray-950 text-gray-100`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
