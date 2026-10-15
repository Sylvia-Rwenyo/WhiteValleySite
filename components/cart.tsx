"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, X, Plus, Minus, Trash2, MessageCircle } from "lucide-react";

export interface CartItem {
  id: number;
  name: string;
  price?: number | string;
  image_url: string;
  quantity: number;
  collectionType?: "local" | "export";
  [key: string]: any;
}

const WHATSAPP_PHONE = "+254723105303";

// Helper functions for localStorage
export function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const item = localStorage.getItem("whitevalley_cart");
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Failed to load cart", error);
    return [];
  }
}

export function saveStoredCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("whitevalley_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart_updated"));
  } catch (error) {
    console.error("Failed to save cart", error);
  }
}

// Cart Modal Component rendered inside Header
export function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => setCart(getStoredCart());
    syncCart();

    window.addEventListener("cart_updated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener("cart_updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const updateQuantity = (id: number, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    setCart(updated);
    saveStoredCart(updated);
  };

  const removeFromCart = (id: number) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    saveStoredCart(updated);
  };

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let message = `Hello! I would like to inquire about ordering the following flowers:\n\n`;
    
    cart.forEach((item, index) => {
      const collectionLabel = item.collectionType === "export" ? "Wholesale Export" : "Retail Local";
      message += `${index + 1}. ${item.name} [${collectionLabel}] - Quantity: ${item.quantity}\n`;
    });

    message += `\nPlease let me know availability, final pricing, and delivery procedures. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-16 w-80 md:w-96 bg-white rounded-2xl border border-stone-200 p-5 shadow-xl z-50 text-slate-800">
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
        <h3 className="text-sm font-bold text-[#0f2e23] flex items-center gap-2">
          <ShoppingBag size={16} className="text-[#f4a261]" /> Your Shopping Basket
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label="Close cart"
        >
          <X size={18} />
        </button>
      </div>

      {cart.length === 0 ? (
        <p className="text-xs text-stone-500 py-6 text-center">
          Your cart is currently empty.
        </p>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {cart.map((item) => {
            const isExport = item.collectionType === "export";
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3"
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-stone-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-800 truncate">
                    {item.name}
                  </h4>
                  <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${isExport ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {isExport ? "Export" : "Local"}
                  </span>
                  {Number(item.price) > 0 && (
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      KSh {Number(item.price).toLocaleString()}
                    </p>
                  )}
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
            );
          })}

          <button
            onClick={handleWhatsAppOrder}
            className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <MessageCircle size={16} /> Inquire & Order via WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}