"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type CartItem, cartItemKey } from "@/lib/cart";

interface CartState {
  items: CartItem[];
  count: number;
  subtotalPix: number;
  subtotalCard: number;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (slug: string, size: string, color?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = "nyx_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupt data */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const key = cartItemKey(item);
      const exists = prev.find((i) => cartItemKey(i) === key);
      if (exists) return prev;
      return [...prev, item];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((slug: string, size: string, color?: string) => {
    setItems((prev) =>
      prev.filter((i) => cartItemKey(i) !== cartItemKey({ productSlug: slug, size: size as CartItem["size"], color }))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = items.length;
  const subtotalPix = items.reduce((sum, i) => sum + i.pricePix, 0);
  const subtotalCard = items.reduce((sum, i) => sum + i.priceCard, 0);

  return (
    <CartContext.Provider
      value={{ items, count, subtotalPix, subtotalCard, isOpen, addItem, removeItem, clearCart, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
