import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { getMultiplier, formatKRW } from "@/lib/pricing";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── 스펙 섹션 (정적 — 프롬프트 캐시 대상) ───────────
const SPEC_CONTEXT = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[A] 오일 로터리 베인 펌프 (Oil Rotary Vane)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ RV 시리즈 — 소형 1단, 범용 (Source: Edwards 카탈로그)
모델   | 배기속도(60Hz) | 얼티밋        | 인렛  | 모터
RV3    | 4.0 m³/h      | 2×10⁻³ mbar  | NW16  | 90W
RV5    | 6.2 m³/h      | 2×10⁻³ mbar  | NW25  | 90W
RV8    | 10.2 m³/h     | 2×10⁻³ mbar  | NW25  | 180W
RV12   | 14.4 m³/h     | 2×10⁻³ mbar  | NW25  | 250W
용도: 소형 진공 오븐, 분석기, 리크디텍터 백킹, 교육용 장비

■ E2M 소형 시리즈 — 2단, 고진공 오일
모델    | 배기속도(60Hz) | 얼티밋        | 인렛  | 모터
E2M0.7  | 0.9 m³/h      | 3×10⁻³ mbar  | NW10  | 90W
E2M1.5  | 1.9 m³/h      | 3×10⁻³ mbar  | NW16  | 160W
E2M18   | 20.4 m³/h     | 1×10⁻³ mbar  | NW40  | 550W
E2M28   | 33.0 m³/h     | 1×10⁻³ mbar  | NW40  | 750W
용도: 터보펌프 백킹, 소형 코팅 장비, 연구용 진공 시스템

■ E2M 중대형 시리즈 — 2단, 대용량
모델    | 배기속도(60Hz) | 얼티밋        | 인렛  | 모터
E2M40   | 44 m³/h       | 3×10⁻³ mbar  | NW40  | 1.1 kW
E2M80   | 90 m³/h       | 3×10⁻³ mbar  | NW40  | 2.2 kW
E2M175  | 196 m³/h      | 3×10⁻³ mbar  | ISO63 | 5.5 kW
E2M275  | 306 m³/h      | 3×10⁻³ mbar  | ISO63 | 7.5 kW
용도: 중형 코팅, 스퍼터링, 진공로, 이중배관 시스템

■ E2M+EH 조합 — E2M + 루츠 부스터 (배기속도 대폭 증가)
모델              | 배기속도(60Hz) | 얼티밋        | 인렛
E2M40/EH250      | 조합 운전      | ~4×10⁻³ mbar | NW40
E2M40/EH500      | 조합 운전      | ~4×10⁻³ mbar | NW40
E2M80/EH250      | 조합 운전      | ~4×10⁻³ mbar | NW40
E2M80/EH500      | 조합 운전      | ~4×10⁻³ mbar | NW40
E2M175/EH500     | 조합 운전      | ~4×10⁻³ mbar | ISO63
E2M175/EH1200    | 조합 운전      | ~4×10⁻³ mbar | ISO63
E2M175/EH2600    | 조합 운전      | ~4×10⁻³ mbar | ISO63
E2M275/EH500     | 조합 운전      | ~4×10⁻³ mbar | ISO63
E2M275/EH1200    | 조합 운전      | ~4×10⁻³ mbar | ISO63
E2M275/EH2600    | 조합 운전      | ~4×10⁻³ mbar | ISO63
E2M275/EH4200    | 조합 운전      | ~4×10⁻³ mbar | ISO63
용도: 진공 이중배관(dual stage), 진공로, 대면적 코팅

■ nES 시리즈 — 1단, 대용량 오일 (산업용)
모델    | 배기속도(60Hz) | 얼티밋        | 인렛   | 모터
nES40   | 47.0 m³/h     | 5×10⁻¹ mbar  | NW40   | 1.3 kW
nES65   | 64.0 m³/h     | 5×10⁻¹ mbar  | NW40   | 1.8 kW
nES100  | 105.0 m³/h    | 5×10⁻¹ mbar  | NW40   | 3.0 kW
nES200  | 200 m³/h      | 8×10⁻² mbar  | ISO63  | 4.5 kW
nES300  | 290 m³/h      | 8×10⁻² mbar  | ISO63  | 5.5 kW
nES300S | 330 m³/h      | 8×10⁻² mbar  | ISO63  | 6.0 kW
nES470  | 470 m³/h      | 8×10⁻² mbar  | ISO100 | 11.0 kW
nES570  | ~570 m³/h     | 8×10⁻² mbar  | ISO100 | 11.0 kW
nES630  | 755 m³/h      | 8×10⁻² mbar  | ISO100 | 18.5 kW
nES750  | ~755 m³/h     | 8×10⁻² mbar  | ISO100 | 18.5 kW
용도: 대형 진공로, 동결건조, 대용량 산업 공정

■ nES+EH 조합
모델               | 배기속도(60Hz) | 얼티밋        | 인렛
nES630/EH2600     | 2290 m³/h     | ~4×10⁻³ mbar | ISO100
nES630/EH4200     | 2909 m³/h     | ~4×10⁻³ mbar | ISO100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[B] 드라이 스크롤 펌프 (Dry Scroll — 오일프리, 청정)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ nXDS 시리즈 — 소형 클린, 터보 백킹 표준
모델     | 배기속도(60Hz) | 얼티밋        | 인렛  | 모터
nXDS6i   | 6.4 m³/h      | 5×10⁻³ mbar  | NW25  | 230W
nXDS10i  | 11.1 m³/h     | 5×10⁻³ mbar  | NW25  | 350W
nXDS15i  | 15.0 m³/h     | 5×10⁻³ mbar  | NW40  | 400W
nXDS20i  | 21.8 m³/h     | 5×10⁻³ mbar  | NW40  | 600W
용도: 터보펌프 백킹, 분석기, MS, 리크디텍터, 클린 연구환경

■ XDS35i — 중형 스크롤
모델    | 배기속도(60Hz) | 얼티밋        | 인렛  | 모터
XDS35i  | 35 m³/h       | 3×10⁻³ mbar  | NW40  | 2.2 kW
용도: 중형 분석·코팅 장비, 클린 공정

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[C] 산업용 드라이 스크류 펌프
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ GXS 시리즈 — 산업용 드라이 스크류
모델    | 배기속도(60Hz) | 얼티밋        | 인렛   | 모터
GXS160  | 160 m³/h      | 1×10⁻² mbar  | NW40   | 4.0 kW
GXS250  | 250 m³/h      | 1×10⁻² mbar  | ISO63  | 7.5 kW
GXS450  | 450 m³/h      | 1×10⁻² mbar  | ISO100 | 15.0 kW
GXS750  | 750 m³/h      | 1×10⁻² mbar  | ISO160 | 22.0 kW
용도: 태양광, 이차전지, 코팅, 일반 산업 드라이 공정

■ GXS+GXB 조합 — GXS + 루츠 부스터
모델           | 배기속도(60Hz) | 얼티밋        | 인렛
GXS160/1750   | 780 m³/h      | 5×10⁻³ mbar  | NW40
GXS250/2600   | 1427 m³/h     | 5×10⁻³ mbar  | ISO63
GXS450/2600   | 1940 m³/h     | 5×10⁻³ mbar  | ISO100
GXS450/4200   | 2101 m³/h     | 5×10⁻³ mbar  | ISO100
GXS750/2600   | 2010 m³/h     | 5×10⁻³ mbar  | ISO160
GXS750/4200   | 2610 m³/h     | 5×10⁻³ mbar  | ISO160

■ EXS 시리즈 — 부식성 공정용 드라이 스크류 (BoV 옵션)
모델    | 배기속도(60Hz) | 얼티밋         | 인렛   | 모터
EXS160  | 160 m³/h      | 1×10⁻² mbar   | ISO63  | 7.5 kW
EXS250  | 250 m³/h      | 1×10⁻² mbar   | ISO63  | 7.5 kW
EXS450  | 450 m³/h      | 1×10⁻² mbar   | ISO100 | 11.0 kW
EXS750  | 750 m³/h      | ~8×10⁻³ mbar  | ISO100 | —
용도: 반도체 부식성 가스 공정 (Cl₂, HF, NF₃ 등)

■ EDS 시리즈 — 드라이 스크류, 중형 산업
모델    | 배기속도(60Hz) | 얼티밋          | 인렛   | 모터
EDS200  | 230 m³/h      | 5×10⁻² mbar    | ISO63  | 6.4 kW
EDS300  | 312 m³/h      | 1×10⁻² mbar    | ISO100 | 8.2 kW
EDS480  | 459 m³/h      | 1.3×10⁻² mbar  | ISO100 | 11.0 kW

■ EDC 시리즈 — 드라이 클로, 저진공 산업용 (50~140 mbar)
모델    | 배기속도(60Hz) | 얼티밋      | 인렛  | 모터
EDC65   | 78 m³/h       | 50 mbar    | NW40  | 1.8 kW
EDC150  | 180 m³/h      | 50 mbar    | NW40  | 3.7 kW
EDC300  | 360 m³/h      | 140 mbar   | ISO63 | 6.2 kW
용도: 저진공 산업 공정, 거친 진공 (10~200 mbar 범위)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[D] 반도체 드라이 펌프
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ iXH 시리즈 — 반도체 드라이 스크류 (60Hz 전용)
모델      | 배기속도(60Hz) | 얼티밋          | 인렛
iXH100    | 97.8 m³/h     | 3.1×10⁻² mbar  | ISO63
iXH200H   | 217.6 m³/h    | 6.9×10⁻² mbar  | ISO63
iXH610    | 645.8 m³/h    | 1.7×10⁻³ mbar  | ISO100
iXH1210H  | 714.1 m³/h    | 5.4×10⁻³ mbar  | ISO100
iXH1220H  | 857.0 m³/h    | 3.6×10⁻³ mbar  | ISO100
iXH1820H  | 1021.1 m³/h   | 3.5×10⁻³ mbar  | ISO160
iXH3030   | 879.5 m³/h    | 4.7×10⁻³ mbar  | ISO160
iXH3045H  | 1168.7 m³/h   | 7.9×10⁻³ mbar  | ISO160
iXH4550HT | 1326.5 m³/h   | 8.3×10⁻³ mbar  | ISO160
iXH6050H  | 1300.1 m³/h   | 7.2×10⁻³ mbar  | ISO160
용도: 반도체 CVD, ALD, 식각 공정 (부식성·반응성 가스 내구성)

■ nXRi 시리즈 — 멀티 루츠 드라이 (반도체, 소형)
모델     | 배기속도 | 얼티밋        | 인렛
nXR30i   | 30 m³/h | 3×10⁻² mbar  | NW25
nXR40i   | 40 m³/h | 3×10⁻² mbar  | NW25
nXR60i   | 60 m³/h | 3×10⁻² mbar  | NW40
nXR90i   | 90 m³/h | 3×10⁻² mbar  | NW40
nXR120i  | 120 m³/h| 3×10⁻² mbar  | NW40
용도: 반도체 소형 챔버, 저전력 드라이 배기

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[E] 루츠 부스터 (EH 시리즈 — 단독 사용 불가, 백킹펌프 필수)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
모델     | 배기속도(60Hz) | 모터
EH500    | 375 m³/h      | 2.2 kW
EH1200   | 605 m³/h      | 2.2 kW
EH3000   | 1435 m³/h     | 3.0 kW
EH6500   | 3110 m³/h     | 11.0 kW
EH10000  | 4985 m³/h     | 11.0 kW
주의: 반드시 오일펌프(E2M/nES) 또는 드라이 펌프와 조합하여 사용

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[F] 터보분자 펌프 (TMP) — N₂ 기준
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ nEXT 시리즈
모델        | 배기속도   | 인렛    | 최대 FV압력   | 얼티밋
nEXT240D    | 240 L/s   | ISO100  | 9.5 mbar     | 5×10⁻¹⁰ mbar
nEXT300D    | 300 L/s   | ISO100  | 9.5 mbar     | 5×10⁻¹⁰ mbar
nEXT400D    | 400 L/s   | ISO160  | 10 mbar      | 5×10⁻¹⁰ mbar
nEXT730D    | 730 L/s   | ISO160  | 15 mbar      | 5×10⁻¹⁰ mbar
nEXT930D    | 925 L/s   | ISO200  | 15 mbar      | 5×10⁻¹⁰ mbar
nEXT1230H   | 1250 L/s  | ISO200  | 15 mbar      | 5×10⁻¹⁰ mbar
nEXT2807M   | 2350 L/s  | ISO250F | 1.4 mbar     | 5×10⁻¹⁰ mbar (마그레브)
nEXT3207M   | 3200 L/s  | ISO320F | 1.4 mbar     | 5×10⁻¹⁰ mbar (마그레브)

■ iS 시리즈 — 대형 TMP
iS2207C (ISO200F) | 1850 L/s | FV ≤2.0 mbar | ult 1×10⁻⁸ mbar
iS2207C (ISO250F) | 2200 L/s | FV ≤2.0 mbar | ult 1×10⁻⁸ mbar

■ iXA 시리즈 — 초대형 TMP
iXA3306C (ISO250F) | 2650 L/s | FV ≤2.66 mbar | ult 1×10⁻⁸ mbar
iXA3306C (ISO320F) | 3200 L/s | FV ≤2.66 mbar | ult 1×10⁻⁸ mbar
iXA4506C (ISO320F) | 3800 L/s | FV ≤2.66 mbar | ult 1×10⁻⁸ mbar
iXA4506C (ISO400F) | 4000 L/s | FV ≤2.66 mbar | ult 1×10⁻⁸ mbar

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[G] 일체형 터보 펌핑 시스템
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ T-Station 85
모델                    | 배기속도 | 얼티밋        | 백킹
T-Station 85W (NW40)   | 47 L/s  | 5×10⁻⁸ mbar  | E2M1.5 오일
T-Station 85W (ISO63)  | 84 L/s  | 5×10⁻⁹ mbar  | E2M1.5 오일
T-Station 85D (NW40)   | 47 L/s  | 5×10⁻⁸ mbar  | XDD1 드라이
T-Station 85D (ISO63)  | 84 L/s  | 5×10⁻⁸ mbar  | XDD1 드라이

■ nEXT Station
모델                       | 배기속도 | 얼티밋         | 백킹
nEXT Station 85  (ISO63)  | 84 L/s  | 5×10⁻¹⁰ mbar  | nXDS/RV/XDD 선택
nEXT Station 240 (ISO100) | 240 L/s | 5×10⁻¹⁰ mbar  | nXDS/RV 선택
nEXT Station 300 (ISO100) | 300 L/s | 5×10⁻¹⁰ mbar  | nXDS/RV 선택
nEXT Station 400 (ISO160) | 400 L/s | 5×10⁻¹⁰ mbar  | nXDS/RV 선택

■ TPS — Turbo pumping Station
모델            | 배기속도 | 얼티밋         | 백킹 선택 옵션
TPS85 (NW40)   | 47 L/s  | 5×10⁻⁹ mbar   | E2M1.5/XDD1/mXDS3s/nXDS6i
TPS85 (ISO63)  | 84 L/s  | 5×10⁻⁹ mbar   | E2M1.5/XDD1/nXDS6i
TPS240 (ISO100)| 240 L/s | 6×10⁻⁸ mbar   | RV5/RV12/nXDS6i~15i
TPS300 (ISO100)| 300 L/s | 6×10⁻⁸ mbar   | RV5/RV12/nXDS15i
TPS400 (ISO160)| 400 L/s | 1×10⁻⁸ mbar   | RV12/nXDS15i/nXDS20i

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[H] 진공 범위별 펌프 선택 가이드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
대기압 ~ 10 mbar     → EDC 드라이 클로 (산업용 거친 진공)
10 ~ 0.1 mbar        → GXS/EDS 드라이 스크류, E2M 오일, nES 오일
0.1 ~ 1×10⁻³ mbar   → RV, E2M+EH 조합, GXS+GXB 조합, nXDS 스크롤
1×10⁻³ ~ 10⁻⁵ mbar  → 터보펌프(nEXT) + 적합한 백킹펌프 조합 필수
10⁻⁵ mbar 이하       → 터보펌프(nEXT/iS/iXA) + 고진공 전용 구성

오일프리(청정) 필요 시: nXDS, GXS, EXS, nXRi, iXH — 오일 계열 배제
오일허용 대용량 필요 시: E2M, nES, E2M+EH 조합

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[I] 공정/용도별 추천 가이드
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
반도체 CVD·ALD·식각    → iXH 드라이 스크류 (부식성 가스 내구성 필수)
OLED 증착·스퍼터링     → nXDS + 터보펌프 (청정 고진공, 오일프리)
질량분석기(MS)/가스분석 → nXDS6i 또는 TPS85/nEXT Station 84 L/s
동결건조(식품·제약)     → E2M 오일 + 가스밸러스트 / nXDS 스크롤 (수증기 처리)
진공 오븐·소형 진공로  → RV, E2M 소형 (간헐 운전, 소규모)
대형 진공로·금속열처리 → E2M275 또는 nES630 + EH 부스터
이차전지 전극건조      → GXS 드라이 스크류 (수분 내구성)
태양광 패널 코팅       → GXS+GXB 조합 (대용량 드라이)
수소연료전지           → GXS 드라이 (폭발성 가스, 오일프리)
리크 디텍터 백킹       → nXDS6i 또는 E2M1.5
초미세 가공·리소그래피 → iXA4506C 4000 L/s (초대형 TMP)
코팅 장비·R&D 고진공  → T-Station 85 또는 nEXT Station 시리즈
항공우주·핵융합·가속기 → iXA 또는 nEXT 마그레브 (극고진공)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[K] Edwards 공식 Knowledge Hub 인사이트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 납기 관련
Q: 에드워드 펌프 납기가 왜 이렇게 오래 걸리나요?
A: 에드워드 표준 납기는 모델에 따라 8~16주입니다. 중국 세관 수출통제 강화(일부 모델 3~4주 추가), 핵심 부품 글로벌 수급 불안정이 겹치면 20주 이상 걸리는 경우도 있습니다. 설비 가동일 기준 최소 18~20주 전 발주를 권장합니다.

Q: 급하게 필요한데 어떻게 하면 되나요?
A: ① 국내 재고 보유 여부 먼저 확인 ② 배기속도·플랜지·전원 사양이 맞는 대체 모델 검토 ③ 스마텍 선재고 운용 모델 확인. 스마텍은 반복 납품 이력 모델의 재고를 선제 관리하고 있어 일부 모델은 즉시 출고 가능합니다.

■ 유지보수 주기 (일반 기준)
오일 로터리 베인 (E2M/RV): 오일 교환 2,000~4,000시간 또는 6개월, 오버홀 20,000시간
드라이 스크롤 (nXDS): 팁 실 8,000~10,000시간, 오버홀 20,000시간
드라이 스크류 (GXS/iXH): 기어오일 점검 6개월, 오버홀 20,000~40,000시간
터보펌프 (nEXT): 베어링 35,000시간

■ 트러블슈팅 — iXH DP TEMP HIGH 알람
원인 1: 부식성 가스 유입으로 로터·스테이터 부식 → 마찰열 상승
원인 2: 냉각수 라인 물때 막힘 → 열 배출 불가
응급 대응: ① 냉각수 입·출수 온도·유량 확인 → ② 배기 포트 분말 점검 → ③ 스마텍 연락

■ 트러블슈팅 — 오일 로터리 베인 (E2M/RV)
증상: 얼티밋 불량 → 오일 오염/부족/베인 마모/오일 씰 손상
증상: 오일 역류 → 오일 과다/배기 필터 막힘
증상: 소음·진동 → 오일 부족/이물질/베어링 마모 → 즉시 운전 중단
증상: 모터 과열 → 고압 장시간 운전/냉각 불량/전압 불균형

■ 펌프 선정 시 확인사항
① 필요한 도달 진공도 ② 챔버 용적 및 목표 펌프다운 시간
③ 공정 가스 종류 ④ 오일프리 여부 ⑤ 전원 사양 ⑥ 설치 환경

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[L] 스마텍 거래처 분류 — 내부 참고용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※ 사용 지침:
- 사용자가 본인 회사명을 언급하면 거래 관계 톤 조정에만 활용
- 거래처 명단을 직접 나열·노출하지 말 것
- 특정 회사 거래 여부를 다른 사용자에게 확인해주지 말 것

■ DEALER (35개사): 더베큠, 랩컴퍼니, 리더스베큠 외 다수
■ OEM (15개사): ㈜썸백ENG, ㈜이젠테크 외 다수
■ ENDUSER (31개사): 국방과학연구소, 기초과학연구원 외 다수
`;

export async function POST(req: NextRequest) {
  const { messages, userId, tier, company, userName, userEmail } = await req.json();

  // ─── 주요 제품 파트번호 DB 조회 ───────────────────────────────
  const products = await prisma.product.findMany({
    where: { isImportant: true },
    select: { partNo: true, description: true, category: true, costPrice: true },
    take: 100,
  });

  // ─── tier별 가격 계산 ─────────────────────────────────────────
  const multiplier = userId ? await getMultiplier(tier ?? "PUBLIC") : null;

  const productContext = products
    .map((p: { partNo: string; description: string; category: string | null; costPrice: number }) => {
      if (multiplier !== null && p.costPrice > 0) {
        const price = Math.round(p.costPrice * multiplier / 1000) * 1000;
        return `[${p.partNo}] ${p.description} (${p.category}) — ${formatKRW(price)}`;
      }
      return `[${p.partNo}] ${p.description} (${p.category})`;
    })
    .join("\n");

  // ─── 로그인 유저 이력 조회 ────────────────────────────────────
  let userContext = "";
  if (userId) {
    const [recentQuotes, recentOrders, recentRepairs] = await Promise.all([
      prisma.quote.findMany({
        where: { userId: Number(userId), status: { not: "DRAFT" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            include: { product: { select: { partNo: true, description: true } } },
          },
        },
      }),
      prisma.order.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          quote: {
            include: {
              items: {
                include: { product: { select: { partNo: true, description: true } } },
              },
            },
          },
        },
      }),
      prisma.repairRequest.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          repairNo: true,
          pumpModel: true,
          status: true,
          createdAt: true,
          totalAmount: true,
        },
      }),
    ]);

    const quoteLines = recentQuotes.map((q: any) => {
      const items = q.items
        .map((i: any) =>
          i.product
            ? `${i.product.partNo}×${i.quantity}`
            : `${i.customPartNo ?? "미상"}×${i.quantity}`
        )
        .join(", ");
      return `  · 견적 #${q.id} (${q.createdAt.toLocaleDateString("ko-KR")}) — ${items || "품목 없음"} [${q.status}]`;
    });

    const orderLines = recentOrders.map((o: any) => {
      const items = o.quote?.items
        .map((i: any) =>
          i.product
            ? `${i.product.partNo}×${i.quantity}`
            : `${i.customPartNo ?? "미상"}×${i.quantity}`
        )
        .join(", ");
      return `  · 발주 #${o.id} (${o.createdAt.toLocaleDateString("ko-KR")}) — ${items || "품목 없음"} [${o.status}]`;
    });

    const repairLines = recentRepairs.map((r: any) =>
      `  · 수리 ${r.repairNo} — ${r.pumpModel} (${r.createdAt.toLocaleDateString("ko-KR")}) [${r.status}]`
    );

    const tierLabel: Record<string, string> = {
      DEALER: "딜러",
      KEY_DEALER: "키딜러",
      VIP_DEALER: "VIP딜러",
      OEM: "OEM",
      ENDUSER: "최종사용자",
      ADMIN: "관리자",
      PENDING: "승인대기",
    };

    userContext = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[고객 정보 — 현재 로그인 중]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
회사명: ${company || "미설정"}
담당자: ${userName || ""}
이메일: ${userEmail || "미등록"}
등급: ${tierLabel[tier] ?? tier} (가격 배율: ×${multiplier?.toFixed(2)})

${quoteLines.length > 0 ? `최근 견적 이력:\n${quoteLines.join("\n")}` : "견적 이력 없음"}

${orderLines.length > 0 ? `최근 발주 이력:\n${orderLines.join("\n")}` : "발주 이력 없음"}

${repairLines.length > 0 ? `최근 수리 이력:\n${repairLines.join("\n")}` : "수리 이력 없음"}
`;
  }

  // ─── 가격 안내 원칙 ───────────────────────────────────────────
  const pricingInstruction = userId
    ? `
[가격 안내 원칙 — 로그인 고객]
- 현재 고객 등급: ${tier} (배율 ×${multiplier?.toFixed(2)})
- 제품 파트번호 목록에 가격이 표시된 제품은 해당 가격을 그대로 안내한다
- 가격이 없는 제품(costPrice=0 또는 목록 미등재)은 "담당자에게 별도 문의 필요"로 안내한다
- 납기는 표준 8~16주를 기준으로 안내하되, 급한 경우 재고 확인을 권유한다
- 고객이 "견적서 이메일로 보내줘" 또는 유사 요청 시, 답변 마지막에 정확히 이 형식으로 한 줄 추가한다:
  [[SEND_EMAIL]]
`
    : `
[가격 안내 원칙 — 비로그인]
- 가격은 절대 언급하지 않는다
- 가격 문의 시: "로그인 후 등급별 단가를 바로 확인하실 수 있습니다. 로그인하시거나 견적 문의를 남겨주세요."로 안내한다
`;

  const systemPrompt = `당신은 스마텍(Smartech)의 수석 진공기술 엔지니어입니다.
Edwards Vacuum 한국 공식 대리점에서 20년 이상 진공펌프 설계·설치·수리·컨설팅을 직접 수행해온 현장 전문가입니다.
반도체·디스플레이·이차전지·제약·연구소 등 다양한 산업 현장 경험을 보유하고 있습니다.
모든 답변은 한국어로, 현장 경험을 바탕으로 실용적이고 정확하게 합니다.

[답변 원칙]
- 고객의 증상·상황을 먼저 파악하고, 가능한 원인을 구체적으로 제시한다
- 단순 스펙 나열보다 "왜 그런지", "어떻게 하면 되는지" 실질적 조언을 우선한다
- 계산이 필요한 경우 공식을 인용하고 직접 계산해서 보여준다
- 스펙 데이터에 없는 제품은 추측하지 않고 "스마텍 전문가에게 직접 문의해 주세요"로 안내한다
- 위험하거나 즉각 조치가 필요한 상황은 명확히 경고한다

${pricingInstruction}

${SPEC_CONTEXT}
${userContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[J] 취급 제품 파트번호 목록 (DB 기준)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${productContext}`;

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1536,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
