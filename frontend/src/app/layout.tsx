import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { Providers } from "@/config/providers";
import { ErrorBoundary } from "@presentation/components/common";
import "./globals.css";

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Neosis - Plateforme de messagerie communautaire",
  description: "Neosis - Plateforme de messagerie communautaire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
