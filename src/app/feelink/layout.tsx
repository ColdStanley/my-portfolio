// src/app/feelink/layout.tsx
import React from 'react'

export const metadata = {
  title: 'Say I love you, apologize, bless, and thank – through an image with quotes.',
  description:
    'Express your feelings in a gentle and creative way. Upload an image, generate a quote, and share your message of love, apology, gratitude, or blessing.',
  openGraph: {
    title: 'Say I love you, apologize, bless, and thank – through an image with quotes.',
    description:
      'Express your feelings in a gentle and creative way. Upload an image, generate a quote, and share your message of love, apology, gratitude, or blessing.',
    url: 'https://www.stanleyhi.com/feelink',
    siteName: 'Feelink by StanleyHi',
    images: [
      {
        url: 'https://www.stanleyhi.com/og/feelink-cover.png',
        width: 1200,
        height: 650,
        alt: 'Feelink Cover Image',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Say I love you, apologize, bless, and thank – through an image with quotes.',
    description:
      'Express your feelings in a gentle and creative way. Upload an image, generate a quote, and share your message of love, apology, gratitude, or blessing.',
    images: ['https://www.stanleyhi.com/og/feelink-cover.png'],
  },
}

export default function FeelinkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
