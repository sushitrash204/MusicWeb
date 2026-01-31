import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
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
  title: "Spotify",
  description: "Web Music Player",
};

import { Providers } from "./providers";
import Header from "../components/Header";
import MusicPlayer from "../components/MusicPlayer";
import GlobalAlert from "../components/GlobalAlert";
import AdOverlay from "../components/AdOverlay";
import { MusicPlayerProvider } from "../contexts/MusicPlayerContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = localStorage.getItem('theme');
                  var isDark = localTheme !== 'light'; // Default to dark unless explicitly light
                  var root = document.documentElement;
                  if (isDark) {
                    root.setAttribute('data-theme', 'dark');
                    root.classList.add('dark');
                  } else {
                    root.setAttribute('data-theme', 'light');
                    root.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers>
          <MusicPlayerProvider>
            <Header />
            <main className="min-h-screen" style={{ paddingBottom: '90px' }}>
              {children}
            </main>
            <GlobalAlert />
            <MusicPlayer />
            <AdOverlay />
            <Toaster position="top-center" reverseOrder={false} />
          </MusicPlayerProvider>
        </Providers>
      </body>
    </html>
  );
}
