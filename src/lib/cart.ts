import type { ProductSize } from "./types";

export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  size: ProductSize;
  color?: string;
  price: number;
}

export function cartItemKey(item: Pick<CartItem, "productSlug" | "size" | "color">): string {
  return `${item.productSlug}::${item.size}::${item.color ?? ""}`;
}
