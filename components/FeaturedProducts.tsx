import Link from "next/link";
import { prisma } from "@/lib/db";

function imageForCategory(category: string): string {
  const c = (category ?? "").toLowerCase();
  if (c.includes("rv") || c.includes("소형rv")) return "/images/products/rv.jpeg";
  if (c.includes("e2s")) return "/images/products/e2s.png";
  if (c.includes("e2m")) return "/images/products/e2m.png";
  if (c.includes("nes")) return "/images/products/nes.jpeg";
  if (c.includes("nxds") || c.includes("xds")) return "/images/products/xds.jpeg";
  if (c.includes("eh") || c.includes("부스터")) return "/images/products/eh.jpeg";
  if (c.includes("gxs")) return "/images/products/gxs.jpeg";
  if (c.includes("exs")) return "/images/products/exs.jpeg";
  if (c.includes("ixh") || c.includes("ixl")) return "/images/products/ixh-ixl.jpeg";
  if (c.includes("nxri")) return "/images/products/nxri.jpeg";
  if (c.includes("eld") || c.includes("리크")) return "/images/products/eld500.jpeg";
  if (c.includes("next") && c.includes("station")) return "/images/products/t-station.jpeg";
  if (c.includes("stp")) return "/images/products/next-m.jpeg";
  if (c.includes("터보") || c.includes("next")) return "/images/products/next.png";
  if (c.includes("apg") || c.includes("aim") || c.includes("wrg") || c.includes("게이지")) return "/images/products/gauges-indirect.png";
  if (c.includes("p4") || c.includes("p5") || c.includes("디스플레이")) return "/images/products/gauges-mechanical.png";
  if (c.includes("tic") || c.includes("adc") || c.includes("컨트롤러")) return "/images/products/controllers.png";
  if (c.includes("emf") || c.includes("오일") || c.includes("ultra") || c.includes("피팅")) return "/images/products/hardware.png";
  return "/images/products/rv.jpeg";
}

export default async function FeaturedProducts() {
  // Pick 8 diverse "important" products server-side so images render in initial HTML
  const all = await prisma.product.findMany({
    where: { isImportant: true },
    orderBy: [{ partNo: "asc" }],
  });
  const seen = new Set<string>();
  const products: typeof all = [];
  for (const p of all) {
    const key = p.category ?? "기타";
    if (seen.has(key)) continue;
    seen.add(key);
    products.push(p);
    if (products.length >= 8) break;
  }

  if (!products.length) return null;

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

          <div className="mt-4 mb-4 aspect-[4/3] relative border hair overflow-hidden bg-[#F6F4EF]">
            <img
              src={imageForCategory(p.category ?? "")}
              alt={p.description ?? ""}
              className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          </div>

          <div className="display text-[18px] leading-[1.2] line-clamp-2">{p.description}</div>
          <div className="text-[11px] mono opacity-70 mt-1">{p.category}</div>

          <div className="mt-3 text-[11px] underline-red pb-0.5 inline-block">사양 보기 →</div>
        </Link>
      ))}
    </div>
  );
}
