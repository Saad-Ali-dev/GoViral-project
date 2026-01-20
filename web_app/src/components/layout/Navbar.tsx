"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { FaBars } from "react-icons/fa6"
import Sidebar from "./Sidebar"

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 bg-[#212121] text-white sticky top-0 z-30 shadow-md">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-white.png"
                alt="GoViral"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="font-poppins font-semibold text-xl tracking-tight">
                GoViral
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link
            href="/"
            className="px-4 py-2 bg-[#C7161C] rounded text-white font-medium hover:bg-opacity-90 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/videos"
            className="px-4 py-2 bg-[#C7161C] rounded text-white font-medium hover:bg-opacity-90 transition-colors"
          >
            Videos
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-[#C7161C] rounded text-white font-medium hover:bg-opacity-90 transition-colors"
          >
            Login/Signup
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open menu"
        >
          <FaBars size={24} />
        </button>
      </nav>

      {/* Mobile Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  )
}
