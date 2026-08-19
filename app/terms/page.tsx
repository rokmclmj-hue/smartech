import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — 스마텍",
  description: "주식회사 스마텍(smartechvacuum.com) 서비스 이용약관.",
  alternates: { canonical: "https://www.smartechvacuum.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16 text-ink">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">이용약관</h1>
      <p className="text-dim text-sm mb-10">시행일: 2026년 8월 20일</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold text-base mb-2">제1조 (목적)</h2>
          <p>
            이 약관은 주식회사 스마텍(이하 &quot;회사&quot;)이 운영하는 인터넷 사이트 smartechvacuum.com(이하 &quot;사이트&quot;)에서
            제공하는 진공펌프 등 제품 판매·견적·수리 접수 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 회사와 이용자의
            권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">제2조 (회사 정보)</h2>
          <p>상호: 주식회사 스마텍</p>
          <p>대표자: 이명재</p>
          <p>사업자등록번호: 270-88-00854</p>
          <p>통신판매업신고: 2023-충남천안-2681</p>
          <p>사업장 소재지: 충청남도 천안시 서북구 두정공원2길 49 (두정동)</p>
          <p>연락처: 031-204-7170 / info@smartechvacuum.com</p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">제3조 (약관의 효력 및 변경)</h2>
          <p>
            이 약관은 사이트에 게시함으로써 효력이 발생하며, 회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있습니다.
            개정 시 적용일자 및 개정 사유를 명시하여 최소 7일 전부터 사이트에 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">제4조 (서비스의 제공 및 변경)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Edwards Vacuum 정품 진공펌프·부품 판매 및 온라인 견적</li>
            <li>진공펌프 수리·오버홀 접수 및 진행 안내</li>
            <li>제품 선정 시뮬레이션, AI 상담 챗봇</li>
            <li>사업자 등급(딜러/OEM 등)별 차등 가격 제공</li>
          </ul>
          <p className="mt-2">
            회사는 제품 수급 상황 등 합리적인 사유가 있는 경우 제공하는 서비스 내용을 변경할 수 있으며, 이 경우 사이트를 통해 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">제5조 (회원가입)</h2>
          <p>
            서비스 중 일부(사업자 등급별 가격 확인 등)는 사업자등록번호 인증을 통한 회원가입 후 이용할 수 있습니다.
            회사는 국세청 사업자등록 상태 조회를 통해 가입 신청의 승인 여부를 결정할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">제6조 (계약 및 청약철회)</h2>
          <p>
            견적 요청·발주는 계약의 청약에 해당하며, 회사의 승낙(발주 확인)으로 계약이 성립합니다.
            청약철회 등은 「전자상거래 등에서의 소비자보호에 관한 법률」이 정하는 바에 따릅니다. 다만 이용자의 요청에 따라
            개별 제작·주문된 제품은 청약철회가 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">제7조 (회사의 의무)</h2>
          <p>
            회사는 관련 법령과 이 약관이 금지하는 행위를 하지 않으며, 지속적·안정적으로 서비스를 제공하기 위해 노력합니다.
            이용자의 개인정보 보호를 위해 별도의 개인정보처리방침을 수립·시행합니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">제8조 (이용자의 의무)</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>신청 또는 변경 시 허위 내용의 등록</li>
            <li>회사가 게시한 정보의 무단 변경</li>
            <li>회사 및 제3자의 저작권 등 지적재산권 침해</li>
            <li>회사 및 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">제9조 (면책조항)</h2>
          <p>
            회사는 천재지변, 제조사의 공급 중단 등 회사가 통제할 수 없는 사유로 인한 서비스 제공 중단에 대해 책임을 지지 않습니다.
            제품의 하자·보증은 제조사(Edwards Vacuum) 및 회사가 제공하는 별도 수리·보증 조건에 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-2">제10조 (분쟁 해결)</h2>
          <p>
            이 약관과 관련한 분쟁은 대한민국 법령을 준거법으로 하며, 회사의 본점 소재지를 관할하는 법원을 관할 법원으로 합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
