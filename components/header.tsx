"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, MapPin, Phone, Menu } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#0f2e23] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* Real Logo Image */}
        <div className="flex-shrink-0">
          <Link href="/">
            <img
              src="/logo.png"
              alt="White Valley"
              className="h-12 w-auto object-contain hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-200">
          <Link href="/" className="text-[#f4a261] font-semibold">
            Home
          </Link>
          <Link href="/export" className="hover:text-[#f4a261]  transition-colors">
            Export Collections
          </Link>
          <Link href="#about" className="hover:text-[#f4a261] transition-colors">
            About
          </Link>
          <Link href="#contact" className="hover:text-[#f4a261] transition-colors">
            Contact
          </Link>
        </nav>

        {/* Contact Info & Cart Button */}
        <div className="flex items-center gap-6">
          {/* Contact Items */}
          <ul className="hidden lg:flex items-center gap-5 text-xs text-stone-300 border-r border-[#255745] pr-6">
            <li className="flex items-center gap-1.5">
              <MapPin size={15} className="text-[#f4a261]" />
              <span>Nairobi, Kenya</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Phone size={15} className="text-[#f4a261]" />
              <a
                href="tel:+254723105303"
                className="hover:text-[#f4a261] transition-colors"
              >
                +254 723 105 303
              </a>
            </li>
          </ul>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-stone-200 p-1"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#194032] px-4 py-4 space-y-3 border-t border-[#255745] text-sm">
          <Link href="/" className="block text-[#f4a261] font-semibold ">
            Home
          </Link>
          <Link href="/export" className="block text-white  font-medium">
            Export
          </Link>
          <Link href="#about" className="block text-stone-300">
            About
          </Link>
          <Link href="#contact" className="block text-stone-300">
            Contact
          </Link>

          <div className="pt-3 border-t border-[#255745] text-xs space-y-2 text-stone-300">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#f4a261]" />
              <span>Nairobi, Kenya</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#f4a261]" />
              <a href="tel:+254723105303">+254 723 105 303</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}