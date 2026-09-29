"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Check,
  Info,
  ArrowRight,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface Flower {
  id: number;
  name: string;
  category: string;
  stem_length?: string;
  description?: string;
  image_url: string;
}

interface CartItem extends Flower {
  quantity: number;
}

export default function Home() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchFlowers() {
      try {
        const res = await fetch("/api/get_flowers.php");
        const data = await res.json();
        if (Array.isArray(data)) {
          setFlowers(data);
          if (data.length > 0) setSelectedFlower(data[0]);
        }
      } catch (err) {
        console.error("Error fetching flowers from MySQL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFlowers();
  }, []);

  const addToCart = (flower: Flower, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((item) => item.id === flower.id);
      if (existing) {
        return prev.map((item) =>
          item.id === flower.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...flower, quantity: 1 }];
    });

    setAddedId(flower.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const categories = [
    "All",
    ...Array.from(new Set(flowers.map((f) => f.category).filter(Boolean))),
  ];

  const filteredFlowers = flowers.filter((f) => {
    const matchesCategory =
      selectedCategory === "All" || f.category === selectedCategory;
    const nameMatch = f.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = f.description
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && (nameMatch || descMatch);
  });

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f8f6] text-slate-800">
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-stone-200">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#0f2e23]">
                Export Collection
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Browse export-ready floral stems and handcrafted arrangements.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#0f2e23] text-white px-5 py-2.5 rounded-full shadow-sm text-sm font-medium">
              <ShoppingBag size={18} className="text-[#f4a261]" />
              <span>Cart ({totalCartItems})</span>
            </div>
          </div>

          {/* Search & Category Filter Section */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                size={18}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flowers by name or details..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0f2e23]/20 shadow-sm"
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

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#0f2e23] text-white shadow-sm"
                      : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Collection Grid */}
            <div className="lg:col-span-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    No flowers found matching your query.
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                      }}
                      className="mt-3 text-xs font-semibold text-[#f4a261] underline"
                    >
                      Clear search and filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredFlowers.map((flower) => {
                    const isSelected = selectedFlower?.id === flower.id;
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
                            <span className="absolute top-3 left-3 bg-[#0f2e23]/80 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full">
                              {flower.category}
                            </span>
                          </div>

                          <div className="p-5">
                            <h3 className="font-serif font-bold text-lg text-slate-800 line-clamp-1">
                              {flower.name}
                            </h3>
                            <p className="text-xs text-stone-500 mt-1">
                              Stem Specs:{" "}
                              <span className="font-semibold text-stone-700">
                                {flower.stem_length || "Standard"}
                              </span>
                            </p>
                            <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed">
                              {flower.description ||
                                "Fresh, premium grade export flower stem harvested locally."}
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
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={14} /> Add to Cart
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedFlower(flower)}
                            className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
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

            {/* Right Column: Active Flower Spotlight */}
            <div className="lg:col-span-4 sticky top-20 space-y-6">
              {selectedFlower && (
                <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                      Selected Flower Spotlight
                    </span>
                  </div>

                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-stone-100">
                    <img
                      src={selectedFlower.image_url}
                      alt={selectedFlower.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h2 className="text-xl font-serif font-bold text-slate-800">
                    {selectedFlower.name}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-stone-500 my-2">
                    <span>
                      Category:{" "}
                      <strong className="text-stone-700">
                        {selectedFlower.category}
                      </strong>
                    </span>
                    <span>
                      Stem:{" "}
                      <strong className="text-stone-700">
                        {selectedFlower.stem_length || "Standard"}
                      </strong>
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed mb-6">
                    {selectedFlower.description ||
                      "Fresh, premium grade export flower stem harvested locally."}
                  </p>

                  <button
                    onClick={() => addToCart(selectedFlower)}
                    className="w-full py-3 bg-[#f4a261] hover:bg-[#e79250] text-[#0f2e23] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <ShoppingBag size={16} /> Add "{selectedFlower.name}" To Order
                  </button>
                </div>
              )}

              {/* Quick Explore List */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#f4a261]" /> More Flowers
                </h3>
                <div className="space-y-3">
                  {flowers.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedFlower(item)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors border border-transparent hover:border-stone-200"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-800 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-stone-500">
                          {item.stem_length || "Standard"}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-stone-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}