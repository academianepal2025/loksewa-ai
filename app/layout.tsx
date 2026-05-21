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
  keywords: [
    "Loksewa", 
    "Loksewa AI", 
    "Loksewa Tayari", 
    "PSC Nepal", 
    "Loksewa Ayog", 
    "AI Tutor", 
    "Nepal Public Service Commission", 
    "Study Notes", 
    "Mock Tests", 
    "Loksewa Preparation", 
    "Loksewa Syllabus", 
    "Kharidar Tayari", 
    "Nayab Subba", 
    "Section Officer", 
    "लोकसेवा तयारी"
  ],
  authors: [{ name: "Loksewa AI Team" }],
  creator: "Loksewa AI",
  publisher: "Loksewa AI",
  metadataBase: new URL('https://loksewaai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Loksewa AI | Smart Study Workspace",
    description: "Advanced AI-powered preparation platform for Loksewa candidates. Personalized study plans, smart notes, and unlimited practice.",
    url: 'https://loksewaai.com',
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
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/landing/CookieConsent";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const prefsCookie = cookieStore.get("loksewa_prefs")?.value;
  let prefs = { language: 'en', theme: 'orange', fontScale: 'md' };
  
  if (prefsCookie) {
    try {
      prefs = JSON.parse(decodeURIComponent(prefsCookie));
    } catch (e) {}
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://loksewaai.com/#organization",
      "name": "Loksewa AI",
      "url": "https://loksewaai.com",
      "logo": "https://loksewaai.com/icon-512.png",
      "description": "Nepal's first AI-powered PSC preparation platform. Personalized study plans, smart notes, and adaptive practice.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+977-9808493504",
        "contactType": "customer service",
        "email": "loksewagkdose@gmail.com"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://loksewaai.com/#website",
      "url": "https://loksewaai.com",
      "name": "Loksewa AI",
      "alternateName": ["लोकसेवा एआई", "LoksewaAI"],
      "description": "Nepal's First AI Tutor for PSC Exam Preparation. Practice MCQs, generate notes, and query Loksewa Guru in Nepali & English.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://loksewaai.com/blog?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <html
      lang={prefs.language}
      className={`${inter.variable} h-full antialiased theme-${prefs.theme} font-scale-${prefs.fontScale}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
          <CookieConsent />
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
