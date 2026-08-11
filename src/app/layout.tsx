import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { getAnalyzeSiteConfig } from '../lib/siteConfig';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const site = getAnalyzeSiteConfig();

    return {
      title: site.metadataTitle,
      description: site.description,
    };
  } catch {
    return {
      title: 'Analyze Your Site',
      description: 'Gerçek zamanlı trafik analiz paneli',
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
