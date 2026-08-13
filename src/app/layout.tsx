import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2, Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import { Providers } from "@/lib/contexts/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Math Adventure - Fun Math Learning for Kids",
    template: "%s | Math Adventure",
  },
  description: SITE_DESCRIPTION,
  keywords: "math for kids, addition, subtraction, multiplication, division, learn math, free math game for kids, educational math game, times tables",
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧮</text></svg>",
  },
  openGraph: {
    title: "Math Adventure - Fun Math Learning for Kids",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Math Adventure - Fun Math Learning for Kids",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${nunito.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Math Adventure",
              url: SITE_URL,
              description: "Free interactive math adventure for kids under 8. Learn addition, subtraction, multiplication, and division — plus times tables 1 to 10 — with fun stories, colourful characters, and progressive unlocking.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any",
              browserRequirements: "Requires JavaScript",
              educationalLevel: "beginner",
              teaches: ["Addition", "Subtraction", "Multiplication", "Division", "Times Tables", "Maths for kids"],
              audience: {
                "@type": "EducationalAudience",
                educationalRole: "student",
                suggestedMinAge: 5,
                suggestedMaxAge: 8,
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper"><Providers>{children}</Providers><Analytics /></body>
    </html>
  );
}
