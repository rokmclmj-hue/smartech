import Link from "next/link";

export default function Footer() {
  return (
    <footer className="print:hidden border-t border-line bg-ink text-paper/70 mt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 text-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="font-semibold text-paper mb-2">주식회사 스마텍</p>
            <p>대표자 이명재 · 사업자등록번호 270-88-00854</p>
            <p>통신판매업신고 2023-충남천안-2681</p>
            <p>충청남도 천안시 서북구 두정공원2길 49 (두정동)</p>
            <p>고객센터 031-204-7170 · info@smartechvacuum.com</p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <div className="flex gap-4 flex-wrap md:justify-end">
              <Link href="/privacy" className="hover:text-paper underline underline-offset-4">
                개인정보처리방침
              </Link>
              <Link href="/terms" className="hover:text-paper underline underline-offset-4">
                이용약관
              </Link>
              <Link href="/cookies" className="hover:text-paper underline underline-offset-4">
                쿠키정책
              </Link>
            </div>
            <p className="text-paper/40">© {new Date().getFullYear()} Smartech Co., Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
