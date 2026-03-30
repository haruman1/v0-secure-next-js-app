import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from './providers';
import '../styles/globals.css';

import { Plus_Jakarta_Sans } from "next/font/google";

const PoppinsFont = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400","500","600","700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: 'Medical Integrated Evacuation',
  description: 'platform informasi dan pengelolaan evakuasi pasien secara digital.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${PoppinsFont.className} ${jakarta.className} antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}



