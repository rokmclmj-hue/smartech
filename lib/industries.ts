export type Industry = {
  n: number;
  slug: string;
  tag: string[];
  title: string;
  line: string;
  image: string;
  tagline: string;
  description: string;
  processes: string[];
  recommendedPumps: string[];
  models: string[];
  edwardsUrl: string;
};

export const INDUSTRIES: Industry[] = [
  {
    n: 1,
    slug: "research-analysis",
    tag: ["R&D", "분석"],
    title: "연구 및 분석",
    line: "SEM/TEM, 질량분석(GC/LC-MS) 정밀 측정 환경 확보",
    image: "/images/industries/research.jpeg",
    tagline: "SEM/TEM, 질량분석 등 분석 장비와 R&D 실험실을 위한 고청정 진공 솔루션.",
    description:
      "전자현미경(SEM·TEM), 질량분석기, 표면분석 장비는 분자 수준의 측정을 위해 오일프리 고진공 환경을 요구합니다. Edwards의 스크롤·터보·이온 펌프 조합은 깨끗한 샘플 챔버와 안정적인 배경 진공을 제공하여 분석 재현성과 감도를 극대화합니다.",
    processes: [
      "SEM/TEM 컬럼 및 시료 챔버 고진공 유지",
      "질량분석기(MS) 로딩락 및 이온 소스 배기",
      "표면분석(XPS·AES) 초고진공(UHV) 달성",
      "분석용 로드락 및 샘플 트랜스퍼 배기",
      "진공 게이지 및 RGA를 통한 압력·가스종 모니터링",
    ],
    recommendedPumps: ["nXDS", "nEXT", "STP", "APG200", "AIM200"],
    models: ["nXRi", "nXDS", "nEXT"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/vacuum-systems-for-research-and-development-applications",
  },
  {
    n: 2,
    slug: "gas-cylinder",
    tag: ["에너지", "안전"],
    title: "가스 실린더",
    line: "충전 전 내부 Purge, 고순도 유지 및 안전 확보",
    image: "/images/industries/industrial.jpeg",
    tagline: "가스 실린더 퍼지·충전 및 가스 분배 라인의 진공 전처리 솔루션.",
    description:
      "고순도 특수가스 실린더는 재충전 전 잔류 기체와 수분을 완벽히 제거해야 오염 및 역반응을 방지할 수 있습니다. Edwards 건식 진공펌프는 내식성과 높은 배기량으로 실린더 내부 및 가스 분배 매니폴드의 반복 퍼지·리크 테스트를 안정적으로 수행합니다.",
    processes: [
      "가스 실린더 재충전 전 진공 퍼지",
      "가스 분배 매니폴드 배기 및 건조",
      "부식성 가스용 실린더의 잔류물 제거",
      "헬륨 리크 디텍터를 활용한 기밀 시험",
      "UHP 가스 라인의 초기 진공 드로우다운",
    ],
    recommendedPumps: ["GXS", "iXH", "nXDS", "ELD500", "APG200"],
    models: ["nXDS", "E2M", "nEXT"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/industrial-solutions",
  },
  {
    n: 3,
    slug: "cryogenic-piping",
    tag: ["기반", "극저온"],
    title: "진공 이중배관",
    line: "극저온 유체 이송 시 단열, 결로 방지",
    image: "/images/industries/ccus.jpeg",
    tagline: "LNG·액체수소·액체헬륨을 이송하는 진공 단열 이중배관(VIP)용 솔루션.",
    description:
      "극저온 유체는 열 침입을 최소화하기 위해 진공 단열 이중배관이 필수입니다. Edwards는 장시간 진공 유지와 누설 검사를 위한 고진공·저누설 배기 시스템을 제공하여 LNG, 액체수소, CCUS 라인의 열 효율과 안전성을 확보합니다.",
    processes: [
      "진공 단열 이중배관(VIP) 초기 배기 및 베이킹",
      "극저온 라인의 장기 진공 유지(getter 포함)",
      "용접부 및 플랜지 헬륨 리크 테스트",
      "CO₂ 포집·이송 라인의 수분 제거",
      "단열 공간의 진공 레벨 모니터링",
    ],
    recommendedPumps: ["nXDS", "nEXT", "EH", "ELD500", "WRG200"],
    models: ["T-station", "nXDS", "ELD500"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/vacuum-solutions-for-ccus-technologies",
  },
  {
    n: 4,
    slug: "lithium-battery",
    tag: ["배터리"],
    title: "이차전지",
    line: "Degassing, 기포 제거, 배터리 수명 연장",
    image: "/images/industries/battery.jpeg",
    tagline: "리튬이온 배터리 전극 건조·전해액 주액·탈기 전 공정을 위한 전용 진공 솔루션.",
    description:
      "배터리 성능과 수명은 전극·셀 내부의 수분과 잔류 가스에 극도로 민감합니다. Edwards는 전극 건조, 전해액 주액 전 수분 제거, 포메이션 후 탈기(degassing)까지 배터리 제조 전 라인에 최적화된 건식 진공펌프와 부스터 시스템을 공급합니다.",
    processes: [
      "전극 코팅 후 진공 건조 및 수분 제거",
      "전해액 주액 전 셀 내부 진공 배기",
      "포메이션·에이징 후 가스 탈기(Degassing)",
      "파우치·각형 셀 진공 실링",
      "드라이룸 보조 진공 시스템",
    ],
    recommendedPumps: ["GXS", "EH", "iXL", "nXRi", "ELD500"],
    models: ["GXS", "EXS", "nES"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/energy-solutions/lithium-ion-battery-production",
  },
  {
    n: 5,
    slug: "vacuum-furnace",
    tag: ["금속", "열처리"],
    title: "진공로",
    line: "금속 열처리·소성 공정, 산화 방지",
    image: "/images/industries/metallurgy.jpeg",
    tagline: "금속 열처리·소결·브레이징을 위한 진공로 배기 시스템.",
    description:
      "진공로에서는 산화·탈탄 없이 금속의 조직과 기계적 물성을 제어합니다. Edwards의 건식 펌프와 루츠 부스터 조합은 빠른 배기, 높은 펌핑 스피드, 장시간 안정 운전을 제공해 소결·담금질·브레이징 공정의 품질을 높입니다.",
    processes: [
      "진공 담금질·템퍼링 열처리",
      "분말야금·초경 소결",
      "진공 브레이징 및 확산 접합",
      "탈가스(가스 퀜칭 전 수분·산소 제거)",
      "공정 중 진공도 연속 모니터링",
    ],
    recommendedPumps: ["GXS", "EH", "E2M", "iXH", "APG200"],
    models: ["GXS", "EXS", "EH"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/metallurgy/heat-treatment",
  },
  {
    n: 6,
    slug: "vacuum-drying",
    tag: ["건조", "제약"],
    title: "진공 오븐/건조",
    line: "반도체·화장품·화학 저온 건조 및 변형 방지",
    image: "/images/industries/pharma.jpeg",
    tagline: "열에 민감한 원료의 저온 진공 건조와 용매 회수를 위한 솔루션.",
    description:
      "의약 원료(API), 정밀화학, 식품 소재는 열 분해를 피하기 위해 저온·저압에서 건조해야 합니다. Edwards의 내약품성 건식 펌프와 응축기 패키지는 용매를 효율적으로 회수하면서 제품 품질과 작업장 안전을 동시에 확보합니다.",
    processes: [
      "API·중간체의 저온 진공 건조",
      "로터리 디스크·콘 드라이어 배기",
      "용매 회수 및 응축기 연동 운전",
      "진공 트레이 오븐 및 프리즈 드라이어 보조 펌핑",
      "배출 가스 스크러버 연동 폐용매 처리",
    ],
    recommendedPumps: ["GXS", "EH", "iXL", "E2M"],
    models: ["nXDS", "GXS", "EXS"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/chemical-processing/pharmaceuticals",
  },
  {
    n: 7,
    slug: "oled-display",
    tag: ["디스플레이", "반도체"],
    title: "OLED / 디스플레이",
    line: "유기물 증착·봉지층 형성, 청정 진공 유지",
    image: "/images/industries/display.jpeg",
    tagline: "OLED 유기층 증착·봉지·스퍼터링 등 디스플레이 전 공정 진공 솔루션.",
    description:
      "OLED와 첨단 디스플레이 제조는 초청정·고진공 환경에서 이루어집니다. Edwards는 OLED 유기증착(VTE), 인캡슐레이션, TFT 스퍼터링, 드라이에칭 공정 전반에 걸쳐 파우더·부식성 부산물에 강한 전용 진공 펌프를 공급합니다.",
    processes: [
      "OLED 유기물 진공 증착(VTE·RPD)",
      "박막 봉지(TFE) 및 글래스 봉지 공정",
      "TFT 백플레인 스퍼터링·CVD",
      "드라이 에칭 챔버 배기",
      "로드락·트랜스퍼 챔버 사이클링",
    ],
    recommendedPumps: ["iXH", "iXL", "GXS", "nEXT", "STP"],
    models: ["GXS", "EXS", "iXH"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/display/display-fabrication",
  },
  {
    n: 8,
    slug: "freeze-drying",
    tag: ["식품", "제약"],
    title: "식품·제약 동결건조",
    line: "의약품·유산균 동결건조, 신선도 유지",
    image: "/images/industries/food.jpeg",
    tagline: "백신·바이오 의약품·식품의 동결건조(Lyophilization)를 위한 진공 솔루션.",
    description:
      "동결건조는 제품을 얼린 상태에서 승화시켜 원형과 약효를 보존합니다. Edwards의 건식·유식 펌프 라인업은 대용량 수증기 처리와 내약품성을 바탕으로 백신, 단백질 의약품, 프리미엄 식품의 안정적 lyo 사이클을 지원합니다.",
    processes: [
      "바이알·트레이 동결건조 챔버 배기",
      "1차 건조(승화) 중 수증기 포집·배기",
      "2차 건조에서의 잔류 수분 제거",
      "CIP/SIP 후 챔버 재배기 및 리크 테스트",
      "식품 동결건조 라인의 대용량 진공 처리",
    ],
    recommendedPumps: ["GXS", "EH", "E2M", "iXL"],
    models: ["EM", "GXS", "EOSi", "EH"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/food-processing",
  },
  {
    n: 9,
    slug: "coating",
    tag: ["코팅", "모바일"],
    title: "코팅 / 스마트폰",
    line: "액정·렌즈 코팅, 스퍼터링 공정",
    image: "/images/industries/coating.jpeg",
    tagline: "스마트폰·안경·자동차 부품의 장식·기능성 박막 진공 코팅용 솔루션.",
    description:
      "스퍼터링·증착·PVD 공정은 박막의 밀도와 균일도를 위해 안정적인 고진공을 요구합니다. Edwards는 데코레이티브 코팅, 반사 방지(AR), 하드 코팅, 터치패널 ITO 공정 전반에 걸쳐 빠른 사이클과 긴 수명을 보장하는 진공 시스템을 제공합니다.",
    processes: [
      "PVD·스퍼터링을 통한 금속·산화물 박막 증착",
      "AR(반사 방지)·하드 코팅 배기",
      "스마트폰 케이스·렌즈 데코레이티브 코팅",
      "ITO 투명전극 증착용 챔버 배기",
      "로드락·이송 챔버 사이클링",
    ],
    recommendedPumps: ["GXS", "EH", "nEXT", "STP", "iXL"],
    models: ["nES", "EM", "EXS", "GXS", "STP"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/vacuum-coating",
  },
  {
    n: 10,
    slug: "hydrogen-energy",
    tag: ["에너지", "수소"],
    title: "수소 에너지",
    line: "연료전지 스택 제조, 수소 저장 기밀 테스트",
    image: "/images/industries/oilrig.jpeg",
    tagline: "연료전지·수전해·수소 저장 탱크의 리크 테스트와 퍼지 공정 솔루션.",
    description:
      "수소는 분자 크기가 작아 극미세 누설도 성능·안전에 치명적입니다. Edwards는 PEM·SOFC 연료전지 스택의 진공 주입, 수전해 시스템 퍼지, 고압 저장 탱크의 헬륨 리크 테스트까지 수소 밸류체인 전반에 걸친 진공 솔루션을 제공합니다.",
    processes: [
      "연료전지 스택 전해질 진공 함침·주입",
      "수전해(PEM·알칼라인) 셀 수분·산소 제거",
      "수소 저장 탱크 진공 퍼지",
      "헬륨 리크 디텍터를 이용한 기밀 시험",
      "수소 분리막·촉매 R&D 테스트 리그",
    ],
    recommendedPumps: ["GXS", "nXDS", "nEXT", "ELD500", "APG200"],
    models: ["nXDS", "ELD500"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/energy-solutions/renewable-energy",
  },
  {
    n: 11,
    slug: "aerospace",
    tag: ["항공우주"],
    title: "항공우주",
    line: "우주 환경 모사(초고진공), 부품 내구성 시험",
    image: "/images/industries/space.jpeg",
    tagline: "위성·발사체의 열진공(TVAC) 시험과 우주 환경 모사를 위한 진공 솔루션.",
    description:
      "위성과 우주 장비는 발사 전 진공-열 사이클로 우주 환경에서의 성능을 검증해야 합니다. Edwards는 대형 TVAC 챔버 배기, 고진공 유지, 리크 테스트용 헬륨 디텍터까지 우주 qualification 시험에 필요한 완전한 라인업을 제공합니다.",
    processes: [
      "열진공(TVAC) 챔버 배기 및 장시간 유지",
      "우주 환경 모사용 고진공 달성(<10⁻⁶ mbar)",
      "위성·발사체 부품 아웃가싱 시험",
      "헬륨 리크 디텍터로 기밀 품질 검증",
      "우주용 전자장비 열사이클 시험",
    ],
    recommendedPumps: ["GXS", "nEXT", "STP", "ELD500", "WRG200"],
    models: ["STP", "nGX", "iXH"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/vacuum-technology-for-tvac-testing-in-space-qualification",
  },
  {
    n: 12,
    slug: "solar",
    tag: ["에너지"],
    title: "태양광 에너지",
    line: "실리콘 잉곳 성장, 박막 증착",
    image: "/images/industries/renewable.jpeg",
    tagline: "실리콘 잉곳 성장·웨이퍼링·박막 PV 셀 제조를 위한 진공 솔루션.",
    description:
      "태양전지는 결정질 실리콘 잉곳 성장과 박막(Thin-film) 증착 모두 진공 공정에 의존합니다. Edwards는 CZ·DSS 잉곳 그로어, PECVD, 스퍼터링, 확산로까지 PV 라인 전 공정에 내구성 높은 건식 펌프를 공급합니다.",
    processes: [
      "CZ·DSS 실리콘 잉곳 성장로 배기",
      "PECVD 반사방지·패시베이션 박막 증착",
      "박막 태양전지 스퍼터링(CIGS·CdTe)",
      "확산·어닐링 퍼니스 진공 퍼지",
      "셀 라미네이션 및 모듈 봉지",
    ],
    recommendedPumps: ["GXS", "EH", "iXH", "nEXT", "iXL"],
    models: ["GXS", "EXS", "iXH"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/energy-solutions/renewable-energy",
  },
  {
    n: 13,
    slug: "fusion-accelerator",
    tag: ["대규모", "과학"],
    title: "핵융합 / 가속기",
    line: "플라즈마 감금, 입자 가속 환경 조성",
    image: "/images/industries/analytical.jpeg",
    tagline: "ITER·토카막 등 핵융합 플라즈마 장치와 입자 가속기용 UHV 솔루션.",
    description:
      "핵융합 플라즈마와 고에너지 가속기는 입자 산란을 막기 위해 초고진공(UHV) 환경을 요구합니다. Edwards는 대형 토카막, KSTAR·ITER급 R&D 장비, 빔라인 가속기에 적용 가능한 터보·크라이오·이온 펌프 조합을 제공합니다.",
    processes: [
      "토카막 진공 챔버 베이킹 및 UHV 달성",
      "빔라인·타겟 챔버의 초고진공 유지",
      "플라즈마 배기 및 삼중수소 취급 시스템",
      "가속기 링 UHV 구간 배기",
      "대형 챔버 헬륨 리크 진단",
    ],
    recommendedPumps: ["STP", "nEXT", "GXS", "ELD500", "WRG200"],
    models: ["STP", "nEXT", "nXDS"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/vacuum-systems-for-research-and-development-applications",
  },
  {
    n: 14,
    slug: "precision-machining",
    tag: ["정밀", "반도체"],
    title: "초미세 가공",
    line: "전자빔 용접, 이온 주입, 정밀 가공",
    image: "/images/industries/display-fab.jpeg",
    tagline: "전자빔 용접(EBW)·이온 주입·정밀 가공을 위한 고청정 진공 솔루션.",
    description:
      "반도체·항공부품의 초미세 가공은 산화·오염을 피하기 위해 진공 환경에서 수행됩니다. Edwards는 EBW 용접기, 이온 주입기, 정밀 에칭 장비에 맞는 오일프리 건식 펌프와 터보 조합을 공급해 가공 품질과 장비 가동률을 보장합니다.",
    processes: [
      "전자빔 용접(EBW) 챔버 고진공 배기",
      "이온 주입(Ion Implantation) 공정 배기",
      "정밀 드라이 에칭 및 트리밍",
      "MEMS·마이크로 가공 챔버 사이클링",
      "EDM·레이저 가공실 보조 진공",
    ],
    recommendedPumps: ["nXDS", "nEXT", "STP", "GXS", "APG200"],
    models: ["nXDS", "nEXT"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/industrial-solutions",
  },
  {
    n: 15,
    slug: "recycling",
    tag: ["환경"],
    title: "리사이클링",
    line: "폐플라스틱·배터리 재생 원료 추출",
    image: "/images/industries/plastics.jpeg",
    tagline: "플라스틱 열분해·배터리 재활용·금속 회수 공정을 위한 진공 솔루션.",
    description:
      "리사이클링은 열분해(pyrolysis), 용매 추출, 배터리 분해 등 가혹한 공정 조건이 많아 진공 펌프의 내구성과 내약품성이 중요합니다. Edwards의 건식 펌프는 플라스틱 pyrolysis 가스 처리, 블랙매스 건조, 비철금속 정련에서 안정적으로 운전됩니다.",
    processes: [
      "플라스틱 열분해(Pyrolysis) 가스 배기",
      "폐배터리 블랙매스 진공 건조",
      "리튬·코발트 회수용 증류 공정",
      "복합재 분해·용매 회수",
      "폐유·윤활유 진공 정제",
    ],
    recommendedPumps: ["GXS", "EH", "iXL", "E2M"],
    models: ["GXS", "EXS", "nES", "nXDS"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/plastics-and-composites",
  },
  {
    n: 16,
    slug: "medical-bio",
    tag: ["의료", "바이오"],
    title: "의료 / 생명공학",
    line: "의료용 가속기(BNCT), 혈장 농축·멸균",
    image: "/images/industries/chemical.jpeg",
    tagline: "BNCT 가속기·의료 진단장비·바이오 공정을 위한 고신뢰 진공 솔루션.",
    description:
      "의료용 가속기(BNCT·양성자 치료), MRI 콜드헤드, 바이오 공정 장비는 장기간 중단 없는 진공 유지가 필수입니다. Edwards는 고청정·저진동 설계의 드라이 펌프와 터보를 공급하여 임상 장비와 생명공학 R&D의 가동률을 보장합니다.",
    processes: [
      "BNCT·양성자 치료 가속기 빔라인 진공",
      "MRI 크라이오스탯 배기 및 유지",
      "의료용 질량분석기·PET 트레이서 합성 배기",
      "세포배양·생물반응기 진공 보조",
      "진단용 플라즈마 멸균 시스템",
    ],
    recommendedPumps: ["nXDS", "nEXT", "STP", "GXS", "ELD500"],
    models: ["nXDS", "nEXT", "nXRi"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/chemical-processing/pharmaceuticals",
  },
  {
    n: 17,
    slug: "mobility",
    tag: ["모빌리티"],
    title: "차세대 모빌리티",
    line: "하이퍼루프 감압, LiDAR 센서 봉지",
    image: "/images/industries/mobility.jpeg",
    tagline: "하이퍼루프 튜브·자율주행 LiDAR·EV 구동부를 위한 진공 솔루션.",
    description:
      "차세대 모빌리티는 하이퍼루프의 대용량 진공 튜브부터 LiDAR·카메라 모듈의 MEMS 패키징까지 다양한 스케일의 진공 기술을 필요로 합니다. Edwards는 대형 루츠·건식 펌프와 정밀 패키징용 터보 조합으로 미래 모빌리티 인프라를 지원합니다.",
    processes: [
      "하이퍼루프·진공 튜브 대용량 배기",
      "LiDAR·카메라 모듈 진공 패키징",
      "자율주행 센서 하우징 기밀 시험",
      "EV 파워트레인 부품 임프레그네이션",
      "수소 모빌리티 연료 시스템 퍼지",
    ],
    recommendedPumps: ["GXS", "EH", "nEXT", "ELD500", "iXL"],
    models: ["GXS", "EXS", "iXH", "ELD500"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/industrial-solutions",
  },
  {
    n: 18,
    slug: "specialty-welding",
    tag: ["금속", "용접"],
    title: "특수 용접 / 금속",
    line: "전자빔 용접(EBW), 진공 아크 재용해",
    image: "/images/industries/steel-degassing.jpeg",
    tagline: "전자빔 용접·진공아크 재용해(VAR)·철강 진공 탈가스 솔루션.",
    description:
      "티타늄·초합금·특수강의 품질은 용융·용접 단계의 진공 환경에 좌우됩니다. Edwards는 VAR, EBW, VIM, 철강 탈가스 공정에 필요한 대용량 드라이 펌프와 루츠 부스터 시스템으로 안정적 배기 성능을 제공합니다.",
    processes: [
      "전자빔 용접(EBW) 고진공 챔버 배기",
      "진공아크 재용해(VAR)·VIM 용해로",
      "철강 RH·VD 탈가스(수소·산소 제거)",
      "티타늄·초합금 진공 정련",
      "브레이징·확산 접합 대형 챔버",
    ],
    recommendedPumps: ["GXS", "EH", "iXH", "E2S", "APG200"],
    models: ["STP", "GXS", "EXS"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/metallurgy/steel-degassing",
  },
  {
    n: 19,
    slug: "lithium-primary",
    tag: ["배터리"],
    title: "리튬 1차전지",
    line: "그라뉴올 디게싱, 전해액 주입 전 수분 제거",
    image: "/images/industries/specialty-chem.jpeg",
    tagline: "리튬 1차전지(Li/SOCl₂ 등) 원료 건조와 전해액 주액 공정 솔루션.",
    description:
      "리튬 메탈 1차전지는 수분에 극도로 민감하여, 원료 분말과 셀 내부를 ppm 이하까지 건조해야 합니다. Edwards의 내부식 건식 펌프는 SOCl₂·SO₂ 등 부식성 전해액 주액 환경에서도 장시간 안정적으로 운전됩니다.",
    processes: [
      "리튬·이산화망간 분말 진공 건조",
      "셀 캔·벌집구조 전극 수분 제거",
      "SOCl₂·LiCl 전해액 주액 전 배기",
      "글러브박스·드라이룸 진공 보조",
      "셀 실링 후 헬륨 리크 테스트",
    ],
    recommendedPumps: ["GXS", "iXL", "EH", "ELD500"],
    models: ["nXDS", "GXS", "EXS"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/chemical-processing/speciality-and-fine-chemicals",
  },
  {
    n: 20,
    slug: "ess",
    tag: ["ESS", "에너지"],
    title: "ESS 에너지 저장",
    line: "대용량 셀 패키징, 진공 함침 공정",
    image: "/images/industries/energy.jpeg",
    tagline: "대형 ESS 셀·팩 제조의 탈기·주액·진공 함침 솔루션.",
    description:
      "ESS(에너지 저장 시스템)는 셀 단위의 신뢰성이 전체 수명을 결정합니다. Edwards는 대용량 ESS 셀의 전해액 주액, 포메이션 후 탈기, 모듈 레벨 진공 함침 및 기밀 시험까지 대형·고신뢰 생산 라인에 최적화된 진공 솔루션을 공급합니다.",
    processes: [
      "ESS 대형 셀 전해액 주액 전 진공 배기",
      "포메이션·에이징 후 가스 탈기",
      "모듈·팩 진공 함침 및 에폭시 포팅",
      "BMS·커넥터 하우징 기밀 시험",
      "대용량 드라이룸 진공 보조",
    ],
    recommendedPumps: ["GXS", "EH", "iXL", "nXRi", "ELD500"],
    models: ["GXS", "EXS", "nXDS"],
    edwardsUrl:
      "https://www.edwardsvacuum.com/en-us/vacuum-pumps/our-markets/energy-solutions/lithium-ion-battery-production",
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
