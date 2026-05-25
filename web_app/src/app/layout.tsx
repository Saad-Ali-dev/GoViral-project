import type { Metadata } from "next"
import "./globals.css"
import { poppins, inter } from "../lib/fonts"
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"
import { ClerkProvider } from "@clerk/nextjs"

export const metadata: Metadata = {
  title: "GoViral",
  description: "AI-Powered SEO for Short-Form Videos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable} ${inter.variable} font-inter`}>
          <Navbar />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
