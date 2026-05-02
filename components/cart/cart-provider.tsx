"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type CartItem = {
  productId?: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  variantName?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type CartContextValue = {
  isReady: boolean;
  items: CartItem[];
  buyNowItem: CartItem | null;
  cartCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "lineTotal">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  startBuyNow: (item: Omit<CartItem, "lineTotal">) => void;
  clearBuyNow: () => void;
};

const CART_STORAGE_KEY = "ansla-cart-items";
const BUY_NOW_STORAGE_KEY = "ansla-buy-now-item";

const CartContext = createContext<CartContextValue | null>(null);

function buildItemKey(item: Pick<CartItem, "productSlug" | "variantName" | "size">) {
  return `${item.productSlug}::${item.variantName || "default"}::${item.size || "default-size"}`;
}

function withLineTotal(item: Omit<CartItem, "lineTotal">): CartItem {
  return {
    ...item,
    lineTotal: item.quantity * item.unitPrice
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(null);

  useEffect(() => {
    try {
      const rawItems = localStorage.getItem(CART_STORAGE_KEY);
      const rawBuyNow = localStorage.getItem(BUY_NOW_STORAGE_KEY);

      if (rawItems) {
        setItems(JSON.parse(rawItems) as CartItem[]);
      }

      if (rawBuyNow) {
        setBuyNowItem(JSON.parse(rawBuyNow) as CartItem);
      }
    } catch {
      setItems([]);
      setBuyNowItem(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (buyNowItem) {
      localStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(buyNowItem));
    } else {
      localStorage.removeItem(BUY_NOW_STORAGE_KEY);
    }
  }, [buyNowItem]);

  const value = useMemo<CartContextValue>(() => {
    return {
      isReady,
      items,
      buyNowItem,
      cartCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
      addItem(item) {
        const nextItem = withLineTotal(item);
        const nextKey = buildItemKey(nextItem);

        setItems((current) => {
          const existing = current.find((entry) => buildItemKey(entry) === nextKey);

          if (!existing) {
            return [...current, nextItem];
          }

          return current.map((entry) =>
            buildItemKey(entry) === nextKey
              ? {
                  ...entry,
                  quantity: entry.quantity + nextItem.quantity,
                  lineTotal: (entry.quantity + nextItem.quantity) * entry.unitPrice
                }
              : entry
          );
        });
      },
      updateQuantity(key, quantity) {
        setItems((current) =>
          current.map((entry) =>
            buildItemKey(entry) === key
              ? {
                  ...entry,
                  quantity,
                  lineTotal: quantity * entry.unitPrice
                }
              : entry
          )
        );
      },
      removeItem(key) {
        setItems((current) => current.filter((entry) => buildItemKey(entry) !== key));
      },
      clearCart() {
        setItems([]);
      },
      startBuyNow(item) {
        setBuyNowItem(withLineTotal(item));
      },
      clearBuyNow() {
        setBuyNowItem(null);
      }
    };
  }, [buyNowItem, isReady, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart harus dipakai di dalam CartProvider.");
  }

  return context;
}

export function getCartItemKey(
  item: Pick<CartItem, "productSlug" | "variantName" | "size">
) {
  return buildItemKey(item);
}
