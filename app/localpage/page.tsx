"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Info,
  Search,
  X,
  Truck,
  ShoppingBag
} from "lucide-react";
import { getStoredCart, saveStoredCart, CartItem } from "@/components/cart";

interface Flower {
  id: number;
  name: string;
  category?: string;
  flower_type?: string;
  occasion?: string;
  stem_length?: string;
  description?: string;
  price?: number | string;
  image_url: string;
}

export default function LocalPage() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [expandedFlowerIds, setExpandedFlowerIds] = useState<number[]>([]);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  useEffect(() => {
    async function fetchFlowers() {
      try {
        const res = await fetch("https://whitevalley.co.ke/api/get_flowers.php", {
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
        console.error("Error fetching flowers from MySQL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFlowers();
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
      updatedCart = [...currentCart, { ...flower, quantity: 1, collectionType: "local" }];
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
                <Truck size={14} /> Same-Day Delivery Across Nairobi
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#0f2e23]">
                Handcrafted Bouquets
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Order freshly-cut custom floral arrangements directly from us.
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
                  placeholder="Search bouquets..."
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-72 bg-stone-200 animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            ) : filteredFlowers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
                <p className="text-stone-500 text-sm">
                  No flower bouquets found matching your selection.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredFlowers.map((flower) => {
                  const isSelected = selectedFlower?.id === flower.id;
                  const isExpanded = expandedFlowerIds.includes(flower.id);

                  return (
                    <div
                      key={flower.id}
                      onClick={() => setSelectedFlower(flower)}
                      className={`group cursor-pointer bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "border-[#f4a261] ring-2 ring-[#f4a261]/20 shadow-lg"
                          : "border-stone-200 hover:border-stone-300 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                          <img
                            src={flower.image_url}
                            alt={flower.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {Number(flower.price) > 0 && (
                            <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-[#0f2e23] text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                              KSh {Number(flower.price).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="font-serif font-bold text-base text-[#0f2e23] leading-snug">
                            {flower.name}
                          </h3>
                          <p className="text-xs text-stone-500 mt-1">
                            Stem Specification:{" "}
                            <span className="font-semibold text-stone-700">
                              {flower.stem_length || "Standard Arrangement"}
                            </span>
                          </p>

                          <p
                            className="text-xs text-stone-600 mt-2.5 leading-relaxed"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: isExpanded ? "unset" : 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {flower.description ||
                              "Fresh, locally harvested bouquet arrangement hand-tied for fast local delivery."}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 flex items-center justify-between gap-3 mt-2">
                        <button
                          onClick={(e) => addToCart(flower, e)}
                          className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all bg-[#0f2e23] hover:bg-[#194032] text-white"
                        >
                          {addedId === flower.id ? (
                            <>
                              <Check size={14} className="text-emerald-400" />{" "}
                              Added to Cart
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} /> Order Bouquet
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleInfo(flower, e)}
                          className={`p-2.5 rounded-xl border transition-colors ${
                            isExpanded
                              ? "bg-[#0f2e23] text-white border-[#0f2e23]"
                              : "text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                          title="Toggle Full Info"
                        >
                          <Info size={16} />
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