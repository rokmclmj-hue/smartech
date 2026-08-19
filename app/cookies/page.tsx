import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "쿠키정책 — 스마텍",
  description: "주식회사 스마텍(smartechvacuum.com) 쿠키 사용 정책.",
  alternates: { canonical: "https://www.smartechvacuum.com/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 text-ink">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">쿠키정책</h1>
      <p className="text-dim text-sm mb-10">시행일: 2026년 8월 20일</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold text-base mb-2">1. 쿠키란 무엇인가요?</h2>
          <p>
            쿠키(Cookie)는 웹사이트를 방문할 때 이용자의 브라우저에 저장되는 작은 텍스트 파일로,
            로그인 상태 유지, 서비스 이용 편의 제공, 방문 통계 분석 등에 사용됩니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">2. 스마텍이 사용하는 쿠키</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">필수 쿠키</span> — 로그인 세션 유지(NextAuth 인증), 견적 카트 정보 저장.
              이 쿠키가 없으면 로그인·견적 담기 등 핵심 기능을 이용할 수 없습니다.
            </li>
            <li>
              <span className="font-medium">분석 쿠키</span> — Google Analytics(GA4)를 통한 방문 통계 분석.
              어떤 페이지가 많이 조회되는지 파악해 서비스를 개선하는 목적으로만 사용합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">3. 쿠키 거부 방법</h2>
          <p>
            이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다.
            다만 필수 쿠키를 거부할 경우 로그인, 견적 카트 등 일부 서비스 이용이 제한될 수 있습니다.
          </p>
          <p className="mt-2">
            브라우저별 쿠키 설정 방법은 각 브라우저의 [설정] → [개인정보 및 보안] → [쿠키 및 사이트 데이터] 메뉴에서 확인할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">4. 문의</h2>
          <p>쿠키 사용에 대해 궁금한 점은 info@smartechvacuum.com 또는 031-204-7170으로 문의해 주세요.</p>
        </section>
      </div>
    </div>
  );
}
