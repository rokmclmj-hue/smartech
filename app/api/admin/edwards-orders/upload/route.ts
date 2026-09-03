import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import * as XLSX from "xlsx";

// documentNo/itemLine/mad는 diff의 기준 키라 정확일치만 허용 (엉뚱한 컬럼에 잘못 매칭되면
// @@unique([documentNo, itemLine]) 키가 오염돼 그 주 전체 비교가 틀어짐 — 부분일치 금지)
function findColumnExact(headerRow: string[], candidates: string[]): number {
  for (const name of candidates) {
    const idx = headerRow.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

// 나머지 컬럼(품명·수량·업체 등)은 헤더 이름이 주차마다 살짝 바뀔 수 있어 부분일치도 허용
function findColumn(headerRow: string[], candidates: string[]): number {
  const exact = findColumnExact(headerRow, candidates);
  if (exact !== -1) return exact;
  for (const name of candidates) {
    const idx = headerRow.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
    if (idx !== -1) return idx;
  }
  return -1;
}

// 엑셀 날짜 셀(raw:true → 숫자 serial)을 UTC 자정 기준 Date로 변환 (타임존 오차 방지)
function excelSerialToDate(raw: unknown): Date | null {
  if (typeof raw !== "number" || !isFinite(raw)) return null;
  const parsed = XLSX.SSF.parse_date_code(raw);
  if (!parsed) return null;
  return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
}

function sameDate(a: Date | null, b: Date | null) {
  if (!a || !b) return a === b;
  return a.getTime() === b.getTime();
}

// "0"처럼 실제로 유효한 0 수량과, 파싱 불가능한 값을 구분 (parseInt(...)||1 은 0을 1로 잘못 바꿔버림)
function parseQuantity(raw: unknown): number {
  if (typeof raw === "number" && isFinite(raw)) return raw;
  const n = parseInt(String(raw), 10);
  return isFinite(n) && !isNaN(n) ? n : 1;
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof Blob))
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    return NextResponse.json({ error: "엑셀 파일을 읽을 수 없습니다" }, { status: 400 });
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows2d = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: "" });
  if (rows2d.length < 2)
    return NextResponse.json({ error: "데이터가 없습니다" }, { status: 400 });

  const headerRow = rows2d[0].map((h) => String(h ?? "").trim());
  const idx = {
    poNumber: findColumn(headerRow, ["PO Number"]),
    documentNo: findColumnExact(headerRow, ["Document No", "Document Number"]),
    itemLine: findColumnExact(headerRow, ["Item"]),
    materialCode: findColumn(headerRow, ["Material"]),
    description: findColumn(headerRow, ["Material Description", "Description"]),
    quantity: findColumn(headerRow, ["Total Open+Picklist Quantity", "Open Quantity", "Quantity"]),
    mad: findColumnExact(headerRow, ["Current MAD", "MAD"]),
    supplier: findColumn(headerRow, ["발주업체", "Supplier"]),
  };

  const missing = Object.entries(idx)
    .filter(([key, v]) => v === -1 && key !== "supplier") // 발주업체 컬럼은 없어도 진행 가능
    .map(([key]) => key);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `엑셀에서 다음 컬럼을 찾지 못했습니다: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  type Parsed = {
    poNumber: string;
    documentNo: string;
    itemLine: string;
    materialCode: string;
    description: string;
    quantity: number;
    mad: Date;
    supplier: string;
  };

  const parsedRows: Parsed[] = [];
  let skipped = 0;

  for (const row of rows2d.slice(1)) {
    const documentNo = String(row[idx.documentNo] ?? "").trim();
    const itemLine = String(row[idx.itemLine] ?? "").trim();
    const mad = excelSerialToDate(row[idx.mad]);
    if (!documentNo || !itemLine || !mad) { skipped++; continue; }

    parsedRows.push({
      poNumber: String(row[idx.poNumber] ?? "").trim(),
      documentNo,
      itemLine,
      materialCode: String(row[idx.materialCode] ?? "").trim(),
      description: String(row[idx.description] ?? "").trim(),
      quantity: parseQuantity(row[idx.quantity]),
      mad,
      supplier: idx.supplier !== -1 ? String(row[idx.supplier] ?? "").trim() : "",
    });
  }

  if (parsedRows.length === 0)
    return NextResponse.json({ error: "유효한 품목이 없습니다" }, { status: 400 });

  // SMT-*-P-* 형식 PO는 기존 발주서 시스템(ManualPurchaseOrder)과 자동 연결
  const smtPoNumbers = [...new Set(parsedRows.map((r) => r.poNumber).filter((p) => /^SMT-\d{4}-P-\d+$/.test(p)))];
  const linkedOrders = smtPoNumbers.length
    ? await prisma.manualPurchaseOrder.findMany({
        where: { orderNo: { in: smtPoNumbers } },
        select: { id: true, orderNo: true },
      })
    : [];
  const poToManualOrderId = new Map(linkedOrders.map((o) => [o.orderNo, o.id]));

  const existing = await prisma.edwardsOpenOrder.findMany();
  // documentNo+itemLine 키별 최신 상태를 계속 갱신하며 진행 — 같은 파일 안에 같은 키가
  // 두 번 나와도(분할선적 등) 두 번째 행이 첫 번째 행의 결과를 보고 판단하도록
  const existingMap = new Map(existing.map((e) => [`${e.documentNo}|${e.itemLine}`, e]));

  const now = new Date();
  const seenKeys = new Set<string>();
  let created = 0, madChanged = 0, reappeared = 0, unchanged = 0, skippedDelivered = 0;

  // 전체를 하나의 트랜잭션으로 묶어 중간에 실패해도 부분 반영되지 않도록 함
  await prisma.$transaction(async (tx) => {
    for (const row of parsedRows) {
      const key = `${row.documentNo}|${row.itemLine}`;
      seenKeys.add(key);
      const found = existingMap.get(key);
      const manualPurchaseOrderId = poToManualOrderId.get(row.poNumber) ?? null;

      if (!found) {
        const createdRow = await tx.edwardsOpenOrder.create({
          data: {
            poNumber: row.poNumber,
            documentNo: row.documentNo,
            itemLine: row.itemLine,
            materialCode: row.materialCode,
            description: row.description,
            quantity: row.quantity,
            currentMad: row.mad,
            supplier: row.supplier || null,
            status: "OPEN",
            manualPurchaseOrderId,
            firstSeenAt: now,
            lastSeenAt: now,
          },
        });
        existingMap.set(key, createdRow);
        created++;
        continue;
      }

      if (found.status === "DELIVERED") {
        // 이미 입고완료 확정된 건이 다시 나타남 — 자동으로 되돌리지 않고 건너뜀(사람이 필요시 수동 확인)
        skippedDelivered++;
        continue;
      }

      const madHasChanged = !sameDate(found.currentMad, row.mad);
      const data: Record<string, unknown> = {
        poNumber: row.poNumber,
        materialCode: row.materialCode,
        description: row.description,
        quantity: row.quantity,
        lastSeenAt: now,
        manualPurchaseOrderId: found.manualPurchaseOrderId ?? manualPurchaseOrderId,
      };
      if (madHasChanged) {
        data.previousMad = found.currentMad;
        data.currentMad = row.mad;
        madChanged++;
      }
      if (!found.supplier && row.supplier) {
        data.supplier = row.supplier;
      }
      if (found.status === "PENDING_CONFIRM") {
        data.status = "OPEN";
        reappeared++;
      }
      if (!madHasChanged && found.status !== "PENDING_CONFIRM" && (found.supplier || !row.supplier)) {
        unchanged++;
      }

      const updatedRow = await tx.edwardsOpenOrder.update({ where: { id: found.id }, data });
      existingMap.set(key, updatedRow);
    }

    // 이번 시트에 없어진 OPEN 품목 → 입고완료 후보(PENDING_CONFIRM)로 표시 (자동 확정 아님, 사람 확인 필요)
    const disappearedRows = existing.filter(
      (e) => e.status === "OPEN" && !seenKeys.has(`${e.documentNo}|${e.itemLine}`)
    );
    for (const e of disappearedRows) {
      await tx.edwardsOpenOrder.update({ where: { id: e.id }, data: { status: "PENDING_CONFIRM" } });
    }
  }, { timeout: 30000, maxWait: 10000 });

  const disappearedCount = existing.filter(
    (e) => e.status === "OPEN" && !seenKeys.has(`${e.documentNo}|${e.itemLine}`)
  ).length;

  return NextResponse.json({
    ok: true,
    totalRows: parsedRows.length,
    created,
    madChanged,
    reappeared,
    unchanged,
    disappeared: disappearedCount,
    skippedRows: skipped,
    skippedDelivered,
  });
}
