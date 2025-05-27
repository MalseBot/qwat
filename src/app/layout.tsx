// import { Cairo } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

// Define your local font
const myFont = localFont({
  src: [
    {
      path: '../../public/fonts/IBMPlexSansArabic-ExtraLight.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSansArabic-light.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSansArabic-Thin.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSansArabic-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSansArabic-medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSansArabic-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/IBMPlexSansArabic-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    // Add more variations as needed
  ],
  display: 'swap',
  variable: '--font-myfont',
})

// Or use Cairo from Google Fonts for Arabic support
// const cairo = Cairo({
//   subsets: ['arabic'],
//   display: 'swap',
//   variable: '--font-cairo',
// })

export const metadata: Metadata = {
  title: 'قوات',
  description: 'شؤون مجندين قوات الامنا',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // <html lang="ar" dir="rtl" className={`${myFont.variable} ${cairo.variable}`}>
    <html lang="ar" dir="rtl" className={`${myFont.variable}`}>
      <body className="font-myfont">{children}</body>
    </html>
  )
}
