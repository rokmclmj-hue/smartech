import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── 스펙 섹션 (pumpSpeedData.ts 기반, 정적 — 프롬프트 캐시 대상) ───────────
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
■ T-Station 85 (nEXT85H + 백킹 일체형, 컴팩트)
모델                    | 배기속도 | 얼티밋        | 백킹
T-Station 85W (NW40)   | 47 L/s  | 5×10⁻⁸ mbar  | E2M1.5 오일
T-Station 85W (ISO63)  | 84 L/s  | 5×10⁻⁹ mbar  | E2M1.5 오일
T-Station 85D (NW40)   | 47 L/s  | 5×10⁻⁸ mbar  | XDD1 드라이
T-Station 85D (ISO63)  | 84 L/s  | 5×10⁻⁸ mbar  | XDD1 드라이

■ nEXT Station (TIC 컨트롤러 + nXDS/RV 선택형 백킹)
모델                       | 배기속도 | 얼티밋         | 백킹
nEXT Station 85  (ISO63)  | 84 L/s  | 5×10⁻¹⁰ mbar  | nXDS/RV/XDD 선택
nEXT Station 240 (ISO100) | 240 L/s | 5×10⁻¹⁰ mbar  | nXDS/RV 선택
nEXT Station 300 (ISO100) | 300 L/s | 5×10⁻¹⁰ mbar  | nXDS/RV 선택
nEXT Station 400 (ISO160) | 400 L/s | 5×10⁻¹⁰ mbar  | nXDS/RV 선택

■ TPS — Turbo pumping Station 일체형 (TIC 컨트롤러, 백킹 선택형)
Source: 카탈로그 3601 0444 01 + 매뉴얼 B72301880_D
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
[K] Edwards 공식 Knowledge Hub 인사이트 (출처: edwardsvacuum.com, 2026-05 수집)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 진공 게이지 캘리브레이션 (Calibration & Uptime)
- 게이지 드리프트(오염·열·기계적 스트레스·노화)는 공정 불량·미계획 다운타임·규제 위반 유발
- Edwards 캘리브레이션 서비스: ISO 9001 / ISO 17025 / DAkkS 인증 → 감사 대응 traceable
- 자동차 코팅(스크랩률 감소), 의료 멸균(스팀/가스 침투 보장) 등 정밀 진공 공정 필수
- 키워드: 게이지 정확도, 캘리브레이션 주기, ISO 17025

■ 오일 로터리 베인(Rotary Vane) 유지보수 일반 가이드
- 작업 전 최소 1시간 냉각 필수, 토크 1.5~12 Nm 범위
- 19단계 절차: 오일 배출 → 분해 → 표면 손상 점검 → O-링·실 윤활 → 재조립
- 슬롯 면 방향 등 베인 정렬 중요
- 적용 라인업: RV / E2M / nES 시리즈 전반

■ Single-Stage 오일 실 로터리 펌프 오일·필터 교환 (nES200/nES220)
- 약 7~7.5 L 오일 충진, 베큠 그리스를 필터·O-링에 도포
- 정품 부품 + 폐오일 현지 규정 준수 의무
- 적용 라인업: nES 시리즈 (nES40~nES750 일반)

■ ERV 16 오일·필터 교환 가이드 ★신규 라인업★
- ERV 16: 단단(single-stage) 오일 실 로터리 베인 펌프
- 키트: 실링 2031000425, 필터 2031000429
- 적용: ERV 시리즈 (소형 단단 오일 실)

■ 드라이 스크롤 mXDS3 팁 실(Tip Seal) 교체
- 사용자 자가정비 가능 설계, 부품·공구 Edwards 웹샵 구매
- 정기 팁 실 교체가 진공 성능 유지의 핵심
- 적용 라인업: mXDS / nXDS 스크롤 시리즈

■ nEXT 터보 카트리지·베어링 교체 ★신규 모델 등장★
- 권장 주기: 35,000 운전시간
- 사용자 자가정비 설계 (공장 송부 불요)
- 부품: B8E200845 베어링 키트 / B8G200811 베어링 / B8G200840 매뉴얼
- 적용: nEXT55, nEXT85, nEXT55/85 Any Orientation (※ 본 SPEC의 nEXT240D 이상과 별도 소형 라인업)

■ 게이지 튜브 교체 (AIM / WRG) ★신규 카테고리: 게이지 제품군★
- 교체 시점: 파손·오염·대기/진공 보정 불가·필라멘트 손상
- WRG200: Pirani/Striker 필라멘트 손상 시 교체
- 적용: AIM(Active Inverted Magnetron, 고진공 측정), WRG(Wide Range Gauge, 광범위 측정)

■ EDO 65-100 스크롤 펌프 유지보수 ★신규 라인업★
- 서비스 주기 최대 8,000시간 또는 2년 → 다운타임 최소화
- 키트: A50871720 (EDO 필드 서비스), 2236232060 (베어링 재그리스)
- 모듈러 드라이 스크롤 — PCB 제조, 전자제품 시험, 진공 탈기(degassing) 적합
- 적용 라인업: EDO 65, EDO 100 (중형 클린 스크롤)

■ 드라이 메카니컬 펌프의 지속가능성·운영비 절감 (vs 스팀 이젝터)
- 전력 소비 대폭 감소, 보일러·물 처리 인프라 불필요
- 무오염 가스, 무폐수 → 폐기 비용 제거, 환경 규제 대응 우수
- 권장 공정: 발전, 화학, 대형 산업
- 적용 라인업: GXS / EXS / EDS 산업용 드라이 스크류 (멀티스테이지 부스터 조합)

[K-요약] 본 인사이트에서 확인된 신규/추가 라인업
- ERV 시리즈 (단단 소형 오일 로터리)
- nEXT55 / nEXT85 (소형 터보 — 본 SPEC에는 nEXT240D 이상만 등록)
- EDO 65-100 (중형 클린 스크롤 — PCB·전자 시험·진공 탈기용)
- AIM, WRG/WRG200 (진공 게이지 제품군 — 본 SPEC에 미등록 카테고리)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[L] 스마텍 거래처 분류 — 내부 참고용 (출처: 스마텍_업체분류_20260502, 81개사)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
※ 사용 지침 (반드시 준수):
- 사용자(고객)가 본인 회사명을 언급하면 이 리스트와 매칭하여 거래 관계 톤 조정에만 활용
- 매칭되면: "기존 거래처십니다. 이전 거래 이력을 참고해 더 정밀히 안내드릴 수 있도록 영업담당자가 빠르게 회신드리겠습니다" 식의 친근·신뢰 톤
- 매칭 안 되면: 신규 잠재고객으로 정중·전문 톤
- ⚠️ 거래처 명단을 직접 나열·노출하지 말 것 (예: "스마텍 고객사 알려줘"에는 "거래처 정보는 비공개입니다"로 응대)
- ⚠️ 특정 회사 거래 여부를 다른 사용자에게 확인해주지 말 것 (예: "○○도 너네 고객이야?"에 답하지 않음)

■ DEALER (딜러 — 진공장비 유통/판매처, 35개사)
더베큠, 랩컴퍼니, 리더스베큠, 맑음과학, 모닝사이언, ㈜무진씨에스, 미르테크, ㈜바이오닉스, 베스트랩, VACUUM ALL, ㈜보아테크놀로지, 브릿지오버, 브이티아이, 삼성랩, 새진하이테크, 서울테크, 성우인스트루먼츠, 성진이앤에이, 성호시그마, ㈜소일테크, 솔버그코리아, 신영에스티, 신일테크, ㈜신흥계기, 싸이엔텍, ㈜씨엘케이, 에스케이이화학, 에이스시스템즈, 엠제이솔루션, 이에스아이시, 코리아사이언스, ㈜크로마테크서비스, 퍼블, 프라임텍, 한동산업

■ OEM (장비 제조사 — 진공펌프를 자기 장비에 통합 판매, 15개사)
㈜썸백ENG, ㈜이젠테크, 그린리소스, ㈜와이지엔지니어링, 알파플러스, ㈜오방테크놀로지, 오토클레이브테크, 오페론, 제릭스, 제이와이테크놀로지, 제일이엔지, 하나솔루션, 한국전자기계융합기술원, ㈜나노솔루션테크, 아이엠에스㈜

■ ENDUSER (최종 사용처 — 연구소/대학/제조사 직접 사용, 31개사)
국방과학연구소, 기초과학연구원, 대구수질연구소, 덕산네오룩스, 동국제약㈜, 동광제약, 미코하이테크, 비츠로넥스텍, 비츠로브이엠, 비츠로셀, 서울대학교(박민혁교수연구실), 서울대 물리학과(이규철교수연구실), 서울대 자연과학대(장준호교수연구실), 쎌바이오텍, 에어프로덕츠, 율촌화학, 유니스트(울산과학기술원), 포항가속기연구소(빔라인과학팀), 한국가스공사, 한국고분자시험연구소㈜, 한국과학기술연구원, 한국메티슨특수가스, 한국재료연구원, 한국항공대학교, 한국항공우주연구원(항우연), 한국화학연구원(바이오화학센터), 한양대학교, 한화큐셀, 희성촉매㈜, ㈜시스템알앤디, ㈜씨브이
`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // 주요 제품 파트번호 DB (동적, 캐시 제외)
  const products = await prisma.product.findMany({
    where: { isImportant: true },
    select: { partNo: true, description: true, category: true },
    take: 100,
  });

  const productContext = products
    .map((p: { partNo: string; description: string; category: string | null }) => `[${p.partNo}] ${p.description} (${p.category})`)
    .join("\n");

  const systemPrompt = `당신은 스마텍(Smartech)의 진공펌프 전문 상담 AI입니다.
Edwards Vacuum 한국 공식 대리점으로서 진공펌프, 터보펌프, 게이지, 컨트롤러를 취급합니다.
모든 답변은 한국어로, 친절하고 전문적으로 합니다.

아래 기술 스펙 데이터베이스를 기반으로 정확한 모델 스펙을 안내하세요.
스펙 데이터에 없는 제품은 추측하지 말고 "스마텍 전문가에게 문의하세요"로 안내하세요.
가격은 항상 "견적 문의를 통해 안내 드리겠습니다"로 답하세요.

${SPEC_CONTEXT}

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
