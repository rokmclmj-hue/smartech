# 전자빔 용접·진공 브레이징 드라이펌프 선택 리서치

> 리서치 기준일: 2026년 7월 18일
> 허용 소스 수: 3개 (Edwards 공식 PDF 2건 + 스마텍 내부 Product_master_table 1건) / 참고 소스 수: 3개 (TWI, souzvac.com 관련 요약 — 수치 미사용, 배경 이해용)

---

## 1. 공정 개요 — 왜 진공이 필요한가

**진공 브레이징(Vacuum Brazing)**: 모재보다 낮은 용융점의 비철 필러 금속을 모재 틈새로 흘려 넣어 접합하는 공정. 진공은 접합부 주변의 가스를 제거해 금속 젖음성(wetting)을 높이고, 고온과 결합해 산화막을 분해하는 역할을 한다. ✅ [Edwards Vacuum Brazing Application Note, Publication 3602 568 0 01]

**전자빔 용접(E-beam Welding, EBW)**: 진공 챔버 안에서 고에너지 전자빔을 모재에 조사해 국부적으로 용융·접합하는 공정. 진공 환경이 필요한 이유는 전자빔이 대기 중 분자와 충돌하면 산란·감쇠되기 때문이다(전자총 자체의 배경압력 유지가 핵심). GXS/EXS 드라이 스크류 펌프 공식 적용 공정 목록(Metallurgy 카테고리)에 "E-beam welding"과 "Vacuum Brazing"이 나란히 명시되어 있다. ✅ [Edwards GXS Dry Screw Vacuum Pumps 브로슈어, Publication 3602 100 6 01 / data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt] ✅ [Edwards EXS Dry Screw Vacuum Pump 브로슈어, Publication 3602 117 101 / data/Product_master_table/7-1.산업용드라이_EXS.txt]

---

## 2. 진공 브레이징 — 요구 진공도와 표준 시스템 구성

- 브레이징 공정은 **10⁻³ mbar까지 배기 후 단계별 승온**하며, 승온 중에는 **10⁻⁴ mbar 이하로 진공을 유지**한다. ✅ [Edwards Vacuum Brazing Application Note]
- 전통적으로는 오일씰 펌프(Stokes Microvac 로터리 피스톤 펌프)와 확산펌프(nHT 시리즈) 조합이 쓰였으나, 최근에는 **드라이 러핑펌프 + 터보분자펌프** 조합이 "제품 청정도가 중요한 경우 특히 선호되는 기술(preferred technology)"로 명시돼 있다. ✅ [Edwards Vacuum Brazing Application Note]
- 공식 문서상 브레이징 챔버의 표준 배기 라인업(Typical layout for vacuum brazing): **브레이징 챔버 → 아이솔레이션 밸브 → (확산펌프 또는 터보펌프) → 기계식 부스터(Mechanical Booster) → 1차 펌프(Primary Pump)** 순서로 연결된다. 드라이 시스템 구성에서는 "GXS 드라이 스크류 펌프 + 부스터 조합" 또는 "고유량 STP 터보분자펌프(컨트롤러 일체형)"가 권장 기술(Recommended technology)로 표기돼 있다. ✅ [Edwards Vacuum Brazing Application Note]

### 드라이 시스템이 브레이징에 주는 이점 (Edwards 공식 명시)
- 브레이징 공정에서 발생하는 입자(particle)에 대한 내성 증가
- 청정한 잔류 진공(clean residual vacuum) 확보
- 오일 역류(oil back streaming) 제거 — 제품·노(furnace) 오염원 차단
- 대용량 수증기 배기 능력 — 신설 챔버 라이닝 건조에 도움
- 배기구 오일 미스트 및 외부 오일 누출 제거
✅ [Edwards Vacuum Brazing Application Note — GXS Dry Screw Pumps 섹션]

---

## 3. 전자빔 용접 — 요구 진공도 (참고용, 수치 미확정)

전자빔 용접 챔버의 구체적인 목표 진공도 범위는 TWI(The Welding Institute) 기술자료에서 다음과 같이 구분해 설명한다(⚠️ 화이트리스트 외 소스이므로 확정 수치로 글에 인용하지 않음, 배경 이해 참고용):
- ⚠️ [twi-global.com FAQ] — 완전 진공(full vacuum) 용접: 10⁻⁴~10⁻⁵ mbar 대, 전자총 자체는 1×10⁻⁵ mbar 이하 요구
- ⚠️ [twi-global.com FAQ] — 부분 진공(partial vacuum): 10⁻²~10⁻³ mbar 대
- ⚠️ [twi-global.com FAQ] — 저진공/감압(reduced pressure) 용접: 10~10⁻¹ mbar 대 (챔버리스 방식에 활용)

**Edwards 공식 자료 기준으로 확인되는 사실**은 "EB welding" 공정에 GXS/EXS 드라이 스크류 펌프가 백킹(러핑) 단계 펌프로 명시적으로 채택된다는 것, 그리고 이 공정에는 **인렛 필터(Inlet Filter) 병행 사용이 권장 액세서리로 지정**돼 있다는 것이다(용접 시 발생하는 금속 스퍼터·분진 대응). ✅ [Edwards GXS 브로슈어 "Customised solutions for your application" 표]

> 즉, 전자빔 용접에서 최종 고진공(전자총 영역)은 터보분자펌프(STP 시리�즈, 최대 4,500 L/s급) 또는 확산펌프가 담당하고, GXS/EXS 드라이 스크류 펌프는 그 앞단의 백킹(러핑) 펌프 역할을 한다. ✅ [Edwards Vacuum Brazing Application Note — STPs Turbomolecular Pumps 섹션(동일 계열 구성 원리)]

---

## 4. GXS/EXS 드라이 스크류 펌프 공식 스펙 (백킹 펌프 후보)

### GXS 시리즈 (Ultimate Pressure는 "without purge" 기준)
- GXS160: Peak Pumping Speed 160 m³/h, Ultimate Pressure 7×10⁻³ mbar ✅ [Edwards GXS 브로슈어 Technical data]
- GXS160/1750(콤비): Peak 1200 m³/h, Ultimate 7×10⁻⁴ mbar ✅ [Edwards GXS 브로슈어]
- GXS250: Peak 250 m³/h, Ultimate 4×10⁻³ mbar ✅ [Edwards GXS 브로슈어]
- GXS250/2600(콤비): Peak 1900 m³/h, Ultimate 5×10⁻⁴ mbar ✅ [Edwards GXS 브로슈어]
- GXS450: Peak 450 m³/h, Ultimate 5×10⁻³ mbar ✅ [Edwards GXS 브로슈어]
- GXS450/2600(콤비): Peak 2200 m³/h ✅ / GXS450/4200(콤비): Peak 3026 m³/h ✅ [Edwards GXS 브로슈어]
- GXS750: Peak 740 m³/h, Ultimate 3×10⁻³ mbar ✅ [Edwards GXS 브로슈어]
- GXS750/2600(콤비): Peak 2300 m³/h ✅ / GXS750/4200(콤비): Peak 3450 m³/h ✅ [Edwards GXS 브로슈어]
- 드라이 단독 모델의 도달진공도 5×10⁻⁴ mbar(마케팅 요약 문구) ✅ [Edwards GXS 브로슈어 "Fast" 항목]

### EXS 시리즈 (VFD 내장, GXS와 동일 스크류 기술 기반)
- EXS160/EXS250: Ultimate vacuum 1×10⁻² mbar(단독), <1×10⁻³ mbar(2600 콤비) / Peak 160~1900 m³/h ✅ [Edwards EXS 브로슈어 Technical Specifications]
- EXS450/EXS750: Peak 450~3450 m³/h, 콤비 조합 시 Ultimate <1×10⁻³ mbar ✅ [Edwards EXS 브로슈어]
- EXS750/8000(최상위 콤비): Peak Pumping Speed 5,980 m³/h ✅ [Edwards EXS 브로슈어]
- EXS 적용 공정 목록(Metallurgy)에도 "Vacuum brazing", "E-beam welding"이 명시돼 있다. ✅ [Edwards EXS 브로슈어 Applications]

### 스마텍 내부 마스터테이블 교차 확인
- GXS160 도달진공도 7.0×10⁻³ mbar, GXS250 4.0×10⁻³ mbar, GXS450 5.0×10⁻³ mbar, GXS750 3.0×10⁻³ mbar — Edwards 공식 브로슈어와 수치 일치. 적용 공정 비고란에 "금속열처리·코팅·동결건조·배터리건조·솔라" 기재. ✅ [data/Product_master_table/7.산업용드라이펌프_GXS Dry.txt]
- EXS 시리즈는 GXS 대비 "VFD(가변주파수드라이브) 내장, 간편제어"가 비고란에 기재돼 있다. ✅ [data/Product_master_table/7-1.산업용드라이_EXS.txt]
- 두 시리즈 모두 윤활유는 PFPE Drynert 25/6(저증기압 특수 오일이지만, 공정부는 오일프리 구조이며 이 오일은 기어박스 윤활용). ✅ [Edwards GXS/EXS 브로슈어 Lubrication 항목]

---

## 5. 금속 분진·스퍼터 대응 — 드라이펌프의 구조적 장점

- GXS는 논캔틸레버(non-cantilever) 양단 지지축 구조로 진동이 낮고, "5리터 물 슬러그 + 1kg 미분말 슬러그 처리 테스트"를 통과했다고 명시돼 있다. 브레이징·용접 공정에서 발생하는 액체·분말 이물질에 대한 내성을 뒷받침하는 근거다. ✅ [Edwards GXS 브로슈어 "GXS innovative screw technology — Double ended shaft support"]
- 비접촉식 장수명 실(seal)에 오일 차단 래버린스 실이 통합돼 있고, 분당 6리터 씰 퍼지(seal purge)로 기어박스를 오염으로부터 보호하면서 진공 공간을 오일 없는 상태로 유지한다. ✅ [Edwards GXS 브로슈어 "Advanced shaft sealing technology"]
- GXS/EXS 모두 "인렛 필터(금속 메시 타입, 5마이크론 폴리에스터 등)"가 표준 권장 액세서리로 제공되며, 특히 EB 용접·베이핑카본 함침(CVI) 등 입자 발생 공정에는 인렛 필터 장착이 권장 사항으로 표로 명시돼 있다. ✅ [Edwards GXS 브로슈어 "Customised solutions for your application" 표 + "Inlet Vacuum Filters" 섹션]

---

## 6. 펌프 다운 시간·챔버 크기 선정 원리 (일반 공식, 특정 수치 아님)

배기 시간은 챔버 체적(V)과 펌프의 배기속도(S), 목표 압력비(P1/P2)에 의해 결정되는 것이 진공 공학의 기본 원리다. 챔버가 크거나 배기 시간을 단축해야 하는 경우, 드라이 스크류 펌프 단독보다 **드라이 스크류 + 루츠 부스터 콤비 조합**을 선택하면 피크 배기속도가 최대 7~8배까지 늘어난다(GXS160 단독 160 m³/h → GXS160/1750 콤비 1200 m³/h 등, 위 4번 항목 수치 참고). ✅ [Edwards GXS 브로슈어 Technical data]

> 특정 챔버 체적에 대한 정확한 펌프다운 시간 계산은 실제 챔버 형상·누설률·초기 압력에 따라 달라지므로 "사양 확인 필요/스마텍 문의"로 안내한다. 임의의 예시 수치는 사용하지 않는다.

---

## 7. 오일펌프 대비 드라이펌프가 선호되는 이유 — 종합

1. **오일 오염 원천 차단**: 오일 역류(back streaming)는 브레이징 제품·노 오염원으로 공식 문서에 명시. 전자빔 용접도 고청정 진공 환경이 요구되는 공정이라 동일한 논리가 적용된다. ✅ [Edwards Vacuum Brazing Application Note]
2. **입자·분진 내성**: 액체·분말 슬러그 처리 테스트로 검증된 구조. ✅ [Edwards GXS 브로슈어]
3. **고온 환경 대응**: 챔버·전자빔 발생기에서 방사되는 열로부터 "적절히 보호된(duly protected from radiated heat)" 상태로 드라이 러핑펌프·터보펌프가 사용된다고 명시(구체적 온도 스펙은 확인 불가 — 확인 불가로 표시). ✅ [Edwards Vacuum Brazing Application Note] / ⚠️ 정확한 배관·펌프 설치 위치별 허용 온도 수치는 화이트리스트 소스에서 확인되지 않아 "확인 불가"로 처리
4. **수증기 처리 용량**: 신규 챔버 라이닝 건조 등 대용량 수증기 배기에 유리. ✅ [Edwards Vacuum Brazing Application Note]
5. **유지보수 비용**: "노 오염 없음(no unplanned down-time)", "서비스 간격 연장" 등 저유지보수 특성이 명시돼 있다. ✅ [Edwards GXS 브로슈어]

---

## 7-1. 인렛 필터 규격 (콤비 조합별)

- 단독 펌프·1750 콤비 조합: 4인치 필터 (Part No. M58808005/M58808137) ✅ [Edwards GXS 브로슈어 "Inlet Vacuum Filters" 표]
- 2600 콤비 조합: 6인치 필터 (M5882805/M58828137) ✅ [Edwards GXS 브로슈어]
- 4200 콤비 조합: 8인치 필터 (M59848005/M59848137) ✅ [Edwards GXS 브로슈어]
- 폴리에스터 엘리먼트: 5마이크론, 99% 이상 효율 / 스테인리스 메시: 300마이크론, 90% 효율 / 헬륨 리크 테스트 1×10⁻⁶ mbar·l/s 기준 ✅ [Edwards GXS 브로슈어]

## 8. 적용 가능 인접 공정 (동일 GXS/EXS 라인업 공식 적용 목록)

Metallurgy 카테고리 안에 Vacuum Brazing, E-beam welding과 함께 다음 공정들이 명시돼 있다 — 특수 용접·금속 열처리 산업군 내 관련 공정을 언급할 때 참고: Nitro carburising(질화침탄), Low pressure nitriding(저압 질화), Low pressure carburising(저압 침탄), Sintering(소결), Metal injection moulding, Precision investment casting(정밀 인베스트먼트 주조), Vacuum arc refining(VAR), Vacuum induction melting(VIM), Steel degassing(강 탈가스). ✅ [Edwards GXS/EXS 브로슈어 Applications]

---

## 9. 현장 사례 (상담기록)

`data/상담기록/` 폴더에서 "용접", "브레이징", "전자빔" 키워드로 검색한 결과 5개 파일에서 언급이 발견됐으나, 모두 **배관 이음 용접(파이프 엘보 제작)이나 리크 수리용 용접** 관련 내용으로 전자빔 용접·진공 브레이징 공정과는 무관했다(예: "용접 타입으로 리크 발생", "엘보는 용접실에 있는지" 등 사내 정비 문맥). 이번 주제와 직접 연결되는 상담기록은 없어 **"상담기록 없음"**으로 처리한다. (파일을 topic-tracker.json의 used_consultation_records에 추가하지 않음 — 실제로 글에 반영하지 않았기 때문)

---

## 참고 소스

- ✅ [Edwards Vacuum Brazing Application Note (Publication 3602 568 0 01)](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/applications/edwards-vacuum-brazing-application-note.pdf) — 수치 인용
- ✅ [Edwards GXS Dry Screw Vacuum Pumps 브로슈어 (Publication 3602 100 6 01)](https://www.edwardsvacuum.com/content/dam/brands/edwards-vacuum/general-vacuum/downloads/dry-screw-pumps/edwards-GXS-dry-pumps-product-brochure.pdf) — 수치 인용 (내부 data/Product_master_table 파일과 동일 원문 확인)
- ✅ [Edwards EXS Dry Screw Vacuum Pump 브로슈어 (Publication 3602 117 101)] — 스마텍 내부 data/Product_master_table/7-1.산업용드라이_EXS.txt 확인, 수치 인용
- ⚠️ [twi-global.com — EB welding vacuum FAQ](https://www.twi-global.com/technical-knowledge/faqs/faq-how-do-i-measure-the-pressure-in-an-electron-beam-eb-welding-vacuum-chamber) — 참고만, 화이트리스트 외 소스라 수치 미사용
- ⚠️ [souzvac.com / altenergymag.com 검색 요약] — 참고만(EBW 공정 개요 이해), 수치 미사용
