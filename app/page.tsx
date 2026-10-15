"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  ShoppingBag, 
  Flower, 
  Globe, 
  Gift, 
  ArrowRight
} from "lucide-react";

interface Flower {
  id: number;
  name: string;
  category?: string;
  flower_type?: string;
  stem_length?: string;
  description?: string;
  price?: number | string;
  image_url: string;
}

export default function HomePage() {
  const [localFlowers, setLocalFlowers] = useState<Flower[]>([]);
  const [exportFlowers, setExportFlowers] = useState<Flower[]>([]);
  
  const [localIndex, setLocalIndex] = useState(0);
  const [exportIndex, setExportIndex] = useState(0);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const resLocal = await fetch("https://whitevalley.co.ke/api/get_flowers.php", {
          headers: { Accept: "application/json" },
        });
        const dataLocal = await resLocal.json();
        if (Array.isArray(dataLocal)) setLocalFlowers(dataLocal);

        const resExport = await fetch("https://whitevalley.co.ke/api/get_export_collection.php", {
          headers: { Accept: "application/json" },
        });
        const dataExport = await resExport.json();
        if (Array.isArray(dataExport)) setExportFlowers(dataExport);
      } catch (err) {
        console.error("Error fetching slideshow flowers:", err);
      }
    }
    fetchCollections();
  }, []);

  // Smooth horizontal auto-advance slideshows
  useEffect(() => {
    if (localFlowers.length === 0 && exportFlowers.length === 0) return;

    const localTimer = setInterval(() => {
      setLocalFlowers((prev) => {
        if (prev.length === 0) return prev;
        setLocalIndex((curr) => (curr + 1) % prev.length);
        return prev;
      });
    }, 4000);

    const exportTimer = setInterval(() => {
      setExportFlowers((prev) => {
        if (prev.length === 0) return prev;
        setExportIndex((curr) => (curr + 1) % prev.length);
        return prev;
      });
    }, 4500);

    return () => {
      clearInterval(localTimer);
      clearInterval(exportTimer);
    };
  }, [localFlowers.length, exportFlowers.length]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f8f6] text-slate-800">
      
      {/* Hero Section: Clean, Centered Editorial Layout */}
      <section className="relative bg-[#0f2e23] text-white overflow-hidden py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#f4a261]/20 text-[#f4a261] text-xs font-semibold rounded-full uppercase tracking-wider">
            <MapPin size={14} /> Second Floor, Retford House, Muindi Mbingu Street
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-tight">
            White Valley Florist & General Merchant
          </h1>
          
          <p className="text-stone-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Located within Nairobi's Central Business District, we cater to both the local retail market with handcrafted same-day floral arrangements and international commercial buyers seeking premium Kenyan export flowers.
          </p>

          {/* Shop Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/localpage"
              className="inline-flex items-center gap-2 bg-[#f4a261] hover:bg-[#e79350] text-[#0f2e23] px-6 py-3.5 rounded-xl text-xs md:text-sm font-bold transition-colors shadow-sm"
            >
              <ShoppingBag size={16} /> Shop Retail / Local <ArrowRight size={15} />
            </Link>

            <Link
              href="/export"
              className="inline-flex items-center gap-2 bg-[#255745] hover:bg-[#1d4737] text-white px-6 py-3.5 rounded-xl text-xs md:text-sm font-bold transition-colors shadow-sm border border-white/10"
            >
              <Globe size={16} className="text-[#f4a261]" /> Shop Wholesale / Export <ArrowRight size={15} />
            </Link>
          </div>

        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#f4a261]">
            What We Offer
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#0f2e23] mt-1">
            Flower Consolidator Services
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#0f2e23] flex items-center justify-center font-bold">
              <Flower size={22} />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-800">Custom Arrangements</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Handcrafted bouquets, premium-grade local flower orders, pure white and crimson red chrysanthemums, and fresh baby's breath fillers.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-[#f4a261] flex items-center justify-center font-bold">
              <Gift size={22} />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-800">Special Occasion Decor</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Full-service wedding floral decoration, vibrant office arrangements, and customized funeral wreaths tailored to your exact needs.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#0f2e23] flex items-center justify-center font-bold">
              <Globe size={22} />
            </div>
            <h3 className="font-serif font-bold text-lg text-slate-800">International Export</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Wholesale sourcing, collection, and commercial distribution of fresh Kenyan flowers for international buyers and global transport.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}