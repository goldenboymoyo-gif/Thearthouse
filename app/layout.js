import './globals.css';
import { Open_Sans } from 'next/font/google';
import SiteChrome from '@/components/SiteChrome';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { CONTACT, SITE, STAY_INFO } from '@/lib/site';

// Self-hosted by next/font at build time: no render-blocking third-party
// stylesheet, no layout shift (automatic font fallback metrics) and one
// variable font file instead of seven separate weights from Google Fonts.
const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: '%s - The Art House Victoria Falls',
  },
  description: SITE.description,
  keywords: SITE.keywords,
  alternates: { canonical: '/' },
  icons: { icon: SITE.favicon },
  openGraph: {
    siteName: SITE.name,
    type: 'website',
    url: '/',
    title: SITE.title,
    description: SITE.description,
    locale: 'en_GB',
    images: [{ url: SITE.shareImage, width: 1200, height: 630, alt: 'The Art House Victoria Falls' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Art House Victoria Falls',
    description: SITE.description,
    images: [SITE.shareImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: '#019875',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-ZA" dir="ltr" className={openSans.variable}>
      <head>
        <link rel="preconnect" href={SITE.url} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['LodgingBusiness', 'VacationRental'],
              '@id': `${SITE.url}/#lodging`,
              name: SITE.name,
              alternateName: 'The Art House',
              description: SITE.description,
              url: SITE.url,
              image: [`${SITE.url}${SITE.shareImage}`],
              logo: `${SITE.url}${SITE.logo}`,
              telephone: '+263-77-260-6233',
              email: CONTACT.email,
              address: {
                '@type': 'PostalAddress',
                streetAddress: '360 Gibson Road',
                addressLocality: 'Victoria Falls',
                addressRegion: 'Matabeleland North',
                addressCountry: 'ZW',
              },
              geo: { '@type': 'GeoCoordinates', latitude: -17.922999, longitude: 25.8270921 },
              hasMap: CONTACT.mapsUrl,
              sameAs: [CONTACT.facebook, CONTACT.instagram],
              priceRange: `From ${STAY_INFO.rateFrom} per night`,
              currenciesAccepted: 'USD',
              checkinTime: '14:00',
              checkoutTime: '10:00',
              numberOfRooms: 4,
              occupancy: { '@type': 'QuantitativeValue', maxValue: 8 },
              petsAllowed: true,
              containsPlace: {
                '@type': 'Accommodation',
                name: 'The Art House – whole house',
                numberOfBedrooms: 4,
                numberOfBathroomsTotal: 3,
                occupancy: { '@type': 'QuantitativeValue', maxValue: 8 },
                bed: [
                  { '@type': 'BedDetails', typeOfBed: 'King', numberOfBeds: 2 },
                  { '@type': 'BedDetails', typeOfBed: 'Double', numberOfBeds: 1 },
                  { '@type': 'BedDetails', typeOfBed: 'Single', numberOfBeds: 2 },
                ],
              },
              amenityFeature: [
                'Private swimming pool',
                'Outdoor hot tub and shower',
                'WiFi',
                'Netflix',
                'Air conditioning',
                'Self-catering kitchen',
                'Braai / barbecue',
                'Backup solar power',
                'Backup water supply',
                'Daily housekeeping',
                'Pet friendly',
                'Cook or ready-cooked meals on request',
              ].map((name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
            }),
          }}
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
