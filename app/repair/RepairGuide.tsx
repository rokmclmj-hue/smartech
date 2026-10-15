// 수리·오버홀 안내 — 서버 컴포넌트 (RepairPageClient에 children으로 전달)
// 내용은 실제 검사성적서(SMT-2026-R-000045, iH1800)·수리 사례·대표 확인 사항(2026-10-16)만 사용한다.

const PUMP_GROUPS = [
  { type: "오일 로터리 펌프", models: "Edwards RV · E2M" },
  { type: "드라이 스크롤 펌프", models: "Edwards nXDS · XDS" },
  { type: "드라이펌프 (반도체·산업용)", models: "Edwards iH · iQDP · GV" },
  { type: "루츠 부스터", models: "Edwards EH" },
  { type: "타사 펌프", models: "Pfeiffer · 우성진공 수리 실적, Leybold · Busch 등 상담 가능" },
];

const PROCESS = [
  { n: "01", title: "접수", desc: "이 페이지에서 온라인 접수하거나 전화(031-204-7170)로 접수합니다." },
  { n: "02", title: "입고 확인", desc: "장비 입고 후 담당자가 상태를 확인합니다." },
  { n: "03", title: "분해 검사", desc: "분해해 마모·오염·손상 부위를 확인하고 최종 견적을 안내합니다." },
  { n: "04", title: "수리·부품 교체", desc: "오링·씰·베어링·슬리브·베인 등 소모품과 손상 부품을 교체합니다." },
  { n: "05", title: "출고 시험", desc: "아래 시험 항목을 모두 확인합니다." },
  { n: "06", title: "납품", desc: "검사성적서·거래명세표와 함께 납품합니다." },
];

// iH1800 검사성적서(2026.10.06) 기준값·측정값
const TESTS = [
  { item: "도달 진공도", check: "최저 압력 측정", std: "9.0×10⁻³ Torr 이하", val: "5.5×10⁻³ Torr" },
  { item: "운전 전류", check: "모터 전류 측정", std: "16A 이하", val: "8.7A" },
  { item: "본체 온도", check: "운전 중 본체 온도", std: "160℃ 이하", val: "134℃" },
  { item: "누설 검사", check: "Leak 합격/불합격", std: "합격", val: "합격" },
  { item: "오일 누유", check: "누유 여부", std: "없음", val: "없음" },
  { item: "냉각수 누수", check: "누수 여부", std: "없음", val: "없음" },
  { item: "이상 소음", check: "소음 여부", std: "없음", val: "없음" },
  { item: "기능 시험", check: "정상 동작 확인", std: "정상", val: "정상" },
  { item: "시운전", check: "연속 운전 시간", std: "4시간 이상", val: "16시간" },
  { item: "오일", check: "오일 종류·주입 확인", std: "지정 오일", val: "Fomblin 주입" },
];

export default function RepairGuide() {
  return (
    <section id="overhaul-guide" className="mt-24 border-t hair pt-14 bg-paper">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mono text-[11px] text-dim mb-3 tracking-widest">OVERHAUL GUIDE</div>
        <h2 className="display text-[32px] leading-tight">수리·오버홀 안내</h2>
        <p className="mt-3 text-[15px] text-dim leading-relaxed max-w-3xl break-keep">
          스마텍은 Edwards Vacuum 한국 공식 대리점입니다. 수원 본사와 천안 수리센터를 운영하며,
          필요 시 현장 방문 서비스도 제공합니다. 진공펌프 수리 경력 30년의 전담 엔지니어가
          직접 분해·점검·조립하고, 출고 전 시험 결과를 검사성적서로 발행합니다.
        </p>

        {/* 수리 가능 펌프 */}
        <h3 className="mt-12 text-[20px] font-bold tracking-tight">수리 가능 펌프</h3>
        <div className="mt-4 border hair bg-white divide-y divide-line">
          {PUMP_GROUPS.map((g) => (
            <div key={g.type} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-5 py-3.5">
              <div className="sm:w-56 shrink-0 text-[14px] font-semibold">{g.type}</div>
              <div className="text-[14px] text-dim break-keep">{g.models}</div>
            </div>
          ))}
        </div>

        {/* 오버홀 절차 */}
        <h3 className="mt-12 text-[20px] font-bold tracking-tight">오버홀 절차</h3>
        <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROCESS.map((p) => (
            <li key={p.n} className="border hair bg-white p-5">
              <div className="mono text-[11px] text-edred tracking-widest">{p.n}</div>
              <div className="mt-1 text-[16px] font-semibold">{p.title}</div>
              <p className="mt-1.5 text-[13px] text-dim leading-relaxed break-keep">{p.desc}</p>
            </li>
          ))}
        </ol>

        {/* 출고 시험 */}
        <h3 className="mt-12 text-[20px] font-bold tracking-tight">출고 전 시험 항목</h3>
        <p className="mt-2 text-[13px] text-dim leading-relaxed break-keep">
          기준값은 모델마다 다릅니다. 아래 기준값·측정값은 반도체용 드라이펌프 Edwards iH1800 검사성적서(2026.10.06) 예시입니다.
        </p>
        <div className="mt-4 overflow-x-auto border hair bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b hair text-left">
                <th className="px-3 sm:px-4 py-3 font-semibold">시험 항목</th>
                <th className="hidden sm:table-cell px-4 py-3 font-semibold">확인 내용</th>
                <th className="px-3 sm:px-4 py-3 font-semibold">기준</th>
                <th className="px-3 sm:px-4 py-3 font-semibold">측정 예</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {TESTS.map((t) => (
                <tr key={t.item}>
                  <td className="px-3 sm:px-4 py-2.5 font-medium">{t.item}</td>
                  <td className="hidden sm:table-cell px-4 py-2.5 text-dim">{t.check}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-dim">{t.std}</td>
                  <td className="px-3 sm:px-4 py-2.5">{t.val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 반도체 드라이펌프 예시 */}
        <h3 className="mt-12 text-[20px] font-bold tracking-tight">반도체 드라이펌프 수리 예 — Edwards iH1800</h3>
        <div className="mt-4 border hair bg-white p-5 text-[14px] leading-relaxed break-keep">
          <p><span className="font-semibold">증상</span> <span className="text-dim">— 공정 부산물 고착, 파워 PCA 불량</span></p>
          <p className="mt-1"><span className="font-semibold">작업</span> <span className="text-dim">— 오링·베어링·씰·슬리브·오일 교체, 파워 PCA 교체</span></p>
          <p className="mt-1"><span className="font-semibold">결과</span> <span className="text-dim">— 도달 진공도 5.5×10⁻³ Torr(기준 9.0×10⁻³ 이하), 운전 전류 8.7A, 본체 온도 134℃, 16시간 시운전 후 전 항목 합격</span></p>
          <a
            href="/documents/repair-reports/ih1800mk5-c-inspection.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 border hair px-4 py-2 mono text-[11px] tracking-wider hover:bg-ink hover:text-paper transition-colors"
          >
            검사성적서 PDF 보기 →
          </a>
        </div>

        {/* 부품·보증 */}
        <h3 className="mt-12 text-[20px] font-bold tracking-tight">부품과 보증</h3>
        <ul className="mt-4 border hair bg-white divide-y divide-line text-[14px]">
          <li className="px-5 py-3.5 break-keep">Edwards 펌프는 Edwards 정품 부품으로 수리합니다.</li>
          <li className="px-5 py-3.5 break-keep">보증 기간: 드라이펌프 6개월, 오일 로터리 펌프 3개월</li>
          <li className="px-5 py-3.5 text-dim break-keep">그 밖의 펌프는 모델과 작업 내용에 따라 접수 시 안내합니다.</li>
        </ul>
      </div>
    </section>
  );
}
