// lib/fonts.ts
import { Poppins, Inter } from 'next/font/google'

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600'], // Semibold only
  variable: '--font-poppins',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400'], // Regular only
  variable: '--font-inter',
})
