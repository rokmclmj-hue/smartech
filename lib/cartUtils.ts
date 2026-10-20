type CartItem = {
  productId: number;
  partNo: string;
  description: string;
  quantity: number;
};

// "/#cart" 링크의 onClick — 이미 홈이면 이동 없이 QuoteBar에 신호를 보내 카트를 연다.
// 다른 페이지면 그대로 "/#cart"로 이동하고 QuoteBar가 주소를 보고 연다(2026-10-20)
export function onCartLinkClick(e: { preventDefault(): void }) {
  if (window.location.pathname !== "/") return;
  e.preventDefault();
  window.dispatchEvent(new Event("openQuoteCart"));
}

export async function addToCartByPartNo(
  partNo: string,
  description: string,
  qty = 1
): Promise<"ok" | "not_found" | "error"> {
  try {
    const res = await fetch(`/api/products/lookup?partNo=${encodeURIComponent(partNo)}`);
    if (res.status === 404) return "not_found";
    if (!res.ok) return "error";
    const product: { id: number; partNo: string; description: string } = await res.json();

    const stored: CartItem[] = JSON.parse(localStorage.getItem("quoteCart") ?? "[]");
    const existing = stored.find((i) => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      stored.push({ productId: product.id, partNo: product.partNo, description, quantity: qty });
    }
    localStorage.setItem("quoteCart", JSON.stringify(stored));
    window.dispatchEvent(new Event("quoteCartUpdated"));
    return "ok";
  } catch {
    return "error";
  }
}
