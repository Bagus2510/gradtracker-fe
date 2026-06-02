import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/context/i18n-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GradTracker — Graduation Risk BI Dashboard",
  description:
    "Monitor and predict student graduation risks using BI and predictive modeling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthProvider>
          <I18nProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
