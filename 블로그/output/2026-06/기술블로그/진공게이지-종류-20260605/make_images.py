# -*- coding: utf-8 -*-
"""
진공게이지 종류 블로그 이미지 생성 스크립트
thumbnail + image-01 ~ image-04 (5개)
"""

import asyncio
from playwright.async_api import async_playwright
import os

OUT = r"C:\Users\rokmc\smartech\블로그\output\진공게이지 종류\images"
os.makedirs(OUT, exist_ok=True)

# ──────────────────────────────────────────────────────────────
# HTML 정의
# ──────────────────────────────────────────────────────────────

THUMBNAIL_HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{
  width:1080px;height:1080px;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%);
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  font-family:'맑은 고딕','Malgun Gothic','Apple SD Gothic Neo',sans-serif;
  position:relative;overflow:hidden;
}
/* 배경 장식 원 */
.bg-circle{
  position:absolute;border-radius:50%;
  background:rgba(255,255,255,0.03);
}
.c1{width:600px;height:600px;top:-150px;right:-150px;}
.c2{width:400px;height:400px;bottom:-100px;left:-80px;}
.c3{width:200px;height:200px;top:200px;left:100px;}

/* 상단 카테고리 */
.category{
  color:#7ec8e3;font-size:28px;letter-spacing:4px;
  text-transform:uppercase;margin-bottom:40px;
  border:1px solid rgba(126,200,227,0.4);
  padding:8px 28px;border-radius:30px;
}
/* 메인 제목 */
.title{
  color:#ffffff;font-size:72px;font-weight:700;
  text-align:center;line-height:1.25;
  margin-bottom:30px;
  text-shadow:0 4px 20px rgba(0,0,0,0.5);
  max-width:860px;
}
/* 부제 */
.subtitle{
  color:#a0aec0;font-size:34px;
  text-align:center;margin-bottom:60px;
  max-width:780px;line-height:1.5;
}
/* 게이지 태그 배지들 */
.badges{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;margin-bottom:50px;}
.badge{
  background:rgba(126,200,227,0.15);
  border:1px solid rgba(126,200,227,0.35);
  color:#7ec8e3;font-size:24px;
  padding:10px 24px;border-radius:8px;
}
/* 하단 브랜드 */
.brand{
  position:absolute;bottom:48px;right:60px;
  color:rgba(160,174,192,0.6);font-size:22px;letter-spacing:2px;
}
</style></head><body>
<div class="bg-circle c1"></div>
<div class="bg-circle c2"></div>
<div class="bg-circle c3"></div>

<div class="category">진공 측정 기술</div>
<div class="title">진공게이지 종류<br>완전 정리</div>
<div class="subtitle">피라니 · 이온 · 컨벡션 · 커패시턴스<br>뭐가 다를까?</div>
<div class="badges">
  <span class="badge">피라니</span>
  <span class="badge">컨벡션</span>
  <span class="badge">이온</span>
  <span class="badge">커패시턴스</span>
</div>
<div class="brand">SMARTECH VACUUM</div>
</body></html>"""

# image-01: 게이지 4종 비교표
IMAGE01_HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{
  width:1080px;height:720px;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:'맑은 고딕','Malgun Gothic',sans-serif;
  padding:40px;
}
.title{color:#7ec8e3;font-size:34px;font-weight:700;margin-bottom:32px;letter-spacing:1px;}
table{width:100%;border-collapse:collapse;font-size:22px;}
thead tr{background:rgba(126,200,227,0.2);}
thead th{
  color:#7ec8e3;padding:16px 18px;text-align:center;
  border-bottom:2px solid rgba(126,200,227,0.4);font-weight:700;
}
tbody tr{border-bottom:1px solid rgba(255,255,255,0.08);}
tbody tr:nth-child(even){background:rgba(255,255,255,0.03);}
tbody td{color:#e2e8f0;padding:14px 18px;text-align:center;line-height:1.4;}
tbody td:first-child{color:#ffffff;font-weight:600;text-align:left;}
.highlight{color:#fbbf24;font-weight:700;}
</style></head><body>
<div class="title">진공게이지 4종 핵심 비교</div>
<table>
  <thead>
    <tr>
      <th>게이지 종류</th>
      <th>측정 범위</th>
      <th>정확도</th>
      <th>주요 용도</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>피라니</td>
      <td>10⁻⁴ ~ 1000 mbar</td>
      <td>±15%</td>
      <td>러프-다운 모니터링</td>
    </tr>
    <tr>
      <td>컨벡션</td>
      <td>대기압 ~ 10⁻⁴ mbar</td>
      <td>±15%</td>
      <td>대기압~고진공 단일 커버</td>
    </tr>
    <tr>
      <td>냉음극 이온</td>
      <td class="highlight">10⁻⁹ ~ 10⁻² mbar</td>
      <td>±20%</td>
      <td>반도체 고진공 챔버</td>
    </tr>
    <tr>
      <td>열음극 이온</td>
      <td class="highlight">10⁻¹ ~ 10⁻¹² mbar</td>
      <td>±20%</td>
      <td>초고진공·표면 분석</td>
    </tr>
    <tr>
      <td>커패시턴스</td>
      <td>좁은 구간 (고정밀)</td>
      <td class="highlight">0.1~0.5%</td>
      <td>반도체 공정 압력 제어</td>
    </tr>
  </tbody>
</table>
</body></html>"""

# image-02: 진공 압력 영역 도식 (단계별 다이어그램)
IMAGE02_HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{
  width:1080px;height:620px;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:'맑은 고딕','Malgun Gothic',sans-serif;
  padding:40px;
}
.title{color:#7ec8e3;font-size:32px;font-weight:700;margin-bottom:40px;}
.scale-bar{
  width:900px;height:70px;
  background:linear-gradient(to right,#4ade80,#22d3ee,#818cf8,#a855f7);
  border-radius:12px;margin-bottom:20px;position:relative;
}
.labels-top{
  width:900px;display:flex;
  justify-content:space-between;margin-bottom:8px;
}
.labels-top span{color:#a0aec0;font-size:18px;}
.labels-bottom{width:900px;display:flex;margin-top:18px;}
.region{
  flex:1;text-align:center;padding:0 4px;
}
.region-name{color:#ffffff;font-size:22px;font-weight:700;margin-bottom:6px;}
.region-range{color:#a0aec0;font-size:17px;margin-bottom:4px;}
.region-use{color:#7ec8e3;font-size:16px;}
.divider{width:1px;background:rgba(255,255,255,0.15);align-self:stretch;}
.regions{width:900px;display:flex;border:1px solid rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;margin-top:4px;}
.region-box{
  flex:1;padding:18px 10px;text-align:center;
  border-right:1px solid rgba(255,255,255,0.1);
}
.region-box:last-child{border-right:none;}
.region-box:nth-child(1){background:rgba(74,222,128,0.1);}
.region-box:nth-child(2){background:rgba(34,211,238,0.1);}
.region-box:nth-child(3){background:rgba(129,140,248,0.1);}
.region-box:nth-child(4){background:rgba(168,85,247,0.1);}
</style></head><body>
<div class="title">진공 압력 영역 구분</div>
<div class="labels-top">
  <span>← 대기압 (1000 mbar)</span>
  <span>초고진공 (10⁻¹² mbar) →</span>
</div>
<div class="scale-bar"></div>
<div class="regions">
  <div class="region-box">
    <div class="region-name" style="color:#4ade80">저진공</div>
    <div class="region-range">대기압 ~ 1 mbar</div>
    <div class="region-use">식품 포장·HVAC</div>
  </div>
  <div class="region-box">
    <div class="region-name" style="color:#22d3ee">중진공</div>
    <div class="region-range">1 ~ 10⁻³ mbar</div>
    <div class="region-use">실험실·제약</div>
  </div>
  <div class="region-box">
    <div class="region-name" style="color:#818cf8">고진공</div>
    <div class="region-range">10⁻³ ~ 10⁻⁷ mbar</div>
    <div class="region-use">반도체·코팅</div>
  </div>
  <div class="region-box">
    <div class="region-name" style="color:#a855f7">초고진공</div>
    <div class="region-range">10⁻⁷ ~ 10⁻¹² mbar</div>
    <div class="region-use">우주 시뮬레이션·가속기</div>
  </div>
</div>
</body></html>"""

# image-03: 피라니 vs 컨벡션 측정 범위 비교
IMAGE03_HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{
  width:1080px;height:640px;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:'맑은 고딕','Malgun Gothic',sans-serif;
  padding:48px;gap:0;
}
.title{color:#7ec8e3;font-size:32px;font-weight:700;margin-bottom:36px;}
.compare{width:900px;display:flex;flex-direction:column;gap:24px;}
.row{display:flex;align-items:center;gap:20px;}
.label{
  width:160px;color:#ffffff;font-size:22px;
  font-weight:700;text-align:right;flex-shrink:0;
}
.bar-wrap{flex:1;position:relative;height:54px;}
.axis{
  position:absolute;bottom:-22px;left:0;right:0;
  display:flex;justify-content:space-between;
  color:rgba(160,174,192,0.6);font-size:14px;
}

/* 피라니 bar: 10% ~ 60% of 전체 압력 범위 */
.bar-pirani{
  position:absolute;
  left:30%;width:55%;height:54px;
  background:linear-gradient(90deg,#22d3ee,#0ea5e9);
  border-radius:8px;display:flex;align-items:center;
  padding:0 16px;
}
/* 컨벡션 bar: 0% ~ 60% */
.bar-convec{
  position:absolute;
  left:0%;width:62%;height:54px;
  background:linear-gradient(90deg,#f59e0b,#f97316);
  border-radius:8px;display:flex;align-items:center;
  padding:0 16px;
}
.bar-text{color:#fff;font-size:19px;font-weight:700;white-space:nowrap;}
.range-note{
  width:160px;color:#a0aec0;font-size:17px;
  flex-shrink:0;text-align:left;padding-left:8px;
}
.note-box{
  margin-top:42px;width:900px;
  background:rgba(126,200,227,0.08);
  border:1px solid rgba(126,200,227,0.25);
  border-radius:10px;padding:18px 28px;
  color:#a0aec0;font-size:20px;line-height:1.6;
}
.note-box strong{color:#7ec8e3;}
</style></head><body>
<div class="title">피라니 vs 컨벡션 — 측정 범위 비교</div>
<div class="compare">
  <div class="row">
    <div class="label">피라니</div>
    <div class="bar-wrap">
      <div class="bar-pirani">
        <span class="bar-text">10⁻⁴ ~ 1000 mbar</span>
      </div>
    </div>
    <div class="range-note">중진공 전문</div>
  </div>
  <div class="row">
    <div class="label">컨벡션</div>
    <div class="bar-wrap">
      <div class="bar-convec">
        <span class="bar-text">대기압 ~ 10⁻⁴ mbar</span>
      </div>
    </div>
    <div class="range-note">대기압 포함</div>
  </div>
</div>
<div class="note-box">
  <strong>핵심 차이:</strong> 컨벡션은 대류 열 손실을 추가 활용해 <strong>대기압 상태부터 바로 측정</strong>이 가능합니다. 별도 대기압 게이지가 불필요해 설치 비용을 줄일 수 있습니다.
</div>
</body></html>"""

# image-04: 커패시턴스 마노미터 원리 (핵심 포인트 카드)
IMAGE04_HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{
  width:1080px;height:720px;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:'맑은 고딕','Malgun Gothic',sans-serif;
  padding:44px;gap:0;
}
.title{color:#7ec8e3;font-size:32px;font-weight:700;margin-bottom:10px;}
.subtitle{color:#a0aec0;font-size:20px;margin-bottom:36px;}
.cards{
  display:grid;grid-template-columns:1fr 1fr;
  gap:20px;width:920px;
}
.card{
  background:rgba(255,255,255,0.05);
  border:1px solid rgba(126,200,227,0.2);
  border-radius:14px;padding:26px 28px;
}
.card-icon{font-size:36px;margin-bottom:12px;}
.card-title{color:#ffffff;font-size:22px;font-weight:700;margin-bottom:8px;}
.card-body{color:#a0aec0;font-size:19px;line-height:1.5;}
.card-body strong{color:#fbbf24;}
.principle{
  width:920px;margin-top:20px;
  background:rgba(126,200,227,0.07);
  border:1px solid rgba(126,200,227,0.25);
  border-radius:12px;padding:20px 28px;
  color:#e2e8f0;font-size:20px;line-height:1.6;text-align:center;
}
.principle strong{color:#7ec8e3;}
</style></head><body>
<div class="title">커패시턴스 마노미터</div>
<div class="subtitle">다이어프램(얇은 금속 막) 변형으로 압력을 직접 측정</div>
<div class="cards">
  <div class="card">
    <div class="card-icon">🎯</div>
    <div class="card-title">절대 압력 측정</div>
    <div class="card-body">기체 종류와 <strong>무관</strong>하게 압력을 직접 측정. 공정 가스가 바뀌어도 교정 필요 없음.</div>
  </div>
  <div class="card">
    <div class="card-icon">📐</div>
    <div class="card-title">정확도 0.1~0.5%</div>
    <div class="card-body">피라니(±15%)보다 <strong>30~150배</strong> 정확. 다른 게이지의 교정 기준으로 사용.</div>
  </div>
  <div class="card">
    <div class="card-icon">💎</div>
    <div class="card-title">반도체 공정 최적</div>
    <div class="card-body">CVD·ALD·에칭 공정의 <strong>정밀 압력 제어</strong>에 필수. 부식성 가스 환경용 제품도 있음.</div>
  </div>
  <div class="card">
    <div class="card-icon">⚠️</div>
    <div class="card-title">단일 범위 제한</div>
    <div class="card-body">측정 범위가 좁아 구간별로 <strong>별도 게이지</strong> 필요. 피라니·이온보다 가격이 높음.</div>
  </div>
</div>
<div class="principle">
  <strong>작동 원리:</strong> 압력 → 다이어프램(막) 휨 → 전극 간 정전용량 변화 → 전기 신호 → 압력 수치 출력
</div>
</body></html>"""

# image-05: 게이지 선택 가이드 (핵심 포인트 카드)
IMAGE05_HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{
  width:1080px;height:720px;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:'맑은 고딕','Malgun Gothic',sans-serif;
  padding:44px;
}
.title{color:#7ec8e3;font-size:32px;font-weight:700;margin-bottom:8px;}
.subtitle{color:#a0aec0;font-size:20px;margin-bottom:30px;}
table{width:940px;border-collapse:collapse;font-size:21px;}
thead tr{background:rgba(126,200,227,0.18);}
thead th{
  color:#7ec8e3;padding:15px 20px;text-align:left;
  border-bottom:2px solid rgba(126,200,227,0.35);
}
tbody tr{border-bottom:1px solid rgba(255,255,255,0.07);}
tbody tr:nth-child(odd){background:rgba(255,255,255,0.02);}
tbody td{color:#e2e8f0;padding:13px 20px;line-height:1.4;}
tbody td:first-child{color:#a0aec0;}
tbody td:last-child{color:#fbbf24;font-weight:600;}
.footer{
  margin-top:26px;width:940px;
  background:rgba(126,200,227,0.07);
  border:1px solid rgba(126,200,227,0.2);
  border-radius:10px;padding:16px 24px;
  color:#a0aec0;font-size:18px;line-height:1.6;
}
.footer strong{color:#7ec8e3;}
</style></head><body>
<div class="title">Edwards 진공게이지 라인업</div>
<div class="subtitle">APG200 · AIM200 · WRG200 — 상황별 선택 기준</div>
<table>
  <thead>
    <tr><th>상황</th><th>권장 게이지</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>진공펌프 상태 점검, 러프-다운</td>
      <td>피라니 APG200</td>
    </tr>
    <tr>
      <td>대기압부터 고진공 입구까지 단일 커버</td>
      <td>WRG200 (피라니+이온 복합)</td>
    </tr>
    <tr>
      <td>반도체 고진공 챔버, 분석 장비 근처</td>
      <td>냉음극 이온 AIM200</td>
    </tr>
    <tr>
      <td>초고진공, 표면 분석</td>
      <td>열음극 이온 (Bayard-Alpert)</td>
    </tr>
    <tr>
      <td>반도체 공정 압력 정밀 제어</td>
      <td>커패시턴스 마노미터</td>
    </tr>
  </tbody>
</table>
<div class="footer">
  <strong>선택 기준 5가지:</strong>
  ① 필요한 압력 범위 &nbsp;② 공정 기체 종류(부식성 여부) &nbsp;③ 요구 정확도 &nbsp;④ 분석 장비 근접 여부 &nbsp;⑤ 유지보수 비용
</div>
</body></html>"""


async def take_screenshot(html: str, path: str, width: int, height: int):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": width, "height": height})
        await page.set_content(html, wait_until="networkidle")
        await page.screenshot(path=path, full_page=False)
        await browser.close()
    print(f"  저장됨: {path}")


async def main():
    tasks = [
        (THUMBNAIL_HTML,  os.path.join(OUT, "thumbnail.png"),  1080, 1080),
        (IMAGE01_HTML,    os.path.join(OUT, "image-01.png"),   1080,  720),
        (IMAGE02_HTML,    os.path.join(OUT, "image-02.png"),   1080,  620),
        (IMAGE03_HTML,    os.path.join(OUT, "image-03.png"),   1080,  640),
        (IMAGE04_HTML,    os.path.join(OUT, "image-04.png"),   1080,  720),
        (IMAGE05_HTML,    os.path.join(OUT, "image-05.png"),   1080,  720),
    ]
    print("이미지 생성 시작...")
    for html, path, w, h in tasks:
        await take_screenshot(html, path, w, h)
    print("완료!")


if __name__ == "__main__":
    asyncio.run(main())
