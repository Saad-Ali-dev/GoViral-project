"use client"

import Link from "next/link"
import { FaCircleXmark } from "react-icons/fa6"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import ConnectYouTubeButton from "./ConnectYouTubeButton"

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
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-white hover:text-[#C7161C] transition-colors"
          >
            <FaCircleXmark size={32} />
          </button>
        </div>

        {/* User Avatar - Top Center (only when signed in) */}
        <div className="flex justify-center mb-8">
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-24 h-24",
                },
              }}
            />
          </SignedIn>
        </div>

        {/* Navigation Links - Red Buttons */}
        <div className="flex flex-col space-y-6">
          <Link
            href="/"
            onClick={onClose}
            className="w-full bg-[#C7161C] hover:bg-[#C7161C]/90 text-white text-center font-semibold py-2 rounded hover:bg-opacity-90 transition-opacity"
          >
            Home
          </Link>
          <Link
            href="/videos"
            onClick={onClose}
            className="w-full bg-[#C7161C] hover:bg-[#C7161C]/90 text-white text-center font-semibold py-2 rounded hover:bg-opacity-90 transition-opacity"
          >
            Videos
          </Link>

          {/* Connect YouTube Button (only when signed in) */}
          <SignedIn>
            <ConnectYouTubeButton />
          </SignedIn>

          <SignedOut>
            <Link
              href="/sign-in"
              onClick={onClose}
              className="w-full bg-[#C7161C] hover:bg-[#C7161C]/90 text-white text-center font-semibold py-2 rounded hover:bg-opacity-90 transition-opacity"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              onClick={onClose}
              className="w-full bg-[#C7161C] hover:bg-[#C7161C]/90 text-white text-center font-semibold py-2 rounded hover:bg-opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </SignedOut>
        </div>
      </div>
    </>
  )
}
