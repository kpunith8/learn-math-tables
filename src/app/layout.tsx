import type { Metadata } from "next";
import { Geist, Geist_Mono, Baloo_2, Nunito } from "next/font/google";
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
  title: "Math Adventure - Fun Math Learning for Kids",
  description: "Free interactive math learning app for kids. Learn addition, subtraction, multiplication, and division with fun examples, practice problems, and quizzes. Perfect for children aged 5-8.",
  keywords: "math for kids, addition, subtraction, multiplication, division, learn math, free math game for kids, educational math game, times tables",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧮</text></svg>",
  },
  openGraph: {
    title: "Math Adventure - Fun Math Learning for Kids",
    description: "Free interactive math learning app for kids. Learn addition, subtraction, multiplication, and division with fun examples, practice problems, and quizzes.",
    url: "https://punithk.com/multiplication-tables-adventure/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Math Adventure - Fun Math Learning for Kids",
    description: "Free interactive math learning app for kids. Learn addition, subtraction, multiplication, and division with fun examples, practice problems, and quizzes.",
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
      <body className="min-h-full flex flex-col bg-paper"><AppProvider>{children}</AppProvider></body>
    </html>
  );
}
