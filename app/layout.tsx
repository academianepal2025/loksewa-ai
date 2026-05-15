import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Loksewa AI | Nepal's First AI Tutor for PSC Preparation",
  description: "Ace your Loksewa Ayog (PSC Nepal) exams with your personal AI tutor. Generate smart study notes, take custom mock tests, and get real-time syllabus guidance.",
  keywords: ["Loksewa", "PSC Nepal", "Loksewa Ayog", "AI Tutor", "Nepal Public Service Commission", "Study Notes", "Mock Tests", "Loksewa Preparation", "Loksewa Syllabus"],
  authors: [{ name: "Loksewa AI Team" }],
  creator: "Loksewa AI",
  publisher: "Loksewa AI",
  metadataBase: new URL('https://loksewai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Loksewa AI | Smart Study Workspace",
    description: "Advanced AI-powered preparation platform for Loksewa candidates. Personalized study plans, smart notes, and unlimited practice.",
    url: 'https://loksewai.com',
    siteName: 'Loksewa AI',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Loksewa AI Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Loksewa AI | Nepal's First AI Tutor for PSC",
    description: "Ace your Loksewa exams with AI. Custom mock tests, study plans, and smart notes.",
    images: ['/icon-512.png'],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Loksewa AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
