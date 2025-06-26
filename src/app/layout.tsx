import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { WalletProvider } from "@/contexts/wallet-provider";
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'ForesightX',
  description: 'AI-Powered Crypto Prediction Market',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <WalletProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
