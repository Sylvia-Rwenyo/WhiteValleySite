"use client";

import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0b2119] text-stone-300 pt-12 pb-8 border-t border-[#183a2d]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#183a2d]/80 text-xs leading-relaxed">
        
        {/* Brand Info & Logo */}
        <div className="space-y-3">
          <Link href="/" className="inline-block">
            <img
              src="/logo.png"
              alt="White Valley Florist"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="text-stone-400">
            In need of flowers for any occasion? Try White Valley Florist, we craft and deliver beautiful arrangements tailored to your desire.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[#f4a261] font-semibold text-sm mb-3 font-serif">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-stone-400">
            <li>
              <Link href="/" className="hover:text-[#f4a261] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/export" className="hover:text-[#f4a261] transition-colors">
                Export Collection
              </Link>
            </li>
            <li>
              <Link href="#about" className="hover:text-[#f4a261] transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#contact" className="hover:text-[#f4a261] transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Product Categories */}
        <div>
          <h4 className="text-[#f4a261] font-semibold text-sm mb-3 font-serif">
            Flower Categories
          </h4>
          <ul className="space-y-2 text-stone-400">
            <li>Premium Fresh Roses</li>
            <li>Summer Flowers & Greens</li>
            <li>Chrysanthemums & Mums</li>
            <li>Carnations & Dianthus</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-2.5">
          <h4 className="text-[#f4a261] font-semibold text-sm mb-3 font-serif">
            Get in Touch
          </h4>
          <p className="flex items-center gap-2 text-stone-400">
            <Phone size={14} className="text-[#f4a261] flex-shrink-0" />
            <a href="tel:+254723105303" className="hover:text-[#f4a261] transition-colors">
              +254 723 105 303
            </a>
          </p>
          <p className="flex items-center gap-2 text-stone-400">
            <Mail size={14} className="text-[#f4a261] flex-shrink-0" />
            <a href="mailto:info@whitevalley.co.ke" className="hover:text-[#f4a261] transition-colors">
              info@whitevalley.co.ke
            </a>
          </p>
          <div className="flex items-start gap-2 text-stone-400">
            <MapPin size={14} className="text-[#f4a261] flex-shrink-0 mt-0.5" />
            <span>Muindi Mbingu Street, Nairobi, Kenya</span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500">
        <p>© {new Date().getFullYear()} White Valley Florist. All rights reserved.</p>
        <p className="flex items-center gap-1 mt-2 sm:mt-0">
          Crafted with care for fresh floral deliveries globally.
        </p>
      </div>
    </footer>
  );
}