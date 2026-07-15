import Link from "next/link";
import { prisma } from "@/lib/db";
import { getModelSpecRows, getSiblingModels, type ModelLookup } from "@/lib/product-specs";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function ModelDetail({ category, model, index }: ModelLookup) {
  const specRows = getModelSpecRows(category, index);
  const siblings = getSiblingModels(category, index);

  // 같은 카테고리 안에서 이 모델 코드로 시작하는 실제 판매 SKU만 추려서 보여준다
  // (예: "RV3" → "RV3 100-127V/200-254V 50/60Hz" 같은 파생 SKU들)
  const candidates = await prisma.product.findMany({
    where: { category },
    select: { partNo: true, description: true },
    take: 200,
  });
  const boundary = new RegExp(`(^|[^A-Za-z0-9])${escapeRegex(model)}([^A-Za-z0-9]|$)`, "i");
  const relatedSkus = candidates.filter((p) => boundary.test(p.description));

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link href="/products" className="text-sm text-gray-500 hover:text-blue-600 mb-6 inline-block">
        ← 제품 목록
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-8 shadow-sm">
        <p className="text-blue-600 font-mono text-sm mb-1">{category}</p>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 leading-snug">
          Edwards {model}
        </h1>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">사양 (Edwards 공식 카탈로그 기준)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {specRows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">{row.label}</td>
                    <td className="py-2 font-medium text-slate-800">
                      {row.value}{row.unit ? ` ${row.unit}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {relatedSkus.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-3">판매 옵션 (전압·주파수·지역별)</h2>
            <ul className="space-y-2">
              {relatedSkus.map((p) => (
                <li key={p.partNo}>
                  <Link
                    href={`/products/${encodeURIComponent(p.partNo)}`}
                    className="block text-sm px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-blue-600 font-mono mr-2">{p.partNo}</span>
                    {p.description}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {siblings.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-3">같은 라인업의 다른 모델</h2>
            <div className="flex flex-wrap gap-2">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/products/${s.slug}`}
                  className="text-sm px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {s.model}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t pt-6">
          <h2 className="text-lg font-semibold mb-3">가격·재고 문의</h2>
          <p className="text-sm text-gray-500 mb-4">
            정확한 견적은 사용 전압·주파수·지역 사양에 따라 달라집니다. 전화 또는 견적 문의로 확인해 주세요.
          </p>
          <a
            href="tel:031-204-7170"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            📞 031-204-7170
          </a>
        </div>
      </div>
    </div>
  );
}
