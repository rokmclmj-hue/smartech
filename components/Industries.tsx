"use client";
import { useState } from "react";
import Link from "next/link";

type Industry = {
  n: number;
  tag: string[];
  title: string;
  line: string;
  models: string[];
};

const INDUSTRIES: Industry[] = [
  { n: 1,  tag: ["R&D","분석"],    title: "연구 및 분석",       line: "SEM/TEM, 질량분석(GC/LC-MS) 정밀 측정 환경 확보",    models: ["nXRi","nXDS","nEXT"] },
  { n: 2,  tag: ["에너지","안전"], title: "가스 실린더",         line: "충전 전 내부 Purge, 고순도 유지 및 안전 확보",          models: ["nXDS","E2M","nEXT"] },
  { n: 3,  tag: ["기반","극저온"], title: "진공 이중배관",       line: "극저온 유체 이송 시 단열, 결로 방지",                   models: ["T-station","nXDS","ELD500"] },
  { n: 4,  tag: ["배터리"],        title: "이차전지",            line: "Degassing, 기포 제거, 배터리 수명 연장",               models: ["GXS","EXS","nES"] },
  { n: 5,  tag: ["금속","열처리"], title: "진공로",              line: "금속 열처리·소성 공정, 산화 방지",                      models: ["GXS","EXS","EH"] },
  { n: 6,  tag: ["건조","제약"],   title: "진공 오븐/건조",      line: "반도체·화장품·화학 저온 건조 및 변형 방지",             models: ["nXDS","GXS","EXS"] },
  { n: 7,  tag: ["디스플레이","반도체"], title: "OLED / 디스플레이", line: "유기물 증착·봉지층 형성, 청정 진공 유지",           models: ["GXS","EXS","iXH"] },
  { n: 8,  tag: ["식품","제약"],   title: "식품·제약 동결건조",  line: "의약품·유산균 동결건조, 신선도 유지",                   models: ["EM","GXS","EOSi","EH"] },
  { n: 9,  tag: ["코팅","모바일"], title: "코팅 / 스마트폰",     line: "액정·렌즈 코팅, 스퍼터링 공정",                        models: ["nES","EM","EXS","GXS","STP"] },
  { n: 10, tag: ["에너지","수소"], title: "수소 에너지",          line: "연료전지 스택 제조, 수소 저장 기밀 테스트",             models: ["nXDS","ELD500"] },
  { n: 11, tag: ["항공우주"],      title: "항공우주",             line: "우주 환경 모사(초고진공), 부품 내구성 시험",            models: ["STP","nGX","iXH"] },
  { n: 12, tag: ["에너지"],        title: "태양광 에너지",        line: "실리콘 잉곳 성장, 박막 증착",                          models: ["GXS","EXS","iXH"] },
  { n: 13, tag: ["대규모","과학"], title: "핵융합 / 가속기",      line: "플라즈마 감금, 입자 가속 환경 조성",                   models: ["STP","nEXT","nXDS"] },
  { n: 14, tag: ["정밀","반도체"], title: "초미세 가공",          line: "전자빔 용접, 이온 주입, 정밀 가공",                    models: ["nXDS","nEXT"] },
  { n: 15, tag: ["환경"],          title: "리사이클링",           line: "폐플라스틱·배터리 재생 원료 추출",                      models: ["GXS","EXS","nES","nXDS"] },
  { n: 16, tag: ["의료","바이오"], title: "의료 / 생명공학",      line: "의료용 가속기(BNCT), 혈장 농축·멸균",                  models: ["nXDS","nEXT","nXRi"] },
  { n: 17, tag: ["모빌리티"],      title: "차세대 모빌리티",      line: "하이퍼루프 감압, LiDAR 센서 봉지",                     models: ["GXS","EXS","iXH","ELD500"] },
  { n: 18, tag: ["금속","용접"],   title: "특수 용접 / 금속",     line: "전자빔 용접(EBW), 진공 아크 재용해",                   models: ["STP","GXS","EXS"] },
  { n: 19, tag: ["배터리"],        title: "리튬 1차전지",          line: "그라뉴올 디게싱, 전해액 주입 전 수분 제거",            models: ["nXDS","GXS","EXS"] },
  { n: 20, tag: ["ESS","에너지"],  title: "ESS 에너지 저장",       line: "대용량 셀 패키징, 진공 함침 공정",                    models: ["GXS","EXS","nXDS"] },
];

const ALL_TAGS = Array.from(new Set(INDUSTRIES.flatMap((i) => i.tag)));

export default function Industries() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<number | null>(null);

  const visible = activeTag
    ? INDUSTRIES.filter((i) => i.tag.includes(activeTag))
    : INDUSTRIES;

  return (
    <section id="industries" className="py-28 border-b hair bg-paper relative">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-12 gap-6 mb-14">
          <div className="col-span-12 lg:col-span-7">
            <div className="mono text-[11px] dim mb-4">— 02 · 20 INDUSTRIES OF VACUUM</div>
            <h2 className="section-title display">
              진공은 산업의<br />
              <span className="italic">보이지 않는 기반</span>입니다.
            </h2>
            <p className="mt-6 text-[15px] max-w-[55ch] leading-[1.75] text-[#2a2823]">
              반도체부터 핵융합까지 — 스마텍은 20개 산업에서 쓰입니다.
              공정마다 다른 진공 요구사항, 스마텍이 최적 솔루션을 제안합니다.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <div className="border hair p-5 bg-white">
              <div className="mono text-[11px] dim mb-3">FILTER BY TAG</div>
              <div className="flex flex-wrap gap-2 text-[11.5px]">
                <button
                  className={`chip ${activeTag === null ? "active" : ""}`}
                  onClick={() => setActiveTag(null)}
                >
                  ALL
                </button>
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    className={`chip ${activeTag === tag ? "active" : ""}`}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-t border-l hair">
          {visible.map((it) => (
            <div
              key={it.n}
              className={`ind-card relative p-5 border-r border-b hair cursor-pointer bg-paper ${openCard === it.n ? "open" : ""}`}
              onClick={() => setOpenCard(openCard === it.n ? null : it.n)}
            >
              <div className="flex items-start justify-between">
                <div className="ind-num mono text-[11px] text-[#6A6660]">
                  {String(it.n).padStart(2, "0")} / 20
                </div>
                <div className="mono text-[10px] opacity-50">{it.tag[0]}</div>
              </div>
              <div className="mt-6 display text-[26px] leading-[1.1]">{it.title}</div>
              <div className="mt-2 text-[12.5px] leading-[1.55] opacity-80 max-w-[26ch]">{it.line}</div>

              <div className="ind-body mt-5 pt-4 border-t border-dashed border-current/20">
                <div className="mono text-[10px] opacity-60 mb-2">RECOMMENDED</div>
                <div className="flex flex-wrap gap-1">
                  {it.models.map((m) => (
                    <span key={m} className="px-2 py-1 border border-current text-[11px]">{m}</span>
                  ))}
                </div>
                <Link
                  href="/#contact"
                  className="mt-4 inline-flex items-center gap-2 text-[12px] border-b border-current"
                  onClick={(e) => e.stopPropagation()}
                >
                  이 산업 상담 받기 →
                </Link>
              </div>

              {openCard !== it.n && (
                <div className="mt-5 text-[11px] mono opacity-40">CLICK →</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-[12.5px] dim mono flex justify-between">
          <span>HOVER / CLICK — 카드를 열어 권장 모델을 확인하세요</span>
          <span>{visible.length} / 20 INDUSTRIES</span>
        </div>
      </div>
    </section>
  );
}
