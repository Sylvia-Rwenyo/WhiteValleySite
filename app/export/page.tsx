"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Check,
  Info,
  Search,
  X,
  Truck,
  MessageCircle,
  Plus,
  Minus,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  Tag
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

interface CartItem extends Flower {
  quantity: number;
}

export default function Home({ cartCount = 0 }: { cartCount?: number }) {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [expandedFlowerIds, setExpandedFlowerIds] = useState<number[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter state for export collection types
  const [selectedType, setSelectedType] = useState<string>("All");

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCategoryOpenMobile, setIsCategoryOpenMobile] = useState<boolean>(false);

  const WHATSAPP_PHONE = "+254723105303";

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
          if (data.length > 0) setSelectedFlower(data[0]);
        }
      } catch (err) {
        console.error("Error fetching export collection from MySQL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExportCollection();
  }, []);

  // Extract unique Flower Types (Splitting comma-separated values)
  const flowerTypes = [
    "All",
    ...Array.from(
      new Set(
        flowers
          .flatMap((f) => (f.flower_type || f.category || "").split(","))
          .map((item) => item.trim())
          .filter(Boolean)
      )
    ),
  ];

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

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
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

  // Combined Search and Type Filter
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
      selectedType === "All" ||
      flowerTypesArray.includes(selectedType.toLowerCase());

    return matchesSearch && matchesType;
  });

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let message = `Hello! I would like to inquire about wholesale ordering from your Export Collection:\n\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} - Quantity: ${item.quantity}\n`;
    });

    message += `\nPlease let me know the availability, wholesale pricing, and shipping/export procedures. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`, "_blank");
  };

  const CartBox = () => (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-md transition-all">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
        <h3 className="text-sm font-bold text-[#0f2e23] flex items-center gap-2">
          <ShoppingBag size={16} className="text-[#f4a261]" /> Your Wholesale Basket
        </h3>
        <button
          onClick={() => setIsCartOpen(false)}
          className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          title="Close Cart"
        >
          <X size={18} />
        </button>
      </div>

      {cart.length === 0 ? (
        <p className="text-xs text-stone-500 py-4 text-center">
          Your cart is currently empty.
        </p>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3"
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
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1 bg-stone-100 rounded hover:bg-stone-200 text-stone-700"
                >
                  <Minus size={12} />
                </button>
                <span className="text-xs font-bold w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1 bg-stone-100 rounded hover:bg-stone-200 text-stone-700"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1 text-rose-500 hover:bg-rose-50 rounded ml-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleWhatsAppOrder}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <MessageCircle size={16} /> Inquire & Order via WhatsApp
          </button>
        </div>
      )}
    </div>
  );

  const CategoriesList = () => (
    <div className="space-y-3">
      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
        <Tag size={12} /> Filter by Flower Type
      </div>
      <div className="space-y-1.5 mt-2">
        {flowerTypes.map((item) => {
          const count =
            item === "All"
              ? flowers.length
              : flowers.filter((f) => {
                  const field = f.flower_type || f.category;
                  const itemsArr = (field || "")
                    .split(",")
                    .map((val) => val.trim().toLowerCase());
                  return itemsArr.includes(item.toLowerCase());
                }).length;

          const isActive = selectedType.toLowerCase() === item.toLowerCase();

          return (
            <button
              key={item}
              onClick={() => {
                setSelectedType(item);
                setIsCategoryOpenMobile(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#0f2e23] text-white font-semibold"
                  : "hover:bg-stone-50 text-stone-700 border border-transparent hover:border-stone-200"
              }`}
            >
              <span>{item}</span>
              <span
                className={`px-2 py-0.5 text-[10px] rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

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
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="flex items-center gap-2 bg-[#0f2e23] hover:bg-[#194032] text-white px-5 py-2.5 rounded-full shadow-sm text-sm font-medium transition-colors"
              >
                <ShoppingBag size={18} className="text-[#f4a261]" />
                <span>Cart ({totalCartItems})</span>
              </button>

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

          {isCartOpen && (
            <div className="block lg:hidden mb-6">
              <CartBox />
            </div>
          )}

          {/* Mobile Category Dropdown */}
          <div className="block lg:hidden mb-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
              <button
                onClick={() => setIsCategoryOpenMobile(!isCategoryOpenMobile)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-700"
              >
                <span className="flex items-center gap-2">
                  <Filter size={14} className="text-[#f4a261]" /> Filter Collection
                </span>
                {isCategoryOpenMobile ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isCategoryOpenMobile && (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <CategoriesList />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-64 bg-stone-200 animate-pulse rounded-2xl"
                    />
                  ))}
                </div>
              ) : filteredFlowers.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
                  <p className="text-stone-500 text-sm">
                    No export items found matching your selection.
                  </p>
                  {(searchQuery || selectedType !== "All") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedType("All");
                      }}
                      className="mt-3 text-xs font-semibold text-[#f4a261] underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFlowers.map((flower) => {
                    const isSelected = selectedFlower?.id === flower.id;
                    const isExpanded = expandedFlowerIds.includes(flower.id);
                    const flowerBadge = flower.flower_type || flower.category;

                    return (
                      <div
                        key={flower.id}
                        onClick={() => setSelectedFlower(flower)}
                        className={`group cursor-pointer bg-white rounded-xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "border-[#f4a261] ring-2 ring-[#f4a261]/20 shadow-lg"
                            : "border-stone-200 hover:border-stone-300 hover:shadow-md"
                        }`}
                      >
                        <div>
                          {/* Adjusted aspect ratio for sharper, clean framing */}
                          <div className="relative aspect-[16/11] overflow-hidden bg-stone-100">
                            <img
                              src={flower.image_url}
                              alt={flower.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                              {flowerBadge && (
                                <span className="bg-[#0f2e23]/80 backdrop-blur-md text-white text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full">
                                  {flowerBadge}
                                </span>
                              )}
                            </div>
                            {Number(flower.price) > 0 && (
                              <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md text-[#0f2e23] text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                                KSh {Number(flower.price).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Compact padding so text doesn't feel squished */}
                          <div className="p-3.5">
                            <h3 className="font-serif font-bold text-sm text-slate-800 line-clamp-1">
                              {flower.name}
                            </h3>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              Stem:{" "}
                              <span className="font-semibold text-stone-700">
                                {flower.stem_length || "Standard"}
                              </span>
                            </p>

                            <p
                              className="text-[11px] text-stone-600 mt-2 leading-relaxed"
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

                        <div className="p-3.5 pt-0 flex items-center justify-between gap-2 mt-1">
                          <button
                            onClick={(e) => addToCart(flower, e)}
                            className="flex-1 py-2 px-2.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all bg-[#0f2e23] hover:bg-[#194032] text-white"
                          >
                            {addedId === flower.id ? (
                              <>
                                <Check size={13} className="text-emerald-400" />{" "}
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={13} /> Order
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => toggleInfo(flower, e)}
                            className={`p-2 rounded-lg border transition-colors ${
                              isExpanded
                                ? "bg-[#0f2e23] text-white border-[#0f2e23]"
                                : "text-stone-600 border-stone-200 hover:bg-stone-100"
                            }`}
                            title="Toggle Full Info"
                          >
                            <Info size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1 space-y-6 [scrollbar-width:thin] [scrollbar-color:#d6d3d1_transparent]">
              {isCartOpen && <CartBox />}

              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-1.5">
                  <Filter size={14} className="text-[#f4a261]" /> Filter Collection
                </h3>
                <CategoriesList />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}