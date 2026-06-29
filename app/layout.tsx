import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tom Quantrill - Digital Consultancy, Zell am See',
  description: 'Simple solutions for digital direction. Digital consultancy based in Zell am See.',
  openGraph: {
    type: 'website',
    url: 'https://www.quantrill.me',
    title: 'Tom Quantrill - Digital Consultancy, Zell am See',
    description: 'Simple solutions for digital direction. Digital consultancy based in Zell am See.',
    images: ['https://www.quantrill.me/cover.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tom Quantrill - Digital Consultancy, Zell am See',
    description: 'Simple solutions for digital direction. Digital consultancy based in Zell am See.',
    images: ['https://www.quantrill.me/cover.jpg'],
  },
  alternates: {
    canonical: 'https://www.quantrill.me',
    languages: {
      en: 'https://www.quantrill.me/',
      de: 'https://www.quantrill.me/?lang=de',
      'x-default': 'https://www.quantrill.me/',
    },
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

const ldJson = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Tom Quantrill - Digital Consultancy',
  description: 'Simple solutions for digital direction. Digital consultancy based in Zell am See.',
  url: 'https://www.quantrill.me',
  telephone: '+436608375882',
  email: 'tom@quantrill.me',
  founder: { '@type': 'Person', name: 'Tom Quantrill' },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Zell am See',
    addressRegion: 'Salzburg',
    addressCountry: 'AT',
  },
  image: 'https://www.quantrill.me/profile.jpg',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/cover.jpg" type="image/jpeg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
