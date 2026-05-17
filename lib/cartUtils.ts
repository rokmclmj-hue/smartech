type CartItem = {
  productId: number;
  partNo: string;
  description: string;
  quantity: number;
};

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
