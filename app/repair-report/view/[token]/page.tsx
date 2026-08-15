import type { Metadata } from "next";
import ViewClient from "./ViewClient";

export const metadata: Metadata = {
  title: "수선보고서 — 스마텍",
  description: "스마텍 고객 전용 수선보고서 열람 페이지입니다.",
  alternates: { canonical: "https://www.smartechvacuum.com/repair-report/view" },
  robots: { index: false, follow: false },
};

export default function RepairReportViewPage() {
  return <ViewClient />;
}
