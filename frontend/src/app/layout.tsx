import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClerkProviderWrapper from "@/components/ClerkProviderWrapper";
import SWRegister from "@/components/SWRegister";
import Header from "@/components/Header";
import ConditionalSidebar from "@/components/ConditionalSidebar";
import { Footer } from "@/components/Footer";
import SecuritySignalSender from "@/components/SecuritySignalSender";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BetterU",
  description: "BetterU",
  // Link web app manifest via Next.js metadata
  manifest: "/manifest.json",
  // Theme color used by PWA install surfaces
  themeColor: "#0f172a",
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
        <ClerkProviderWrapper>
          {/* Register service worker in production builds only */}
          {/* Minimal, optional PWA support; no push or background sync */}
          <SWRegister />
          <div className="flex min-h-screen">
            <ConditionalSidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <SecuritySignalSender />
              <Footer />
            </div>
          </div>
          {/* SWRegister is lightweight and runs only on client */}
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
