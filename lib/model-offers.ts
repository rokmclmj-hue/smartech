import { prisma } from "./db";
import { findModelForProduct, SPEC_DATA, modelSlug } from "./product-specs";
import { leadTimeLabel } from "./lead-time";

// 모델 화면(/products/edwards-rv5)·검색 설명문·llms-full.txt가 함께 쓰는 판매 옵션 목록.
// 🔴 원가(costPrice)는 이 파일 안에서 판매가 계산에만 쓰고, 밖으로 내보내는 값에는 절대 넣지 않는다
//    (2026-09-24 원가 노출 사고). 내보내는 가격은 "원가 × 배율"로 계산한 판매가뿐이다.

export type ModelSku = {
  id: number;
  partNo: string;
  description: string;
  price: number | null; // 화면 등급 판매가 — 가격 미정(원가 0)이면 null
  publicPrice: number | null; // 비회원 판매가 — 구조화 데이터·설명문용
  stock: number; // 0 미만은 0으로
  isDiscontinued: boolean;
  stockLabel: string; // 파트번호 화면과 같은 문구
};

export type ModelOfferSummary = {
  minPrice: number | null; // 판매 중(단종 아님)·가격 있는 옵션 중 최저 — 화면 등급
  maxPrice: number | null;
  publicMinPrice: number | null;
  publicMaxPrice: number | null;
  pricedCount: number;
  totalStock: number; // 판매 중 옵션 재고 합계
  leadLabel: string | null; // 재고 없을 때 안내할 통상 납기("통상 4주") — 판매 중 옵션 기준
  allDiscontinued: boolean;
};

type Row = { id: number; partNo: string; description: string; costPrice: number; stock: number; isDiscontinued: boolean };

function toSku(p: Row, category: string, multiplier: number, publicMultiplier: number): ModelSku {
  const hasPrice = p.costPrice > 0;
  const stock = Math.max(0, p.stock);
  const stockLabel = p.isDiscontinued
    ? "단종 — 대체 모델 문의"
    : stock > 0
      ? `재고 ${stock} · 바로 출고 가능`
      : `${leadTimeLabel(category, p.description)} (재고 없음)`;
  return {
    id: p.id,
    partNo: p.partNo,
    description: p.description,
    price: hasPrice ? Math.round(p.costPrice * multiplier) : null,
    publicPrice: hasPrice ? Math.round(p.costPrice * publicMultiplier) : null,
    stock,
    isDiscontinued: p.isDiscontinued,
    stockLabel,
  };
}

// 판매 중 → 단종 순, 같은 그룹 안에서는 가격 낮은 순(가격 미정은 뒤)
function sortSkus(skus: ModelSku[]) {
  return skus.sort((a, b) =>
    Number(a.isDiscontinued) - Number(b.isDiscontinued)
    || (a.price ?? Infinity) - (b.price ?? Infinity)
    || a.partNo.localeCompare(b.partNo));
}

export function summarize(category: string, skus: ModelSku[]): ModelOfferSummary {
  const active = skus.filter((s) => !s.isDiscontinued);
  const prices = active.map((s) => s.price).filter((v): v is number => v !== null);
  const publicPrices = active.map((s) => s.publicPrice).filter((v): v is number => v !== null);
  const lead = active.length ? leadTimeLabel(category, active[0].description) : null;
  return {
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    publicMinPrice: publicPrices.length ? Math.min(...publicPrices) : null,
    publicMaxPrice: publicPrices.length ? Math.max(...publicPrices) : null,
    pricedCount: prices.length,
    totalStock: active.reduce((sum, s) => sum + s.stock, 0),
    leadLabel: lead,
    allDiscontinued: skus.length > 0 && active.length === 0,
  };
}

const ROW_SELECT = { id: true, partNo: true, description: true, costPrice: true, stock: true, isDiscontinued: true } as const;

/** 모델 하나의 판매 옵션(파트번호) — ModelDetail "판매 옵션"과 같은 기준(findModelForProduct) */
export async function getModelSkus(category: string, model: string, multiplier: number, publicMultiplier: number) {
  const candidates = await prisma.product.findMany({
    where: { category, description: { contains: model, mode: "insensitive" } },
    select: ROW_SELECT,
  });
  return sortSkus(
    candidates
      .filter((p) => findModelForProduct(category, p.description)?.model === model)
      .map((p) => toSku(p, category, multiplier, publicMultiplier)),
  );
}

/** 사양표 전체 모델의 가격·재고 요약 — llms-full.txt용(비회원 판매가). DB는 한 번만 읽는다 */
export async function getAllModelSummaries(publicMultiplier: number) {
  const rows = await prisma.product.findMany({
    where: { category: { in: Object.keys(SPEC_DATA) } },
    select: { ...ROW_SELECT, category: true },
  });
  const byModel = new Map<string, ModelSku[]>();
  for (const p of rows) {
    if (!p.category) continue;
    const found = findModelForProduct(p.category, p.description);
    if (!found) continue;
    const key = `${p.category}\u0000${found.model}`;
    const list = byModel.get(key) ?? [];
    list.push(toSku(p, p.category, publicMultiplier, publicMultiplier));
    byModel.set(key, list);
  }
  const out: { category: string; model: string; slug: string; summary: ModelOfferSummary }[] = [];
  for (const [category, data] of Object.entries(SPEC_DATA)) {
    for (const model of data.models) {
      const skus = byModel.get(`${category}\u0000${model}`) ?? [];
      out.push({ category, model, slug: modelSlug(model), summary: summarize(category, skus) });
    }
  }
  return out;
}
