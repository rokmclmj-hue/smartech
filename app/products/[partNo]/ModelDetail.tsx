import Link from "next/link";
import { prisma } from "@/lib/db";
import { findModelForProduct, getModelSpecRows, getSiblingModels, type ModelLookup } from "@/lib/product-specs";

export default async function ModelDetail({ category, model, index }: ModelLookup) {
  const specRows = getModelSpecRows(category, index);
  const siblings = getSiblingModels(category, index);

  // 같은 카테고리 안에서 이 모델 코드로 시작하는 실제 판매 SKU만 추려서 보여준다
  // (예: "RV3" → "RV3 100-127V/200-254V 50/60Hz" 같은 파생 SKU들)
  // DB에서 먼저 contains로 좁혀서 가져온 뒤 JS에서 단어 경계로 정밀 필터링 —
  // take로 자르면 카테고리 내 제품이 많을 때 실제 SKU가 누락될 수 있어 제거함
  const candidates = await prisma.product.findMany({
    where: { category, description: { contains: model, mode: "insensitive" } },
    select: { partNo: true, description: true },
  });
  // 파트번호 화면의 사양표 연결과 같은 기준(findModelForProduct)으로 골라 두 화면이 같은 짝을 가리키게 한다
  const relatedSkus = candidates.filter((p) => findModelForProduct(category, p.description)?.model === model);


  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link href="/products" className="mono text-[12px] text-dim hover:text-edred mb-6 inline-block">
        ← 제품 카탈로그
      </Link>

      {/* 다른 화면과 같은 모양 — 각진 칸·가는 선·빨강/검정 */}
      <div className="mono text-[11px] text-dim tracking-wider">EDWARDS · {category}</div>
      <h1 className="display text-[28px] md:text-[36px] leading-[1.15] mt-3">Edwards {model}</h1>

      <section className="mt-10">
        <div className="mono text-[11px] text-dim tracking-widest mb-2">SPECIFICATION</div>
        <h2 className="text-[20px] font-bold tracking-tight">사양 <span className="text-[14px] font-normal text-dim">(Edwards 공식 카탈로그 기준)</span></h2>
        <div className="mt-4 border hair bg-white overflow-x-auto">
          <table className="w-full text-[14px] border-collapse">
            <tbody>
              {specRows.map((row) => (
                <tr key={row.label} className="border-b hair last:border-b-0">
                  <td className="px-5 py-3 text-dim whitespace-nowrap w-[45%]">{row.label}</td>
                  <td className="px-5 py-3 font-medium">
                    {row.value}{row.unit ? ` ${row.unit}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {relatedSkus.length > 0 && (
        <section className="mt-10">
          <div className="mono text-[11px] text-dim tracking-widest mb-2">PART NUMBERS</div>
          <h2 className="text-[20px] font-bold tracking-tight">판매 옵션 <span className="text-[14px] font-normal text-dim">(전압·주파수·지역별)</span></h2>
          <ul className="mt-4 border hair bg-white divide-y divide-line">
            {relatedSkus.map((p) => (
              <li key={p.partNo}>
                <Link
                  href={`/products/${encodeURIComponent(p.partNo)}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-5 px-5 py-3 text-[14px] hover:bg-ink hover:text-paper transition-colors group"
                >
                  <span className="mono text-[13px] sm:w-36 shrink-0 text-edred group-hover:text-paper">{p.partNo}</span>
                  <span>{p.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="mt-10">
          <div className="mono text-[11px] text-dim tracking-widest mb-2">LINEUP</div>
          <h2 className="text-[20px] font-bold tracking-tight">같은 라인업의 다른 모델</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {siblings.map((s) => (
              <Link
                key={s.slug}
                href={`/products/${s.slug}`}
                className="border hair bg-white px-4 py-2 text-[14px] hover:bg-ink hover:text-paper transition-colors"
              >
                {s.model}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10 border hair bg-white p-5 md:p-8">
        <div className="mono text-[11px] text-dim tracking-widest mb-2">CONTACT</div>
        <h2 className="text-[20px] font-bold tracking-tight">가격·재고 문의</h2>
        <p className="mt-2 text-[14px] text-dim break-keep">
          정확한 견적은 사용 전압·주파수·지역 사양에 따라 달라집니다. 전화 또는 견적 문의로 확인해 주세요.
        </p>
        <a
          href="tel:031-204-7170"
          className="mt-5 inline-flex items-center gap-2 bg-edred text-paper px-5 py-3 text-[14px] font-semibold hover:bg-edred3 transition-colors"
        >
          031-204-7170 전화하기
        </a>
      </section>
    </div>
  );
}
