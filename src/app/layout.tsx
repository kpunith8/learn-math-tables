import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/contexts/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multiplication Tables Adventure - Free Times Table Learning for Kids Under 8",
  description: "Free interactive multiplication tables adventure for kids under 8. Learn times tables 1 to 10 with fun stories, colourful illustrations, and progressive unlocking. Perfect for children aged 5-8 to master maths tables the fun way.",
  keywords: "multiplication tables for kids, times tables for children, maths tables for kids, learn multiplication, repeated addition for kids, free math game for kids under 8, times tables practice, educational math game, learn times tables online",
  openGraph: {
    title: "Multiplication Tables Adventure - Free Times Table Learning for Kids Under 8",
    description: "Free interactive multiplication tables adventure for kids under 8. Learn times tables 1 to 10 with fun stories, colourful illustrations, and progressive unlocking.",
    url: "https://punithk.com/multiplication-tables-adventure/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multiplication Tables Adventure - Free Times Table Learning for Kids Under 8",
    description: "Free interactive multiplication tables adventure for kids under 8. Learn times tables 1 to 10 with fun stories, colourful illustrations, and progressive unlocking.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Multiplication Tables Adventure",
              url: "https://punithk.com/multiplication-tables-adventure/",
              description: "Free interactive multiplication tables adventure for kids under 8. Learn times tables 1 to 10 with fun stories, colourful illustrations, and progressive unlocking.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Any",
              browserRequirements: "Requires JavaScript",
              educationalLevel: "beginner",
              teaches: ["Multiplication", "Times Tables", "Repeated Addition", "Maths for kids"],
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
      <body className="min-h-full flex flex-col bg-[#F5F5F5]"><AppProvider>{children}</AppProvider></body>
    </html>
  );
}
