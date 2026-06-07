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
[M] nXDS 스크롤 드라이 펌프 — 서비스 표시기 · 알람 · 가스발라스트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(출처: Edwards nXDS 한글 매뉴얼 A735-01-890)

■ 서비스 표시기 LED 패턴 (표 15)
녹색 LED가 깜빡거리는 패턴으로 서비스 시기를 알림. 알람이 아니므로 즉시 정지 불필요.

| LED 패턴 | 의미 | 조치 |
|---|---|---|
| ON 1초 / OFF 1초 반복 | 팁씰 교체 시기 점검 리마인더 (약 30개월) | 펌프 성능 확인 후 필요 시 팁씰 교체 (키트 A735-01-801) |
| ON 3초 / OFF 1초 반복 | 베어링 서비스 시기 도달 (약 60개월) | Edwards 서비스 센터에 베어링 교체 의뢰 (키트 A735-01-802) |
| ON 3초 / OFF 3초 반복 | 컨트롤러 서비스 시기 (약 120개월) | Edwards 문의 |

서비스 표시기 리셋 방법: 대기 속도 증가 버튼 + 감소 버튼 동시에 5초 이상 누름

■ 알람 표시기 코드 — 적색 LED 깜빡임 (표 16)
적색 LED가 깜빡거리면 펌프가 정지함. s = 짧은 플래시(0.5초), L = 긴 플래시(1.5초)

| 오류 번호 | 패턴 | 원인 | 조치 |
|---|---|---|---|
| 0 | ssssss (짧은 6번) | 과부하 타임아웃 (지속 고압) | 흡입구·배기구 막힘 확인, 연결 배관 점검 |
| 1 | Lsssss (긴1+짧은5) | 컨트롤러 소프트웨어 오류 | 전원 껐다 켜기 → 지속 시 Edwards 문의 |
| 2 | sLssss (짧1+긴1+짧4) | 컨트롤러 내부 구성 실패 | 전원 껐다 켜기 → 지속 시 Edwards 문의 |
| 3 | ssLsss | 가속 타임아웃 | 흡배기 막힘 확인 |
| 4 | sssLss | 과전류 트립 / 하드웨어 오류 | 전원 껐다 켜기 → 지속 시 Edwards 문의 |
| 5 | ssssLs | 자체 테스트 오류 | 전원 껐다 켜기 → 지속 시 Edwards 문의 |
| 6 | sssssL | 직렬 제어 모드 인터록 | 직렬 활성화 재활성화 후 명령 전송 |

■ 가스 발라스트 — 성능 영향 및 유량 (표 5)

| 모델 | 발라스트 OFF 얼티밋 | 발라스트 ON 얼티밋 | 발라스트 ON 유량 |
|---|---|---|---|
| nXDS6i | 2×10⁻² mbar | 5×10⁻² mbar | 12 l/min |
| nXDS10i | 7×10⁻³ mbar | 4×10⁻² mbar | 16 l/min |
| nXDS15i | 7×10⁻³ mbar | 4×10⁻² mbar | 31 l/min |
| nXDS20i | 3×10⁻² mbar | 6×10⁻² mbar | 24 l/min |

가스 발라스트 사용 시기:
- 위치 0 (OFF): 최고 진공도 필요 시, 건식 가스 펌핑 시
- 위치 1 (ON): 응축성 증기 펌핑 시, 펌프 오염 제거 시
응축성 증기 펌핑 전 발라스트 ON 상태로 20분간 예열 권장

N2 가스 발라스트 어댑터:
- A735-01-809 (미세 리스트릭터 포함) / A735-01-811 (리스트릭터 없음)
- 가스 발라스트 포트에 장착, 불활성 가스(N2) 공급. 리스트릭터가 유량 자동 제어
- 공급 압력: 최대 0.5 bar 게이지

■ 소음 발생 원인별 점검 (그림 14 흐름 차트)
1. 흡입구 막힘 여부 확인 → 막혔으면: 흡입구 씰 오프 후 소음 변화 확인
2. 가스 발라스트 열려있는지 확인 → 열렸으면: 발라스트 0(OFF)으로 설정 후 확인
3. 위 조치 후에도 소음 지속 → 기계적 원인:
   - 스크롤 충돌: 고정 스크롤 제거 → 스크롤 검사·청소
   - 베어링 손상: Edwards 반환 수리
   - 오염: 고정 스크롤 제거 → 스크롤 및 플리닝 챔버 청소

■ nXDS 유지보수 계획 (표 14)

| 작업 | 주기 | 관련 서비스 표시기 |
|---|---|---|
| 흡입구 스트레이너 검사·청소 | 12개월 | 없음 (예방 점검) |
| 외부 팬 커버 청소 | 12개월 | 없음 |
| 펌프 성능 확인 (팁씰 점검) | 30개월 | ON 1초/OFF 1초 |
| 베어링 교체 | 60개월 | ON 3초/OFF 1초 |
| 컨트롤러 교체 | 120개월 | ON 3초/OFF 3초 |

팁씰 교체 후 길들임 운전 24~48시간 필요 (그 사이 얼티밋 성능이 점진적으로 개선됨)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[N] EH 메카니칼 부스터 펌프 — 오일 및 유지보수
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(출처: Edwards EH Manual Korean A301-51-890)

■ 권장 오일 종류
- 일반 환경 EH 펌프: Edwards Ultragrade 20 (미네럴 오일)
- 산소·부식성 가스 환경 EH 펌프: Fomblin YVAC 16/6 (PFPE 오일)
- 뒤쪽 베어링 그리스 (EH250, EH500만): Fomblin AR555
미네럴 오일 → PFPE로 교환 시 Edwards 서비스 의뢰 필수 (직접 교환 시 폭발 위험)

■ 오일 용량 (단위: 리터)

| 모델 | 유체동력구동장치 (기어박스) | 기어커버 | 샤프트씰 리저버 |
|---|---|---|---|
| EH250 | 1.5 L | — | 0.125 L |
| EH500 | 1.5 L | — | 0.125 L |
| EH1200 | 2.4 L | 1.25 L | 0.125 L |
| EH2600 | 6.5 L | 3.5 L | 0.15 L |
| EH4200 | 6.5 L | 3.5 L | 0.15 L |

■ 오일 충진 방법 (3곳 순서대로)
1. 기어박스: 상단 주입마개 제거 → 투시유리에서 반사판 상단까지 채움 → 주입마개 조임
2. 샤프트씰 리저버: 벤트 가능한 주입마개 제거 → 반사판 상단까지 채움 → 주입마개 조임
   벤트 가능한 주입마개 반드시 사용 (일반 마개 사용 시 리저버 가압 → 투시유리 파손)
3. 기어커버 (EH1200·EH2600·EH4200만): 상단 주입마개 제거 → 반사판 중간까지 채움 → 주입마개 조임

■ EH 유지보수 계획 (표 21)

| 작업 | 주기 |
|---|---|
| 오일량 점검 | 매일 (인화성 오일) / 매주 (비인화성) |
| 펌프 연결부 검사 | 매월 |
| 오일 교환 | 12개월 |
| 뒤쪽 베어링 윤활 (EH250·EH500만) | 12개월 |
| 정밀 검사 (오버홀) | 6년 |

EH 부스터는 반드시 백킹 펌프(E2M, GXS, iXH 등)와 함께 사용 (단독 운전 절대 금지)
오일량이 반사판 하단 이하로 내려가면 즉시 보충 (펌프 손상 위험)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[O] iXH 드라이 펌프 — 알람 코드 및 온도 트립 기준
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(출처: Edwards iXH/iXL/pXH 매뉴얼 M561-00-880)

■ PDT 주요 경고 (Warning) — 펌프는 계속 운전, 원인 파악 권장

| 경고 코드 | PDT 표시 | 원인 | 조치 |
|---|---|---|---|
| Warning 39.11 | Exh Press High | 배기 압력 높음 | 배기 라인 밸브·막힘 확인 |
| Warning 54.11 | MB Temp High | 부스터 온도 높음 | 냉각수 연결·유량·온도 확인 |
| Warning 57.11 | DP E/C Temp High | 드라이펌프 엔드커버 온도 높음 | 냉각수 확인 |
| Warning 63.11 | DP Temp High | 드라이펌프 내부 온도 높음 | 냉각수 확인 |
| Warning 70.11 | DP Temp 2 High | 드라이펌프 온도(2) 높음 | 냉각수 확인 |
| Warning 35.10 | N2 Purge Low | N2 퍼지 유량 낮음 | N2 공급 라인·필터 점검 |
| Warning 186.01 | DP INV xxxx | 드라이펌프 인버터 경고 | 아래 인버터 코드 표 확인 |

■ PDT 주요 알람 (Alarm) — 펌프 자동 정지

| 알람 코드 | PDT 표시 | 원인 | 조치 |
|---|---|---|---|
| Alarm 1.01 | Stop Activated | 비상정지(EMS) 활성화 | EMS 버튼 리셋 후 재시동 |
| Alarm 39.12 | Exh Press High | 배기 압력 최대값 초과 | 배기 라인 즉시 점검 |
| Alarm 54.12 | MB Temp High | 부스터 온도 최대값 초과 → 부스터 정지 | 30분 냉각 후 원인 파악 |
| Alarm 57.12 | DP E/C Temp High | 드라이펌프 엔드커버 온도 최대값 초과 | 냉각수 확인 |
| Alarm 63.12 | DP Temp High | 드라이펌프 내부 온도 최대값 초과 → 전체 정지 | 냉각수 확인, 30분 냉각 후 재시동 |
| Alarm 70.12 | DP Temp 2 High | 드라이펌프 온도(2) 최대값 초과 | 냉각수 확인 |
| Alarm 184.10 | Dry Pump Stopped | 드라이펌프 속도 극히 낮음 (로터 잠김?) | 전원 껐다 켜기 후 Edwards 문의 |
| Alarm 174.10 | Booster Stopped | 부스터 속도 낮음 | Edwards 문의 |
| Alarm 186.01 | DP INV xxxx | 드라이펌프 인버터 알람 | 아래 인버터 코드 표 확인 |

■ iXH DP Temp 트립 온도 기준 (표 20)

| 모델 | 경고 온도 | 알람 온도 |
|---|---|---|
| iXH100, iXH200H (표준) | 130°C | 140°C |
| iXH100, iXH200H (T variant) | 160°C | 170°C |
| iXH610, iXH1210H, iXH1220H, iXH1820H | 160°C | 170°C |
| iXH3030 (표준) | 160°C | 170°C |
| iXH3030T | 170°C | 180°C |
| iXH450H, iXH500H | 175°C | 185°C |

■ 인버터 알람 코드 (PDT 표시: DP INV xxxx yyyy — 16진수 형태)

| 16진수 코드 | 의미 | 조치 |
|---|---|---|
| 0040 | OVERLOAD_TO: 과부하 타임아웃 | 흡입구 막힘·지속 고압 확인 |
| 0080 | ACCELERATION_TO: 가속 타임아웃 (60초 내 10Hz 미달) | 배관 막힘 확인 |
| 0004 | OVERI: 모터 과전류 | Edwards 문의 |
| 0008 | OVERT: 인버터 과열 | 냉각수 점검 |
| 0002 | OVERV: 인버터 과전압 | 전원 품질 확인 |

■ 알람 후 재시동 절차
1. 알람 원인 먼저 파악·해결
2. 고온 알람 시: 최소 30분 냉각 후 재시동
3. EMS 알람 시: EMS 버튼 돌려서 해제 후 재시동
4. 로터 잠김(Dry Pump Stopped) 의심 시: 무리한 재시동 금지 → Edwards 문의

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[P] 드라이펌프 통신 — Micro TIM 및 직렬 통신
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(출처: Edwards Micro TIM D373-60-880, TIC Serial Comms D397-30-880)

■ Micro TIM — 종류 선택 기준

Micro TIM은 드라이펌프 본체의 툴 인터페이스 슬롯에 직접 꽂아 사용하는 병렬 인터페이스 모듈이다.
RS232/RS485 직렬 통신이 아니라 병렬 접점(Parallel I/O) 방식으로 반도체 장비(Tool)와 연결된다.

| 종류 | 파트번호 | 커넥터 | 주요 사용 장비 |
|---|---|---|---|
| SPI Micro-TIM | D373-60-310 | CPC 16핀 | SPI(SEMI Physical Interface) 규격 장비 |
| MCM Micro-TIM | D373-60-320 | CPC 16핀 | Applied Materials 등 / GXS·CXS 전용 |
| TEL Micro-TIM | D373-60-330 | D-Sub 25핀 | Tokyo Electron Limited(TEL) 장비 |
| SEMI E73 Micro-TIM | D373-60-340 | D-Sub 15핀 | SEMI E73 표준 준수 장비 |
| LAM Alliance Micro-TIM | D373-60-350 | D-Sub 25핀 | LAM Research 장비 |
| Novellus C3 Micro-TIM | D373-60-360 | D-Sub 9핀 | Novellus(현 Lam) 장비 |
| Hitachi Micro-TIM | D373-60-370 | D-Sub 37핀 | Hitachi 장비 |

GXS·CXS 펌프는 반드시 MCM Micro-TIM(D373-60-320)만 사용할 것.

■ Micro TIM 주요 입력 신호 (병렬)
- Both Pumps On/Off: 전압 또는 무전압 접점으로 양쪽 펌프 기동/정지
- AUC (Active Utility Control): 절전·자동 제어 모드 전환
- Gate Valve Open/Close: TEL/HIT 타입에서 게이트 밸브 제어
- Speed Control: SPI 타입에서 DC 전압으로 펌프 속도 가변 제어 (>10V → 대기 속도)

■ Micro TIM 주요 출력 신호 (병렬)
- Both Pumps Running: 펌프 운전 중 접점 닫힘
- General Warning: 경고 없을 때 접점 닫힘 (이상 시 열림)
- Alarm: 알람 없을 때 접점 닫힘 (알람 발생 시 열림)
- Gas Flow Warning: 가스 퍼지 유량 이상 시
- Exhaust Pressure Warning: 배기 압력 이상 시

전원 차단 시 접점 전체 열림. 1초 이내 순간 정전은 접점 상태 유지.

■ Micro TIM 제어권 (Take and Release Control)
- Micro TIM이 장착되면 자동으로 제어권 획득 시도
- 다른 모듈(PDT 등)이 제어권을 갖고 있으면 취득 불가
- 알람 발생 시 Micro TIM은 제어권을 자동 해제 → 다른 모듈로 알람 해제 가능

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Q] TIC 컨트롤러 RS232/RS485 직렬 통신
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(출처: Edwards TIC Serial Communications D397-30-880)

■ TIC 모델별 파트번호
| 모델 | 파트번호 |
|---|---|
| TIC Instrument Controller | D397-00-000 |
| TIC Instrument Controller 6-Gauge | D397-01-000 |
| TIC Turbo Controller 100W | D397-11-000 |
| TIC Turbo Controller 200W | D397-12-000 |
| TIC Turbo & Instrument Controller 100W | D397-21-000 |
| TIC Turbo & Instrument Controller 200W | D397-22-000 |

■ RS232 / RS485 전환 방법
Object 930 (PC comms) 설정으로 전환:
- RS232: !S930 0 (기본값)
- RS485: !S930 1
설정 후 재부팅 없이 즉시 적용됨.

■ 통신 기본 규칙
- 마스터/슬레이브 방식: TIC가 슬레이브, PC(또는 PLC)가 마스터
- 메시지 종류: 명령(! 시작), 쿼리(? 시작), 응답(= 또는 * 시작)
- 모든 메시지는 캐리지 리턴(CR)으로 끝남
- 응답 코드 0 = 정상, 그 외는 오류 (표 3 참조)

■ TIC 통신 응답 오류 코드 (Table 3)
| 코드 | 의미 |
|---|---|
| 0 | 정상 |
| 1 | 잘못된 Object ID |
| 2 | 잘못된 쿼리/명령 |
| 3 | 파라미터 누락 |
| 4 | 파라미터 범위 초과 |
| 5 | 현재 상태에서 유효하지 않은 명령 (예: 병렬 제어 중 직렬 명령) |
| 6 | 데이터 체크섬 오류 |
| 7 | EEPROM 읽기/쓰기 오류 |
| 8 | 처리 시간 초과 |
| 9 | 잘못된 Config ID |

■ 주요 Object ID 및 기능
| Object ID | 항목 | 주요 기능 |
|---|---|---|
| 902 | TIC Status | 터보·백킹·게이지·릴레이 전체 상태 조회 |
| 904 | Turbo Pump | 터보 ON/OFF (!C904 1/0), 상태·알람·우선도 조회 |
| 905 | Turbo Speed | 터보 속도 (0.0~110.0%) 조회 |
| 906 | Turbo Power | 터보 소비전력 (W) 조회 |
| 907 | Turbo Normal | 정상속도 도달 여부 (4=yes) |
| 908 | Turbo Standby | 스탠바이 모드 설정/조회 |
| 910 | Backing Pump | 백킹 펌프 ON/OFF, 상태 조회 |
| 913~915 | Gauge 1~3 | 게이지 압력 조회·설정 |
| 916~918 | Relay 1~3 | 릴레이 ON/OFF, 셋포인트 설정 |
| 929 | Pressure Units | 압력 단위 설정 (kPa=1, mbar=2, Torr=3) |
| 930 | PC Comms | RS232(0) / RS485(1) 전환 |

■ TIC 터보 컨트롤러 알람 코드 (Alert ID)
TIC 상태 쿼리(?V902 또는 ?V904) 응답에 포함되는 알람 ID:

| Alert ID | 의미 | 조치 |
|---|---|---|
| 0 | 정상 (No Alert) | — |
| 25 | RampUp Timeout — 기동 타임아웃 | 배킹 압력 확인, 터보 기계 점검 |
| 26 | Droop Timeout — 정상 속도 미달 | 백킹 펌프·챔버 압력 확인 |
| 27 | Run Hours High — 운전 시간 과다 | 서비스 점검 권고 |
| 28 | SC Interlock — 안전 인터록 | 인터록 배선·조건 확인 |
| 32 | DX Fault — 드라이 펌프 오류 | 드라이 펌프 알람 확인 |
| 33 | Temp Alert — 과열 | 냉각수 및 환경 온도 확인 |
| 34 | SYSI Inhibit — 시스템 인터록 | 시스템 인터록 조건 해제 |
| 35 | Ext Inhibit — 외부 인터록 | 외부 인터록 신호 확인 |
| 36 | Temp Inhibit — 온도 인터록 | 온도 회복 후 재기동 |
| 46 | Brownout/Short — 전원 저전압/단락 | 전원 품질 확인 |
| 47 | Service due — 서비스 주기 도달 | Edwards 정기 서비스 의뢰 |

■ TIC 터보 펌프 Full State 코드
| 상태 값 | 의미 |
|---|---|
| 0 | Stopped (정지) |
| 1 | Starting Delay (기동 대기) |
| 5 | Accelerating (가속 중) |
| 4 | Running (정상 운전) |
| 2 | Stopping Short Delay (급정지) |
| 3 | Stopping Normal Delay (정상 정지) |
| 6 | Fault Braking (오류 제동) |
| 7 | Braking (제동 중) |

■ 이온 게이지 관련 Alert ID (TIC 연결 시)
| Alert ID | 의미 | 조치 |
|---|---|---|
| 13 | Ion Em Timeout — 에미션 타임아웃 | 압력 확인 (고진공 도달 여부) |
| 14/18 | Not Struck — 아크 발화 실패 | 게이지 내부 청소 또는 교체 |
| 15/19 | Filament Fail — 필라멘트 파단 | 필라멘트 교체 |
| 22 | Emission Error — 에미션 오류 | Edwards 문의 |
| 23 | Over Pressure — 과압 (이온게이지 사용 불가 압력) | 먼저 피라니/WRG로 압력 확인 후 이온게이지 ON |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[R] WRG 게이지 — 특성·오류·사용 시 주의사항
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
(출처: Edwards WRG Instruction Manual D147-01-880)

■ WRG 개요
- 역전자 마그네트론(Inverted Magnetron) + 피라니(Pirani) 복합 게이지
- 단일 유닛으로 대기압(100 mbar)부터 고진공(10⁻⁹ mbar)까지 광범위 측정
- 측정 범위: 100 ~ 10⁻⁹ mbar (1000 mbar까지 저정확도로 표시 가능)
- 출력 신호: 2~10 V DC (오류 범위: 1.5 V 미만 또는 10.15 V 초과)
- 압력-전압 변환 공식: P = 10^(1.5V - 12) mbar

■ WRG 모델별 파트번호
| 모델 | 파트번호 | 커넥터 | 특징 |
|---|---|---|---|
| WRG-S-NW25 | D147-01-000 | FCC68(RJ45형) 8핀 | 표준, NW25 플랜지 |
| WRG-SL-NW25 | D147-11-000 | FCC68(RJ45형) 8핀 | 저자기장 (분석 장비 근처 사용) |
| WRG-D-NW25 | D147-02-000 | D-Sub 9핀 | D타입 커넥터 |
| WRG-S-DN40CF | D147-03-000 | FCC68(RJ45형) 8핀 | DN40CF 플랜지 |

■ WRG 오류 코드 (전압 출력으로 오류 표시)
| 출력 전압 | AGC/AGD 표시 | 원인 | 조치 |
|---|---|---|---|
| 1.0 V | ERR A | 피라니 튜브 실패 | 피라니 튜브 교체 또는 청소 |
| 1.1 V | ERR B | 역전자 마그네트론 오염 또는 단락 | 내부 전극 청소 또는 교체 |
| 1.2 V | ERR C | 스트라이커 필라멘트 파단 | 전극 어셈블리 교체 (D147-01-802) |
| 1.3 V | ERR D | 역전자 마그네트론 점화 실패 | 청소 또는 전극 교체 |

오류 해제: 전원 차단 또는 게이지 비활성화 시 초기화

■ WRG 대기압 교정 (ATM 설정)
1. 대기압 상태에서 전원 ON 후 최소 10분 대기
2. ATM 버튼을 도구로 누르면 자동 교정

■ WRG 진공 교정 (Vacuum 설정)
- 10⁻⁴ mbar 이하 도달 시 자동 교정 (수동 불필요)
- 게이지가 10⁻³ mbar 이하를 표시 못할 경우: 10⁻⁵ mbar 이하 도달 → ATM 버튼 누름 → 30초 대기

■ WRG 사용 시 주의사항 (단점)
1. **가스 종류 의존성**: 질소(N2)/건조공기 기준으로 교정됨. 아르곤·헬륨·수소 등 다른 가스는 측정값이 실제와 다름 → 해당 가스 교정 커브 별도 요청 필요
2. **고분자량 가스**: 분자량이 클수록 실제보다 낮은 압력을 표시 → 이온게이지 트립 압력 주의
3. **폭발성·인화성 가스 측정 금지**: 내부에 최대 3kV 고전압 발생 → 점화원이 될 수 있음
4. **자기장 영향**: 내장 마그넷이 심장박동기, 컴퓨터, 신용카드에 영향 (SL 버전은 저자기장으로 개선)
5. **오염에 취약**: 증착 공정 등 오염 환경에서 ERR B 빈발 → 주기적 청소 필요
6. **진공 분리 상태 운전 금지**: 챔버와 분리된 상태에서 전원 인가 시 고전압 노출 위험
7. **ERR A 발생 조건**: 10⁻² ~ 10² mbar 사이 압력에서 ATM·Vacuum 설정 시도 시 → 피라니 오류 코드 1V 표시

■ 이온게이지(AIM/AIGX) 사용 시 주의사항
- 반드시 피라니(WRG·APG) 먼저 켜서 충분히 펌프다운 확인 후 이온게이지 ON
- 이온게이지 안전 사용 압력: 통상 10⁻³ mbar 이하 (Over Pressure Alert ID 23 발생 조건 주의)
- 필라멘트 파단(Alert ID 15/19) 시 필라멘트 교체 필요 — 교체 후 디개싱(Degas) 실행 권장
- 오염 챔버에서 장기 사용 시 Emission Error(Alert ID 22) 발생 → 게이지 헤드 교체 또는 Edwards 서비스

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

  const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
  const userMessageText: string =
    typeof lastUserMsg?.content === "string"
      ? lastUserMsg.content
      : (lastUserMsg?.content as { text?: string }[])?.[0]?.text ?? "";

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          fullResponse += chunk.delta.text;
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();

      // 대화 기록 저장 (스트리밍 완료 후 비동기 — 응답에 영향 없음)
      prisma.chatLog.create({
        data: {
          userId: userId ? Number(userId) : null,
          company: company ?? null,
          userName: userName ?? null,
          userTier: tier ?? null,
          userEmail: userEmail ?? null,
          userMessage: userMessageText,
          aiResponse: fullResponse,
        },
      }).catch(() => {});
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
