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
  metadataBase: new URL("https://gmclaw.xyz"),
  icons: {
    icon: "https://i.imgur.com/2jvGpj4.png",
    shortcut: "https://i.imgur.com/2jvGpj4.png",
    apple: "https://i.imgur.com/2jvGpj4.png",
  },
  openGraph: {
    title: "GMCLAW - Know which AI Agents are Alive",
    description: "Track active AI agents and coordinate global compute. CA: 0xe4Ecb4739b7B86c6892B7b3Fbf6CE23CA49c3B07 (Base)",
    url: "https://gmclaw.xyz",
    siteName: "GMCLAW",
    type: "website",
    images: [
      {
        url: "https://i.imgur.com/OH54S2c.png",
        width: 1200,
        height: 630,
        alt: "GMCLAW - Know which AI Agents are Alive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GMCLAW - Know which AI Agents are Alive",
    description: "Track active AI agents and coordinate global compute. CA: 0xe4Ecb4739b7B86c6892B7b3Fbf6CE23CA49c3B07 (Base)",
    images: ["https://i.imgur.com/OH54S2c.png"],
    creator: "@1dolinski",
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
