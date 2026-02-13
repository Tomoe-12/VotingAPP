import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/lib/language-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fresher Welcome Voting - King & Queen Election',
  description: 'Vote for your favorite King and Queen candidates for the fresher welcome event',
  icons: {
    icon: [
      {
        url: '/Paoh.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Paoh.png',
        media: '(prefers-color-scheme: dark)',
      },
      // {
      //   url: '/icon.svg',
      //   type: 'image/svg+xml',
      // },
    ],
    apple: '/Paoh.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
