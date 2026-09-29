import './globals.css';
import SiteChrome from '@/components/SiteChrome';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { SITE } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'The Art House Victoria Falls - 4 Bedroom self-catering accommodation',
    template: '%s - The Art House Victoria Falls',
  },
  description: SITE.description,
  keywords: SITE.keywords,
  icons: { icon: SITE.favicon },
  openGraph: {
    siteName: SITE.name,
    type: 'website',
    images: [{ url: SITE.shareImage }],
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: '#019875',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
        />
      </head>
      <body>
        <SiteChrome />
        {children}
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
