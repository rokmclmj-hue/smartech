import type { Metadata } from "next";
import SubmitClient from "./SubmitClient";

export const metadata: Metadata = {
  title: "외주 수선보고서 작성 — 스마텍",
  description: "스마텍 외주업체 전용 수선보고서 작성 페이지입니다.",
  alternates: { canonical: "https://www.smartechvacuum.com/repair-report/submit" },
  robots: { index: false, follow: false },
};

export default function RepairReportSubmitPage() {
  return <SubmitClient />;
}
