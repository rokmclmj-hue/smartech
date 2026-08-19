# -*- coding: utf-8 -*-
"""블로그 41편 → 유튜브 숏츠 배치 렌더링 (파일럿 1편 제외, 2번부터 번호 부여)"""
import os
import sys
import traceback
sys.path.insert(0, os.path.dirname(__file__))
from shorts_lib import build_video

BASE = r"C:\Users\rokmc\smartech\블로그\output"
OUT_DIR = r"C:\Users\rokmc\Desktop\스마텍_유튜브숏츠"
os.makedirs(OUT_DIR, exist_ok=True)


def img(folder, name):
    return os.path.join(BASE, folder, "images", name)


def thumb(folder):
    return img(folder, "thumbnail.png")


def opener(folder):
    return dict(image=thumb(folder), caption=None, duration=3.5,
                is_full_bleed=True, zoom_from=1.0, zoom_to=1.05)


def scene(image_path, lines, hl, dur=4.0):
    return dict(image=image_path, caption=lines, highlight=hl, duration=dur)


ITEMS = []

# ---------------- 2026-06 (17편) ----------------
f = "기술블로그/2026-06/ELD500W-리크디텍터-20260601"
ITEMS.append(("ELD500W-리크디텍터", [
    opener(f),
    scene(img(f, "field-1.png"), ["진공도가 안 나오는데", "원인을 못 찾을 때"], ["원인"]),
    scene(img(f, "body-1.png"), ["누설 증상 4가지", "펌핑시간↑ 압력불안정"], ["4가지"]),
    scene(img(f, "body-2.png"), ["헬륨은 공기보다", "2.7배 빠르게 통과"], ["2.7배"]),
    scene(img(f, "body-3.png"), ["기동 2분, 최소검출", "5×10⁻¹² mbar·l/s"], ["5×10⁻¹²"]),
]))

f = "기술블로그/2026-06/RV-오일로터리펌프-유지관리-20260606"
ITEMS.append(("RV오일로터리펌프-유지관리", [
    opener(f),
    scene(img(f, "image-01.png"), ["오일 창으로 색상 확인", "탄화·백탁이면 즉시교환"], ["즉시교환"]),
    scene(img(f, "image-02.png"), ["미스트필터 6개월마다", "취기필터는 매월교환"], ["6개월"]),
]))

f = "기술블로그/2026-06/RV펌프-수리비용-3가지요소-20260627"
ITEMS.append(("RV펌프-수리비용-3가지요소", [
    opener(f),
    scene(img(f, "field-1.png"), ["RV펌프 분해 현장", "마모상태 육안확인"], ["마모상태"]),
    scene(img(f, "image-01.png"), ["수리비 결정 요소 3가지", "베인마모·오염·부품수급"], ["3가지"]),
    scene(img(f, "image-02.png"), ["수리 전 체크리스트", "모델명·증상·오일교환시점"], ["체크리스트"]),
]))

f = "기술블로그/2026-06/가스-발라스트-20260603"
ITEMS.append(("가스발라스트-사용시점", [
    opener(f),
    scene(img(f, "image-01.png"), ["포지션 0·I·II", "공정 단계에 맞게 전환"], ["포지션"]),
    scene(img(f, "image-03.png"), ["1~2 Torr 이하면 닫기", "열어두면 도달진공 못미침"], ["닫기"]),
]))

f = "기술블로그/2026-06/동결건조-드라이펌프-선택기준-20260613"
ITEMS.append(("동결건조-드라이펌프-선택기준", [
    opener(f),
    scene(img(f, "image-01.png"), ["1차건조 대량수증기", "2차건조 0.01~0.1mbar"], ["대량수증기"]),
    scene(img(f, "image-02.png"), ["GV80 클로우 펌프", "오일프리 연속가동 적합"], ["오일프리"]),
    scene(img(f, "field-1.png"), ["E2M80 현장설치", "수분관리가 펌프수명 좌우"], ["수분관리"]),
]))

f = "기술블로그/2026-06/수소-에너지-드라이펌프-20260610"
ITEMS.append(("수소에너지-드라이펌프", [
    opener(f),
    scene(img(f, "image-01.png"), ["전해질 탈기·PVD코팅", "수소건조까지 진공 필요"], ["진공 필요"]),
    scene(img(f, "image-02.png"), ["오일펌프는 착화위험", "드라이스크류가 안전기준"], ["착화위험"]),
    scene(img(f, "image-03.png"), ["GXS 정속 vs EXS 가변속", "공정에 맞게 선택"], ["GXS vs EXS"]),
]))

f = "기술블로그/2026-06/스퍼터-공정-에드워드-드라이진공펌프-20260601"
ITEMS.append(("스퍼터공정-드라이진공펌프", [
    opener(f),
    scene(img(f, "body-1.png"), ["무오일 설계로", "박막 오염 원천차단"], ["무오일"]),
    scene(img(f, "body-2.png"), ["GXS 저소음 70dB이하", "iXM 전력 60%절감"], ["60%절감"]),
    scene(img(f, "body-3.png"), ["Gas Buster로", "분진 축적 방지"], ["Gas Buster"]),
    scene(img(f, "body-4.png"), ["내부식성 4배 향상", "iH 대비 XCEDE 기술"], ["4배"]),
    scene(img(f, "body-5.png"), ["GXS·iXH·iXM", "공정별 시리즈 비교"], ["시리즈 비교"]),
]))

f = "기술블로그/2026-06/실험실-진공펌프-오일-선택법-20260606"
ITEMS.append(("실험실진공펌프-오일선택법", [
    opener(f),
    scene(img(f, "image-01.png"), ["오일 교환주기", "경/중/고부하로 다름"], ["교환주기"]),
    scene(img(f, "image-02.png"), ["RV·E2M 모델별", "권장오일 Ultragrade"], ["Ultragrade"]),
    scene(img(f, "field-3.png"), ["PFPE 오일 사용시", "도달진공 10배 낮아짐"], ["10배"]),
]))

f = "기술블로그/2026-06/연구용-KF-ISO플랜지-선택법-20260625"
ITEMS.append(("연구용-KF-ISO플랜지선택법", [
    opener(f),
    scene(img(f, "image-01.png"), ["KF는 NW50까지", "ISO-K·CF는 그 이상"], ["NW50"]),
    scene(img(f, "field-1.png"), ["DN160 ISO-K 실측", "외경으로 오주문 방지"], ["실측"]),
    scene(img(f, "image-02.png"), ["규격별 선택 흐름도", "크기·진공도로 결정"], ["흐름도"]),
]))

f = "기술블로그/2026-06/연구용-피라니-이온게이지-비교-20260613"
ITEMS.append(("연구용-피라니-이온게이지비교", [
    opener(f),
    scene(img(f, "image-01.png"), ["피라니는 대기압~", "5×10⁻⁴ mbar 구간"], ["5×10⁻⁴"]),
    scene(img(f, "image-02.png"), ["AIM200은 이온게이지로", "10⁻⁹mbar까지 커버"], ["10⁻⁹mbar"]),
]))

f = "기술블로그/2026-06/이차전지-PFPE-오일-선택법-20260606"
ITEMS.append(("이차전지-PFPE오일선택법", [
    opener(f),
    scene(img(f, "image-01.png"), ["전극건조·전해액주입", "단계마다 진공 적용"], ["진공 적용"]),
    scene(img(f, "image-02.png"), ["오일식은 NMP·HF에", "부식·슬러지 위험"], ["부식"]),
    scene(img(f, "field-1.png"), ["GXS 드라이스크류", "이차전지 표준 솔루션"], ["표준 솔루션"]),
]))

f = "기술블로그/2026-06/진공건조-드라이펌프-선택기준-20260613"
ITEMS.append(("진공건조-드라이펌프-선택기준", [
    opener(f),
    scene(img(f, "image-01.png"), ["nXDS 소형오븐용", "오일프리 저소음52dB"], ["오일프리"]),
    scene(img(f, "image-02.png"), ["GXS 대형산업용", "500L이상 챔버 대응"], ["500L이상"]),
]))

f = "기술블로그/2026-06/진공게이지-종류-20260605"
ITEMS.append(("진공게이지-종류선택가이드", [
    opener(f),
    scene(img(f, "image-01.png"), ["직접측정 vs 간접측정", "커패시턴스가 가장정밀"], ["커패시턴스"]),
    scene(img(f, "image-02.png"), ["피라니·이온·WRG200", "압력구간별로 다름"], ["압력구간"]),
    scene(img(f, "image-05.png"), ["용도별 게이지 선택", "라인업 한눈에 비교"], ["용도별"]),
]))

f = "기술블로그/2026-06/진공로-드라이펌프-선택기준-20260623"
ITEMS.append(("진공로-드라이스크류펌프-선택기준", [
    opener(f),
    scene(img(f, "image-01.png"), ["소결·브레이징마다", "요구 진공도가 다름"], ["요구 진공도"]),
    scene(img(f, "image-02.png"), ["GXS 모델별", "배기속도·도달진공 비교"], ["모델별"]),
]))

f = "기술블로그/2026-06/진공펌프-루츠부스터-조합-20260606"
ITEMS.append(("진공펌프-루츠부스터-조합선택", [
    opener(f),
    scene(img(f, "image-01.png"), ["루츠부스터는 단독X", "배후펌프와 조합필수"], ["조합필수"]),
    scene(img(f, "image-02.png"), ["압력구간별 배기속도", "2~8배 끌어올림"], ["2~8배"]),
    scene(img(f, "image-03.png"), ["EH 시리즈 사양", "1200이상은 수냉필수"], ["수냉필수"]),
    scene(img(f, "image-04.png"), ["기동은 배후펌프 먼저", "오일관리는 항상 필수"], ["배후펌프 먼저"]),
]))

f = "기술블로그/2026-06/진공펌프-소음기-머플러-선택기준-20260630"
ITEMS.append(("진공펌프-소음기-머플러-선택기준", [
    opener(f),
    scene(img(f, "field-1.png"), ["소음기 없이 첫가동", "맥동음 작업장 전체로"], ["맥동음"]),
    scene(img(f, "image-01.png"), ["구경·재질·감쇠량", "3가지로 소음기 선택"], ["3가지"]),
]))

f = "기술블로그/2026-06/진공펌프-수리-시-주의사항-20260601"
ITEMS.append(("진공펌프-수리시-주의사항7가지", [
    opener(f),
    scene(img(f, "body-2.jpg"), ["1000micron 이상이면", "내부수리 필요신호"], ["1000micron"]),
    scene(img(f, "body-3.png"), ["고글·장갑·방독마스크", "보호장비 필수착용"], ["필수착용"]),
    scene(img(f, "body-4.jpg"), ["새오일로 3~5회 세척", "구오일 완전제거"], ["3~5회"]),
    scene(img(f, "body-5.jpg"), ["분해 순서대로 배치", "재조립은 역순으로"], ["역순"]),
]))

# ---------------- 2026-07 (14편) ----------------
f = "기술블로그/2026-07/0702-OLED-드라이펌프"
ITEMS.append(("OLED-LCD-드라이펌프전환이유", [
    opener(f),
    scene(img(f, "field-1.png"), ["오일역류 막지 못하면", "OLED 픽셀결함로 번짐"], ["픽셀결함"], dur=6.0),
]))

f = "기술블로그/2026-07/0704-극저온배관-드라이펌프"
ITEMS.append(("액화질소이중배관-드라이펌프선택", [
    opener(f),
    scene(img(f, "image-01.png"), ["드라이펌프 무급유구조", "게터 오염 원천차단"], ["무급유"]),
    scene(img(f, "field-1.png"), ["T-station 터보시스템", "고진공 영역까지 재배기"], ["재배기"]),
    scene(img(f, "image-02.png"), ["배관규모별 3단계", "nXDS·XDS·GXS+EH"], ["3단계"]),
]))

f = "기술블로그/2026-07/0704-동결건조-식품등급오일"
ITEMS.append(("동결건조-식품등급오일선택기준", [
    opener(f),
    scene(img(f, "field-1.png"), ["E2M80 동결건조현장", "미네랄오일이 기본"], ["미네랄오일"]),
    scene(img(f, "image-01.png"), ["원료접촉 위험있으면", "식품등급오일 H1 검토"], ["H1"]),
    scene(img(f, "image-02.png"), ["오일로터리 유지 vs", "드라이 전환 판단기준"], ["판단기준"]),
]))

f = "기술블로그/2026-07/0704-초전도가속기-이온게이지"
ITEMS.append(("초전도자석-냉음극이온게이지", [
    opener(f),
    scene(img(f, "field-1.png"), ["냉음극게이지 내부", "영구자석이 방전 유지"], ["영구자석"]),
    scene(img(f, "image-01.png"), ["누설자장 간섭시", "설치위치별 영향 비교"], ["누설자장"]),
    scene(img(f, "image-02.png"), ["AIM200·WRG200·APG200", "3종 게이지 비교"], ["3종"]),
]))

f = "기술블로그/2026-07/0704-특수가스-드라이스크류"
ITEMS.append(("특수가스충전설비-드라이스크류", [
    opener(f),
    scene(img(f, "field-1.png"), ["고순도·부식성·가연성", "3조건이면 드라이 필수"], ["3조건"], dur=6.0),
]))

f = "기술블로그/2026-07/0710-반도체-드라이펌프"
ITEMS.append(("반도체에칭-CMP-드라이펌프선택", [
    opener(f),
    scene(img(f, "사진1.png"), ["다단구조로 압력구간", "나눠 부식가스 분산"], ["다단구조"]),
    scene(img(f, "사진2.png"), ["부식성가스가 만든", "배기라인 퇴적물"], ["퇴적물"]),
    scene(img(f, "사진3.png"), ["에칭=다단 iXH", "계측=스크롤 nXDS"], ["iXH"]),
    scene(img(f, "사진4.png"), ["가스발라스트로", "부산물 고형화 지연"], ["가스발라스트"]),
    scene(img(f, "사진5.png"), ["반도체라인 iXH", "다단드라이펌프 현장"], ["현장"]),
]))

f = "기술블로그/2026-07/0710-의료용진공펌프"
ITEMS.append(("의료생명공학-드라이전환판단기준", [
    opener(f),
    scene(img(f, "사진1.png"), ["GC 배기라인엔", "오일로터리가 표준"], ["표준"]),
    scene(img(f, "사진2.png"), ["오일역류가 멸균공정", "제품오염으로 직결"], ["제품오염"]),
    scene(img(f, "사진3.png"), ["동결건조 진공범위", "삼중점 아래로 유지"], ["삼중점"]),
    scene(img(f, "사진4.png"), ["스크류드라이펌프", "오일프리 유지보수흐름"], ["오일프리"]),
]))

f = "기술블로그/2026-07/0710-태양전지-드라이펌프"
ITEMS.append(("태양광태양전지-드라이펌프선택", [
    opener(f),
    scene(img(f, "사진1.png"), ["오일펌프는 카본오염", "드라이가 청정진공 우선"], ["청정진공"]),
    scene(img(f, "사진2.png"), ["웨이퍼보다 넓은면적", "배기속도 재계산 필수"], ["재계산"]),
    scene(img(f, "사진3.png"), ["도핑·에칭 분진발생", "스크류방식이 안정적"], ["분진"]),
    scene(img(f, "사진4.png"), ["대면적 챔버는", "루츠부스터 조합 검토"], ["루츠부스터"]),
    scene(img(f, "사진5.png"), ["태양전지 생산라인", "드라이펌프 적용 예시"], ["적용 예시"]),
]))

f = "기술블로그/2026-07/0718-가속기-드라이펌프"
ITEMS.append(("대형과학장비-러프진공-드라이펌프", [
    opener(f),
    scene(img(f, "사진1.png"), ["소형TMP는 nXDS", "대형은 XDS35i 매칭"], ["XDS35i"]),
    scene(img(f, "사진2.png"), ["빔라인용 소형펌프 vs", "챔버용 산업용펌프"], ["산업용펌프"]),
    scene(img(f, "사진3.png"), ["가속기·핵융합 시설", "500대 이상 공급사례"], ["500대 이상"]),
]))

f = "기술블로그/2026-07/0718-수냉공랭-드라이펌프"
ITEMS.append(("산업용드라이펌프-냉각방식판단기준", [
    opener(f),
    scene(img(f, "사진1.png"), ["GXS·EXS는", "전모델 수냉 전용"], ["수냉 전용"]),
    scene(img(f, "사진2.png"), ["냉각수 없다면", "배관공사 or 칠러설치"], ["칠러설치"]),
    scene(img(f, "사진3.png"), ["정지시 냉각수도", "함께 차단해야 결로방지"], ["결로방지"]),
]))

f = "기술블로그/2026-07/0718-용접브레이징-드라이펌프"
ITEMS.append(("전자빔용접-진공브레이징-드라이펌프", [
    opener(f),
    scene(img(f, "사진1.png"), ["브레이징로 배기라인", "표준 구성 순서"], ["배기라인"]),
    scene(img(f, "사진2.png"), ["10⁻³mbar 배기 후", "단계별 승온 진행"], ["단계별 승온"]),
    scene(img(f, "사진3.png"), ["GXS 단독 vs", "루츠부스터 콤비 비교"], ["콤비"]),
    scene(img(f, "사진4.png"), ["인렛필터로", "금속분진 서비스주기 연장"], ["서비스주기"]),
]))

f = "기술블로그/2026-07/0727-진공도-단위"
ITEMS.append(("Torr-mbar-Pa-압력단위환산", [
    opener(f),
    scene(img(f, "사진1.png"), ["1 Torr는 1.3333 mbar", "단위부터 맞춰야 비교가능"], ["1.3333"]),
    scene(img(f, "사진2.png"), ["저진공부터 극초고진공", "구간별로 나뉩니다"], ["구간별"]),
    scene(img(f, "사진3.png"), ["구간마다 사용펌프", "완전히 달라집니다"], ["완전히"]),
    scene(img(f, "사진4.png"), ["제조사마다 mbar·Torr·Pa", "표기단위가 다릅니다"], ["표기단위"]),
]))

f = "기술블로그/2026-07/0729-배기속도-컨덕턴스"
ITEMS.append(("배기속도와컨덕턴스-진공시스템설계", [
    opener(f),
    scene(img(f, "사진1.png"), ["카탈로그 배기속도와", "실제 성능은 다릅니다"], ["다릅니다"]),
    scene(img(f, "사진2.png"), ["직경 2배면", "컨덕턴스 8배 증가"], ["8배"]),
    scene(img(f, "사진3.png"), ["배관 굴곡·밸브마다", "컨덕턴스 손실 누적"], ["손실 누적"]),
]))

f = "기술블로그/2026-07/0731-백스트리밍"
ITEMS.append(("진공펌프-백스트리밍-원리와방지법", [
    opener(f),
    scene(img(f, "사진1.png"), ["오일씰 로터리베인", "펌프 내부 구조"], ["내부 구조"]),
    scene(img(f, "사진2.png"), ["RV는 역류많고", "nXDS는 구조적으로 없음"], ["구조적으로 없음"]),
    scene(img(f, "사진3.png"), ["포어라인트랩으로", "오일미스트 역류 차단"], ["역류 차단"]),
    scene(img(f, "사진4.png"), ["드라이펌프 전환시", "벨로우즈·흡기라인 점검"], ["전환"]),
]))

# ---------------- 2026-08 (9편, 0803 파일럿 제외) ----------------
f = "기술블로그/2026-08/0805-수소오일로터리"
ITEMS.append(("수소라인-오일로터리펌프-안전수칙", [
    opener(f),
    scene(img(f, "사진1.png"), ["수소라인에서", "가스발라스트 열면 위험"], ["위험"], dur=5.0),
    scene(img(f, "사진2.png"), ["방폭모터·수분트랩", "체크리스트 필수확인"], ["필수확인"], dur=5.0),
]))

f = "기술블로그/2026-08/0805-의료바이오게이지"
ITEMS.append(("의료바이오-위생기준-게이지선택", [
    opener(f),
    scene(img(f, "사진1.png"), ["APG200 M vs", "내식성 LC·MP 재질비교"], ["재질비교"]),
    scene(img(f, "사진3.png"), ["APG200 참고이미지", "세정 사이클 잦은공정용"], ["세정 사이클"]),
    scene(img(f, "사진2.png"), ["게이지 선택기준", "구간별로 한눈에 정리"], ["선택기준"]),
]))

f = "기술블로그/2026-08/0807-미스트필터선택"
ITEMS.append(("오일로터리펌프-미스트필터선택기준", [
    opener(f),
    scene(img(f, "사진1.png"), ["RV 오일로터리펌프", "현장점검 모습"], ["현장점검"]),
    scene(img(f, "사진2.png"), ["EMF3·10·20 5단계", "펌프용량별 매칭 필수"], ["매칭 필수"]),
    scene(img(f, "사진3.png"), ["필터 오염되면", "오일색·냄새로 확인"], ["오일색"]),
]))

f = "기술블로그/2026-08/0810-항공우주-드라이펌프"
ITEMS.append(("항공우주-환경시험챔버-드라이펌프요건", [
    opener(f),
    scene(img(f, "사진1.png"), ["GXS 드라이스크류", "우주시뮬레이션 챔버용"], ["우주시뮬레이션"]),
    scene(img(f, "사진2.png"), ["대형 GXS vs", "소형 nXDS 배기속도차"], ["배기속도차"]),
    scene(img(f, "사진3.png"), ["챔버크기부터 소음까지", "선정 체크리스트"], ["체크리스트"]),
]))

f = "기술블로그/2026-08/0812-극저온배관-벨로우즈플랜지"
ITEMS.append(("극저온배관-벨로우즈플랜지선택기준", [
    opener(f),
    scene(img(f, "사진3.png"), ["탄성체 실 하한은 -10도", "액화질소는 -196도"], ["-196도"]),
    scene(img(f, "사진2.png"), ["KF·ISO·CF", "진공도·온도로 구분"], ["KF·ISO·CF"]),
    scene(img(f, "사진1.png"), ["벨로우즈 길이부족은", "펌프 들림 현상까지"], ["들림 현상"]),
]))

f = "기술블로그/2026-08/0814-재가동전점검사항"
ITEMS.append(("진공펌프-재가동전-점검사항5가지", [
    opener(f),
    scene(img(f, "사진1.png"), ["일주일 이상 세워뒀다면", "재가동 전 점검 필수"], ["점검 필수"]),
    scene(img(f, "사진2.png"), ["찬 상태로 재가동하면", "콘덴세이트가 방해"], ["콘덴세이트"]),
    scene(img(f, "사진4.png"), ["무부하 워밍업 중", "이상소음 미리 확인"], ["이상소음"]),
    scene(img(f, "사진5.png"), ["정지·재가동 잦다면", "질소충진 보관 권장"], ["질소충진"]),
]))

f = "기술블로그/2026-08/0817-보온병-열전달"
ITEMS.append(("열전달3가지로이해하는-진공단열원리", [
    opener(f),
    scene(img(f, "사진1.png"), ["전도·대류는 매질필요", "진공이 두 가지 다 차단"], ["두 가지"]),
    scene(img(f, "사진2.png"), ["복사는 진공도 못막아", "반사코팅으로 막습니다"], ["반사코팅"]),
    scene(img(f, "사진3.png"), ["보온병과 산업진공", "정밀도 차이만 다를뿐"], ["정밀도"]),
]))

f = "기술블로그/2026-08/0819-코팅-드라이펌프"
ITEMS.append(("스마트폰코팅공정-드라이펌프선택법", [
    opener(f),
    scene(img(f, "사진1.png"), ["드라이스크류 펌프", "내부구조 다이어그램"], ["내부구조"]),
    scene(img(f, "사진2.png"), ["GXS vs EXS", "자동제어냐 가변속이냐"], ["GXS vs EXS"]),
    scene(img(f, "사진3.png"), ["씰퍼지 구조로", "기어박스 오일 완전차단"], ["완전차단"]),
    scene(img(f, "사진4.png"), ["코팅공정 규모에 맞는", "선택 체크리스트"], ["체크리스트"]),
]))

f = "기술블로그/2026-08/0821-냄새-고장진단"
ITEMS.append(("진공펌프-냄새로-이상진단하는법", [
    opener(f),
    scene(img(f, "사진1.png"), ["탄내가 나면", "즉시 전원차단이 먼저"], ["즉시 전원차단"]),
    scene(img(f, "사진2.png"), ["오일 타는 냄새는", "열화·냉각불량 신호"], ["열화"]),
    scene(img(f, "사진3.png"), ["냄새별 점검", "체크리스트 한눈에"], ["체크리스트"]),
]))

# ---------------- 납품사례 (1편) ----------------
f2 = "납품사례/2026-06/20260622-H사-TStation85D"
ITEMS.append(("촉매연구소-TStation85D-납품사례", [
    scene(os.path.join(BASE, f2, "images", "field-2.jpg"),
          ["촉매 연구 분석장비에", "T-Station 85D 납품"], ["T-Station 85D"], dur=4.5),
    scene(os.path.join(BASE, f2, "images", "field-1.jpg"),
          ["오일없는 XDD1", "다이어프램 백킹펌프"], ["오일없는"], dur=4.5),
]))

START_NUM = 2

if __name__ == "__main__":
    # ---------------- 실행 ----------------
    results = []
    for i, (name, scenes) in enumerate(ITEMS):
        num = START_NUM + i
        out_path = os.path.join(OUT_DIR, f"{num}.{name}.mp4")
        print(f"[{num}/{START_NUM + len(ITEMS) - 1}] {name} 렌더링 시작...")
        try:
            build_video(scenes, out_path)
            n_scenes = len(scenes)
            total_dur = sum(s["duration"] for s in scenes) + 4.0
            results.append((num, name, "성공", n_scenes, f"{total_dur:.1f}s"))
            print(f"  완료: {out_path}")
        except Exception as e:
            results.append((num, name, f"실패: {e}", 0, "-"))
            print(f"  실패: {e}")
            traceback.print_exc()

    print("\n=== 최종 결과 ===")
    for r in results:
        print(r)
