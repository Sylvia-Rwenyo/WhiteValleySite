"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Check,
  Info,
  Search,
  X,
  Truck
} from "lucide-react";
import { getStoredCart, saveStoredCart, CartItem } from "@/components/cart";

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

export default function ExportPage() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [expandedFlowerIds, setExpandedFlowerIds] = useState<number[]>([]);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  useEffect(() => {
    async function fetchExportCollection() {
      try {
        const res = await fetch("https://whitevalley.co.ke/api/get_export_collection.php", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`);
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setFlowers(data);
          if (data.length > 0) {
            setSelectedFlower(data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching export collection from MySQL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExportCollection();
  }, []);

  const typeCounts: { [key: string]: number } = {};
  flowers.forEach((f) => {
    const types = (f.flower_type || f.category || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    types.forEach((t) => {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
  });

  const flowerTypes = Object.keys(typeCounts).sort(
    (a, b) => typeCounts[b] - typeCounts[a]
  );

  useEffect(() => {
    if (flowerTypes.length > 0 && !selectedType) {
      setSelectedType(flowerTypes[0]);
    }
  }, [flowerTypes, selectedType]);

  const addToCart = (flower: Flower, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const currentCart = getStoredCart();
    const existing = currentCart.find((item) => item.id === flower.id);
    
    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = currentCart.map((item) =>
        item.id === flower.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...currentCart, { ...flower, quantity: 1, collectionType: "export" }];
    }

    saveStoredCart(updatedCart);

    setAddedId(flower.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const toggleInfo = (flower: Flower, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFlower(flower);
    setExpandedFlowerIds((prev) =>
      prev.includes(flower.id)
        ? prev.filter((id) => id !== flower.id)
        : [...prev, flower.id]
    );
  };

  const filteredFlowers = flowers.filter((f) => {
    const query = searchQuery.toLowerCase();
    const typeVal = f.flower_type || f.category || "";

    const matchesSearch =
      f.name?.toLowerCase().includes(query) ||
      f.description?.toLowerCase().includes(query) ||
      typeVal.toLowerCase().includes(query);

    const flowerTypesArray = typeVal
      .split(",")
      .map((t) => t.trim().toLowerCase());
    const matchesType =
      !selectedType ||
      flowerTypesArray.includes(selectedType.toLowerCase());

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f8f6] text-slate-800">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-stone-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-full mb-2">
                <Truck size={14} /> International & Wholesale Export Quality
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#0f2e23]">
                Export Collection
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Explore our premium wholesale and export grade stems and bunches.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search export flowers..."
                  className="w-full pl-10 pr-10 py-2 bg-white border border-stone-200 rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {flowerTypes.map((type) => {
              const isSelected = selectedType.toLowerCase() === type.toLowerCase();
              const count = typeCounts[type];
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#0f2e23] text-white shadow-md ring-2 ring-[#0f2e23]/20"
                      : "bg-white text-stone-700 border border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <span>{type}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-52 bg-stone-200 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : filteredFlowers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-stone-200">
                <p className="text-stone-500 text-xs">
                  No export items found matching your selection.
                </p>
                {(searchQuery || selectedType) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      if (flowerTypes.length > 0) setSelectedType(flowerTypes[0]);
                    }}
                    className="mt-3 text-xs font-semibold text-[#f4a261] underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredFlowers.map((flower) => {
                  const isSelected = selectedFlower?.id === flower.id;
                  const isExpanded = expandedFlowerIds.includes(flower.id);
                  
                  const typeStr = (flower.flower_type || flower.category || "").toLowerCase();
                  const nameStr = (flower.name || "").toLowerCase();
                  const isPaddedFlower = typeStr.includes("carnation") || typeStr.includes("limonium") || nameStr.includes("carnation") || nameStr.includes("limonium");

                  return (
                    <div
                      key={flower.id}
                      onClick={() => setSelectedFlower(flower)}
                      className={`group cursor-pointer bg-white rounded-lg border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "border-[#f4a261] ring-2 ring-[#f4a261]/20 shadow-md"
                          : "border-stone-200 hover:border-stone-300 hover:shadow-sm"
                      }`}
                    >
                      <div>
                        <div className={`relative aspect-square overflow-hidden bg-white flex items-center justify-center ${isPaddedFlower ? "p-3 bg-white" : "bg-stone-100"}`}>
                          <img
                            src={flower.image_url}
                            alt={flower.name}
                            loading="lazy"
                            className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${isPaddedFlower ? "object-contain" : "object-cover"}`}
                          />
                          {Number(flower.price) > 0 && (
                            <span className="absolute bottom-1.5 right-1.5 bg-white/95 backdrop-blur-md text-[#0f2e23] text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-stone-100">
                              KSh {Number(flower.price).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 pt-1.5">
                          <h3 className="font-serif font-bold text-[11px] text-[#0f2e23] leading-tight line-clamp-1">
                            {flower.name}
                          </h3>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Stem:{" "}
                            <span className="font-semibold text-stone-700">
                              {flower.stem_length || "Standard"}
                            </span>
                          </p>

                          <p
                            className="text-[10px] text-stone-600 mt-1 leading-relaxed"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: isExpanded ? "unset" : 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {flower.description ||
                              "High-grade export flowers packaged for transport."}
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 pt-0 flex items-center justify-between gap-1.5 mt-1">
                        <button
                          onClick={(e) => addToCart(flower, e)}
                          className="flex-1 py-1.5 px-2 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all bg-[#0f2e23] hover:bg-[#194032] text-white"
                        >
                          {addedId === flower.id ? (
                            <>
                              <Check size={11} className="text-emerald-400" /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={11} /> Order
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleInfo(flower, e)}
                          className={`p-1.5 rounded-md border transition-colors ${
                            isExpanded
                              ? "bg-[#0f2e23] text-white border-[#0f2e23]"
                              : "text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                          title="Toggle Full Info"
                        >
                          <Info size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}