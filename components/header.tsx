"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, MapPin, Phone, Menu, X } from "lucide-react";
import { getStoredCart, CartModal } from "./cart"; // Importing the cart from the same folder

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const updateCount = () => {
      const cart = getStoredCart();
      const count = cart.reduce((acc, item) => acc + item.quantity, 0);
      setTotalItems(count);
    };

    updateCount();
    window.addEventListener("cart_updated", updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener("cart_updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-[#0f2e23] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between relative">
        
        {/* Logo */}
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
          <Link
            href="/"
            className={`transition-colors ${isActive("/") ? "text-[#f4a261] font-semibold" : "hover:text-[#f4a261]"}`}
          >
            Home
          </Link>
          <Link
            href="/localpage"
            className={`transition-colors ${isActive("/localpage") ? "text-[#f4a261] font-semibold" : "hover:text-[#f4a261]"}`}
          >
            Local Collections
          </Link>
          <Link
            href="/export"
            className={`transition-colors ${isActive("/export") ? "text-[#f4a261] font-semibold" : "hover:text-[#f4a261]"}`}
          >
            Export Collections
          </Link>
          <Link
            href="https://www.google.com/maps/place/White+Valley+Florists/@-1.2806554,36.816033,16.79z/data=!4m6!3m5!1s0x182f116043dc1c79:0x98c7f4ef87505071!8m2!3d-1.2808115!4d36.8184125!16s%2Fg%2F11schlbs02?entry=ttu&g_ep=EgoyMDI2MTAxMi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-200 hover:text-[#f4a261] transition-colors"
          >
            Get Directions
          </Link>
        </nav>

        {/* Contact Info & Cart Button */}
        <div className="flex items-center gap-6">
          <ul className="hidden lg:flex items-center gap-5 text-xs text-stone-300 border-r border-[#255745] pr-6">
            <li className="flex items-center gap-1.5">
              <MapPin size={15} className="text-[#f4a261]" />
              <span>Nairobi, Kenya</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Phone size={15} className="text-[#f4a261]" />
              <a href="tel:+254723105303" className="hover:text-[#f4a261] transition-colors">
                +254 723 105 303
              </a>
            </li>
          </ul>

          {/* Cart Button (Appears automatically when items >= 1) */}
          {totalItems > 0 && (
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="flex items-center gap-2 bg-[#f4a261] hover:bg-[#e79350] text-[#0f2e23] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm relative"
            >
              <ShoppingBag size={16} />
              <span>Cart ({totalItems})</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-stone-200 p-1"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* THE CART MODAL: Rendered right inside the header wrapper */}
        <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#194032] px-4 py-4 space-y-3 border-t border-[#255745] text-sm">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block ${isActive("/") ? "text-[#f4a261] font-semibold" : "text-stone-300"}`}
          >
            Home
          </Link>
          <Link
            href="/localpage"
            onClick={() => setMobileMenuOpen(false)}
            className={`block ${isActive("/localpage") ? "text-[#f4a261] font-semibold" : "text-stone-300"}`}
          >
            Local Collections
          </Link>
          <Link
            href="/export"
            onClick={() => setMobileMenuOpen(false)}
            className={`block ${isActive("/export") ? "text-[#f4a261] font-semibold" : "text-stone-300"}`}
          >
            Export Collections
          </Link>
          <Link
            href="https://www.google.com/maps/place/White+Valley+Florists/@-1.2806554,36.816033,16.79z/data=!4m6!3m5!1s0x182f116043dc1c79:0x98c7f4ef87505071!8m2!3d-1.2808115!4d36.8184125!16s%2Fg%2F11schlbs02?entry=ttu&g_ep=EgoyMDI2MTAxMi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-stone-300 hover:text-[#f4a261] transition-colors"
          >
            Get Directions
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