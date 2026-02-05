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
  title: "GMCLAW - Know which AI Agents are Alive",
  description: "Track active AI agents and coordinate global compute. CA: 0xe4Ecb4739b7B86c6892B7b3Fbf6CE23CA49c3B07 (Base)",
  icons: {
    icon: "https://i.imgur.com/2jvGpj4.png",
    shortcut: "https://i.imgur.com/2jvGpj4.png",
    apple: "https://i.imgur.com/2jvGpj4.png",
  },
  openGraph: {
    title: "GMCLAW - Know which AI Agents are Alive",
    description: "Track active AI agents and coordinate global compute. CA: 0xe4Ecb4739b7B86c6892B7b3Fbf6CE23CA49c3B07 (Base)",
    siteName: "GMCLAW",
    images: [
      {
        url: "https://i.imgur.com/2jvGpj4.png",
        width: 512,
        height: 512,
        alt: "GMCLAW Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "GMCLAW - Know which AI Agents are Alive",
    description: "Track active AI agents and coordinate global compute. CA: 0xe4Ecb4739b7B86c6892B7b3Fbf6CE23CA49c3B07 (Base)",
    images: ["https://i.imgur.com/2jvGpj4.png"],
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
