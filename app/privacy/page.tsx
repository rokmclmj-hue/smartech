import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 스마텍",
  description: "주식회사 스마텍(smartechvacuum.com) 개인정보처리방침. 수집 항목, 이용 목적, 보유 기간, 이용자 권리 안내.",
  alternates: { canonical: "https://www.smartechvacuum.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 text-ink">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">개인정보처리방침</h1>
      <p className="text-dim text-sm mb-10">시행일: 2026년 8월 20일</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold text-base mb-2">1. 총칙</h2>
          <p>
            주식회사 스마텍(이하 &quot;회사&quot;)은 「개인정보 보호법」 등 관련 법령을 준수하며,
            이용자의 개인정보를 안전하게 처리하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">2. 수집하는 개인정보 항목 및 수집 방법</h2>
          <p className="mb-2">회사는 아래와 같은 서비스 이용 과정에서 개인정보를 수집합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원가입(사업자 로그인): 사업자등록번호, 담당자명, 연락처, 이메일</li>
            <li>견적·발주 요청: 회사명, 담당자명, 연락처, 이메일, 배송지 주소</li>
            <li>수리 접수: 회사명, 담당자명, 연락처, 이메일, 장비 사진</li>
            <li>AI 상담 챗봇 이용: 상담 대화 내용, 연락처(상담 과정에서 이용자가 직접 입력 시)</li>
            <li>서비스 이용 과정에서 자동 생성되는 정보: 접속 로그, 쿠키, 접속 IP</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">3. 개인정보의 수집 및 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 식별 및 사업자 등급별(딜러/OEM 등) 서비스 제공</li>
            <li>견적서·발주서·거래명세표 발급 및 계약 이행</li>
            <li>수리 접수 처리, 수리 진행 상황 안내</li>
            <li>고객 문의·AI 상담 응대 및 서비스 개선</li>
            <li>공지사항 전달, 분쟁 해결을 위한 기록 보존</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">4. 개인정보의 보유 및 이용 기간</h2>
          <p>
            회사는 원칙적으로 개인정보 수집·이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
            다만 관계 법령에 따라 보존할 필요가 있는 경우 아래와 같이 보관합니다.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
            <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
            <li>세금계산서 등 거래 관련 증빙: 5년 (국세기본법)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">5. 개인정보의 제3자 제공</h2>
          <p>
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 배송을 위해 필요한 최소한의 정보를
            배송업체에 제공하거나, 이용자가 사전에 동의한 경우, 법령의 규정에 의한 경우에 한하여 제공할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">6. 개인정보처리 위탁</h2>
          <p>회사는 서비스 운영을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Vercel Inc. — 웹 호스팅 및 데이터 저장(Vercel Blob)</li>
            <li>솔라피(Solapi) — 문자(SMS) 발송</li>
            <li>Google LLC — 로그인 인증(OAuth), 방문 통계 분석(GA4)</li>
            <li>카카오 — 로그인 인증(OAuth)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">7. 이용자의 권리와 행사 방법</h2>
          <p>
            이용자는 언제든지 자신의 개인정보를 열람·정정·삭제·처리정지 요청할 수 있으며,
            아래 연락처로 문의하시면 지체 없이 조치합니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">8. 개인정보 보호책임자</h2>
          <p>성명: 이명재 (대표)</p>
          <p>연락처: 031-204-7170 / info@smartechvacuum.com</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">9. 고지의 의무</h2>
          <p>
            본 개인정보처리방침은 법령·정책 또는 보안 기술의 변경에 따라 내용이 변경될 수 있으며,
            변경 시 본 페이지를 통해 공지합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
