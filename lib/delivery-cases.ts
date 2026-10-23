// /delivery "납품 사례" 카드 — 수리 사례(lib/repair-cases.ts)와 같은 방식으로 손으로 추가한다.
// 🔴 사진은 우리 제품만 선명하게, 고객 설비·배경은 알아볼 수 없게 블러한 것만 쓴다(2026-10-23 대표님 지시).
//    고객사 실명은 코드·파일명·커밋 어디에도 쓰지 않는다(이니셜 "K사"·"Y대" 또는 업종만).
// date는 사진 촬영일(카메라 정보)·납품 글 날짜로 확인된 월만 적고, 모르면 비워 둔다(지어내지 않음).
// 새 사례는 배열 맨 앞에 추가한다(최신이 첫 카드). 날짜 없는 사례는 맨 뒤 묶음에 둔다.

export type DeliveryCase = {
  model: string; // 화면 표시용 "Edwards RV3 + EMF10"
  models: string[]; // 모델 화면(/products/edwards-…) 연결용 — lib/product-specs SPEC_DATA의 모델명 그대로
  site: string; // 사용처(업종·설비) — 블로그 본문·사진 설명에서 확인된 것만
  client?: string; // 고객 이니셜(공개 글에 이미 쓴 것만)
  date?: string; // "2026.09"
  note: string; // 한 줄 설명
  photo: string;
  blog?: string; // 관련 블로그 글
};

export const DELIVERY_CASES: DeliveryCase[] = [
  {
    model: "Edwards RV3 + EMF10",
    models: ["RV3"],
    site: "분석 장비(GC-MS)",
    client: "K사",
    date: "2026.09",
    note: "GC-MS 실험대의 누유 펌프를 RV3와 오일 미스트필터 EMF10으로 함께 교체 납품했습니다.",
    photo: "/images/delivery/rv3-emf10.jpg",
    blog: "/blog/104",
  },
  {
    model: "Edwards E2M18",
    models: ["E2M18"],
    site: "진공 오븐",
    client: "Y대",
    date: "2026.09",
    note: "진공 오븐 배기 용량이 부족해 기존 RV12를 E2M18로 교체했습니다. 오일 2병과 함께 출고.",
    photo: "/images/delivery/e2m18.jpg",
    blog: "/blog/99",
  },
  {
    model: "Edwards T-Station 85D",
    models: [],
    site: "정밀 표면분석 장비",
    client: "H사",
    date: "2026.06",
    note: "정밀 표면분석 장비용 터보 펌핑 스테이션을 정품 포장 그대로 출고했습니다.",
    photo: "/images/delivery/tstation85d.jpg",
    blog: "/blog/edwards-t-station-85d-installation",
  },
  {
    model: "Edwards E2M80",
    models: ["E2M80"],
    site: "동결건조 설비",
    date: "2026.06",
    note: "동결건조 설비에 연결된 2단 오일 로터리 펌프입니다.",
    photo: "/images/delivery/e2m80.jpg",
    blog: "/blog/freeze-drying-vacuum-pump-selection",
  },
  {
    model: "Edwards EXS450 + EH2600",
    models: ["EXS450", "EH2600"],
    site: "밸브 테스트 설비",
    client: "V사",
    date: "2026.02",
    note: "드라이 스크류 펌프 EXS450에 루츠 부스터 EH2600을 조합한 배기 시스템입니다.",
    photo: "/images/delivery/exs450-eh2600.jpg",
    blog: "/blog/pumping-speed-roots-booster-selection",
  },
  {
    model: "Edwards RV8 · nXDS10i",
    models: ["RV8", "nXDS10i"],
    site: "분석 장비(SEM)",
    date: "2025.11",
    note: "SEM 분석 장비 배기용 오일 로터리 펌프 RV8과 드라이 스크롤 펌프 nXDS10i입니다.",
    photo: "/images/delivery/rv8-nxds10i.jpg",
    blog: "/blog/114",
  },
  {
    model: "Edwards iXL500Q",
    models: ["iXL500Q"],
    site: "제조 라인",
    date: "2025.06",
    note: "제조 라인 배기 배관 아래 설치된 드라이펌프 3대입니다.",
    photo: "/images/delivery/ixl500q.jpg",
  },
  {
    model: "Edwards T-Station 85W",
    models: [],
    site: "액화질소 이중배관",
    date: "2025.03",
    note: "액화질소 이중배관(진공 단열 배관) 재배기 현장에 구성한 터보 펌핑 시스템입니다.",
    photo: "/images/delivery/tstation85w.jpg",
    blog: "/blog/liquid-nitrogen-piping-dry-pump-selection",
  },
  {
    model: "Edwards T-Station 300",
    models: [],
    site: "터보 펌핑 스테이션",
    date: "2024.11",
    note: "터보분자펌프·배기펌프·컨트롤러가 한 받침대에 결합된 일체형 스테이션입니다.",
    photo: "/images/delivery/tstation300.jpg",
  },
  {
    model: "Edwards nXDS10i",
    models: ["nXDS10i"],
    site: "진공 챔버 장비",
    date: "2024.09",
    note: "진공 챔버 장비에 드라이 스크롤 펌프를 설치하고 현장에서 진공도를 시험했습니다.",
    photo: "/images/delivery/nxds10i.jpg",
  },
  {
    model: "Edwards GXS + 배기 소음기",
    models: [],
    site: "산업 현장",
    date: "2023.06",
    note: "GXS 드라이 스크류 펌프 배기구에 소음기를 직결해 배기 맥동음을 줄였습니다.",
    photo: "/images/delivery/gxs-silencer.jpg",
    blog: "/blog/vacuum-pump-exhaust-noise-muffler",
  },
  {
    model: "Edwards nXDS6i + 터보펌프",
    models: ["nXDS6i"],
    site: "고진공 장비",
    date: "2021.10",
    note: "드라이 스크롤 펌프 nXDS6i로 터보분자펌프를 백킹하는 배기 구성입니다.",
    photo: "/images/delivery/nxds6i-turbo.jpg",
    blog: "/blog/71",
  },
  {
    model: "Edwards E2M275",
    models: ["E2M275"],
    site: "생산 설비",
    date: "2021.01",
    note: "대용량 2단 오일 로터리 펌프 E2M275 2대가 나란히 설치된 현장입니다.",
    photo: "/images/delivery/e2m275.jpg",
    blog: "/blog/85",
  },
  // ↓ 촬영 날짜를 확인할 수 없는 사례 — date 없음
  {
    model: "Edwards iXH",
    models: [],
    site: "반도체 라인",
    note: "반도체 라인 챔버 하단에 설치된 다단 드라이펌프 2대입니다.",
    photo: "/images/delivery/ixh.jpg",
    blog: "/blog/semiconductor-etch-cmp-dry-pump-selection",
  },
  {
    model: "Edwards GXS (부스터 일체형)",
    models: [],
    site: "진공 열처리로",
    note: "진공 열처리로 배기용 드라이 스크류 펌프 시스템입니다. 상부에 기계식 부스터가 결합돼 있습니다.",
    photo: "/images/delivery/gxs-furnace.jpg",
    blog: "/blog/vacuum-furnace-sintering-dry-screw-pump",
  },
  {
    model: "Edwards ELD500W",
    models: [],
    site: "클린룸 진공 설비",
    note: "클린룸 진공 설비의 누설 위치를 찾는 헬륨 리크디텍터입니다.",
    photo: "/images/delivery/eld500w.jpg",
    blog: "/blog/eld500w-leak-detector-guide",
  },
  {
    model: "Edwards RV12",
    models: ["RV12"],
    site: "진공 건조(진공 오븐)",
    note: "진공 오븐 배기에 연결한 오일 로터리 펌프 RV12입니다.",
    photo: "/images/delivery/rv12-oven.jpg",
    blog: "/blog/vacuum-drying-dry-pump-selection",
  },
  {
    model: "Edwards RV8",
    models: ["RV8"],
    site: "현장 점검",
    note: "현장에서 Edwards 게이지로 RV8의 진공도를 확인하는 모습입니다.",
    photo: "/images/delivery/rv8.jpg",
    blog: "/blog/77",
  },
  {
    model: "Edwards 오일 로터리 펌프",
    models: [],
    site: "분석 장비(GC)",
    note: "GC 질량분석 장비 배기 라인에 연결된 오일 로터리 펌프입니다.",
    photo: "/images/delivery/rv-gcms.jpg",
    blog: "/blog/70",
  },
];
