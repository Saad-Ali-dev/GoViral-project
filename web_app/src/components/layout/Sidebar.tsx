"use client"

import Link from "next/link"
import { FaCircleXmark } from "react-icons/fa6"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[250px] bg-[#212121] z-50 transform transition-transform duration-300 ease-in-out flex flex-col p-6 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end mb-12">
          <button
            onClick={onClose}
            className="text-white hover:text-[#C7161C] transition-colors"
          >
            <FaCircleXmark size={32} />
          </button>
        </div>

        {/* Navigation Links - Red Buttons */}
        <div className="flex flex-col space-y-6">
          <Link
            href="/"
            onClick={onClose}
            className="w-full bg-[#C7161C] text-white text-center font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity"
          >
            Home
          </Link>
          <Link
            href="/videos"
            onClick={onClose}
            className="w-full bg-[#C7161C] text-white text-center font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity"
          >
            Videos
          </Link>
          <Link
            href="/login"
            onClick={onClose}
            className="w-full bg-[#C7161C] text-white text-center font-semibold py-3 rounded-lg hover:bg-opacity-90 transition-opacity"
          >
            Login
          </Link>
        </div>
      </div>
    </>
  )
}
