"use client";

import { SMARTECH_COMPANY } from "@/lib/company";
import MarginSettings from "@/components/MarginSettings";

// ─── 표시용 그룹 정의 ────────────────────────────────────────
type Row = { label: string; value: string; mono?: boolean; highlight?: boolean };
type Section = { title: string; rows: Row[] };

const C = SMARTECH_COMPANY;

const SECTIONS: Section[] = [
  {
    title: "기본 정보",
    rows: [
      { label: "한글 회사명", value: C.name },
      { label: "법인명", value: C.legalName },
      { label: "영문 회사명 (단축)", value: C.english },
      { label: "영문 회사명 (정식)", value: C.englishLong },
      { label: "슬로건", value: C.slogan },
      { label: "역할 (영문)", value: C.role },
      { label: "역할 (한글)", value: C.roleKo },
      { label: "설립연도", value: String(C.since) },
    ],
  },
  {
    title: "등록 정보 (사업자등록증)",
    rows: [
      { label: "사업자등록번호", value: C.bizNo, mono: true, highlight: true },
      { label: "법인등록번호", value: C.corpNo, mono: true },
      { label: "대표자", value: C.ceo },
      { label: "개업연월일", value: C.establishedDate, mono: true },
      { label: "업태", value: C.businessType },
      { label: "종목", value: C.businessItem },
    ],
  },
  {
    title: "연락처",
    rows: [
      { label: "Office TEL", value: C.officeTel, mono: true },
      { label: "Mobile (대표)", value: C.mobileTel, mono: true },
      { label: "FAX", value: C.fax, mono: true },
      { label: "E-mail", value: C.email, mono: true },
      { label: "24시간 핫라인", value: C.hotline24h ? "운영" : "미운영" },
    ],
  },
  {
    title: "영업 본사 (수원)",
    rows: [
      { label: "주소 (한글)", value: C.headOfficeKo },
      { label: "주소 (영문)", value: C.headOfficeEn, mono: true },
      { label: "단축 표기", value: C.headOfficeShort, mono: true },
    ],
  },
  {
    title: "등록 본점 / 천안 A/S 센터",
    rows: [
      { label: "주소 (한글)", value: C.cheonanCenterKo },
      { label: "주소 (영문)", value: C.cheonanCenterEn, mono: true },
      { label: "단축 표기", value: C.cheonanCenterShort, mono: true },
      { label: "사업자등록상 본점", value: C.registeredAddressKo },
    ],
  },
  {
    title: "웹",
    rows: [
      { label: "공식 웹사이트", value: C.website, mono: true },
    ],
  },
];

// ─── 메인 ────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  return (
    <div className="px-4 sm:px-6 py-6 sm:py-10 max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
      {/* 헤더 */}
      <div>
        <div className="mono text-[11px] dim tracking-[0.15em] uppercase mb-3">
          — 07 · SETTINGS
        </div>
        <h1 className="display text-[28px] sm:text-[40px] leading-none text-ink">
          회사 <span className="italic text-edred">설정</span>
        </h1>
        <p className="mt-4 text-[14px] dim leading-[1.6] max-w-2xl">
          견적서·거래명세표·메일 등 모든 문서에 표시되는 회사 정보입니다.
          모든 발행 문서가 이 데이터를 참조하므로, 변경 시 모든 곳에 자동 반영됩니다.
        </p>
      </div>

      {/* 안내 박스 — 편집 모드 */}
      <div className="border hair bg-edred/5 px-5 py-4 flex items-start gap-3">
        <span className="mono text-[10px] tracking-[0.12em] uppercase border border-edred text-edred px-2 py-0.5 mt-0.5">
          READ ONLY
        </span>
        <div className="flex-1 text-[13px] leading-[1.6] text-ink">
          <p>
            현재는 <span className="font-semibold">읽기 전용 모드</span>입니다.
            정보 변경이 필요하면 개발자에게 요청해주세요. (소스 파일 <span className="mono text-[12px] text-edred">lib/company.ts</span> 직접 수정)
          </p>
          <p className="mt-1 dim text-[12px]">
            추후 단계에서 폼으로 직접 수정·저장하는 기능이 추가될 예정입니다.
          </p>
        </div>
      </div>

      {/* 섹션 카드들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="border hair bg-paper"
          >
            <div className="px-5 py-3 border-b hair flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-ink tracking-tight">
                {section.title}
              </h2>
              <span className="mono text-[10px] dim tracking-[0.12em] uppercase">
                {section.rows.length} 항목
              </span>
            </div>
            <div className="divide-y hair">
              {section.rows.map((row) => (
                <div
                  key={row.label}
                  className="px-5 py-3 grid grid-cols-[140px_1fr] gap-4 items-start"
                >
                  <div className="mono text-[11px] dim tracking-[0.06em] uppercase pt-0.5">
                    {row.label}
                  </div>
                  <div
                    className={`text-[13px] break-all ${
                      row.mono ? "mono" : ""
                    } ${
                      row.highlight ? "text-edred font-semibold" : "text-ink"
                    } ${
                      !row.value ? "dim italic" : ""
                    }`}
                  >
                    {row.value || "(미입력)"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 마진율 설정 */}
      <div className="border hair bg-paper">
        <div className="px-5 py-3 border-b hair flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-ink tracking-tight">등급별 마진율 설정</h2>
          <span className="mono text-[10px] text-edred tracking-[0.12em] uppercase">관리자 전용</span>
        </div>
        <div className="px-5 py-5">
          <MarginSettings />
        </div>
      </div>

      {/* 사용처 안내 */}
      <div className="border hair bg-ink/[0.02] px-6 py-5">
        <h3 className="mono text-[11px] dim tracking-[0.12em] uppercase mb-3">
          — 이 정보가 표시되는 곳
        </h3>
        <ul className="space-y-2 text-[13px] text-ink">
          <li className="flex items-start gap-2">
            <span className="text-edred shrink-0">→</span>
            <span>
              <span className="font-medium">사용자 견적서 화면</span>{" "}
              <span className="mono text-[11px] dim">/quote/[id]</span> · SECTION 01 발신처 박스 (11개 행) + SECTION 07 서명란 + 푸터
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-edred shrink-0">→</span>
            <span>
              <span className="font-medium">견적서 PDF 다운로드</span> · 브라우저 인쇄 출력 + 메일 첨부
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-edred shrink-0">→</span>
            <span>
              <span className="font-medium">거래명세표 PDF</span>{" "}
              <span className="mono text-[11px] dim">/api/admin/orders/[id]/delivery-pdf</span> · 공급자 박스
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-edred shrink-0">→</span>
            <span>
              <span className="font-medium">관리자 견적 발송 메일</span> · 발신자 정보
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
