"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: number;
  partNo: string;
  description: string;
  displayPrice: number | null;
  priceStatus: "login" | "pending" | "visible";
  category: string;
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?important=true&limit=8")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []));
  }, []);

  if (!products.length) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border hair aspect-[3/4] animate-pulse bg-line/30" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {products.map((p, i) => (
        <Link
          key={p.id}
          href={`/products/${encodeURIComponent(p.partNo)}`}
          className="group border hair bg-paper p-5 hover:bg-edred hover:text-paper transition"
        >
          <div className="flex justify-between text-[10.5px] mono opacity-70">
            <span>{String(i + 1).padStart(2, "0")} / {products.length}</span>
            <span>{p.partNo}</span>
          </div>

          {/* Product placeholder */}
          <div className="mt-4 mb-4 aspect-[4/3] relative border hair"
            style={{ background: "repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0 4px, transparent 4px 10px), #F6F4EF" }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 90">
              <rect x="20" y="25" width="80" height="45" fill="none" stroke="currentColor" strokeWidth="1" opacity=".6" />
              <circle cx="60" cy="47" r="12" fill="none" stroke="#c00020" strokeWidth="1.5" />
              <circle cx="60" cy="47" r="2" fill="#c00020" />
            </svg>
          </div>

          <div className="display text-[18px] leading-[1.2] line-clamp-2">{p.description}</div>
          <div className="text-[11px] mono opacity-70 mt-1">{p.category}</div>

          <div className="mt-2">
            {p.priceStatus === "visible" && p.displayPrice ? (
              <span className="text-[12px] font-semibold">
                {new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(p.displayPrice)}
              </span>
            ) : p.priceStatus === "pending" ? (
              <span className="text-[11px] opacity-70">승인 대기 중</span>
            ) : (
              <span className="text-[11px] opacity-50">로그인 후 가격 확인</span>
            )}
          </div>

          <div className="mt-3 text-[11px] underline-red pb-0.5 inline-block">사양 보기 →</div>
        </Link>
      ))}
    </div>
  );
}
