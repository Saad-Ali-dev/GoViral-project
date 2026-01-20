import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { poppins, inter } from "../lib/fonts"

export const metadata: Metadata = {
  title: "GoViral",
  description: "Grow on Youtube with AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} font-inter`}>
        {children}
      </body>
    </html>
  )
}
