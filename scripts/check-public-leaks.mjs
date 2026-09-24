// 공개(비로그인) 응답에 원가·내부정보가 섞여 나가는지 검사한다 — 2026-09-24 원가 노출 사고 재발 방지용.
//
// 사용법:
//   node scripts/check-public-leaks.mjs                         라이브 사이트를 로그인 없이 열어 금지 항목 검사
//   node scripts/check-public-leaks.mjs --base http://localhost:3100   로컬 개발 서버 검사
//   node scripts/check-public-leaks.mjs --static                push 전 검사(.git/hooks/pre-push가 실행)
//   node scripts/check-public-leaks.mjs --approve --base http://localhost:3100
//        → 로컬 서버 검사를 통과하면, 지금의 "위험 공개 파일"들을 검토 완료로 등록
//
// --static 규칙: 로그인 없이 부를 수 있는 app/api/**/route.ts 중 원가·개인정보 모델을 읽거나
// 민감 항목 이름을 쓰는 파일은, 내용이 바뀌면 --approve(로컬 서버 실검사 통과) 전까지 push를 막는다.
import { execSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const REVIEWED_FILE = path.join(ROOT, "scripts", "public-api-reviewed.json");
const DEFAULT_BASE = "https://www.smartechvacuum.com";

// 공개 응답에 절대 나오면 안 되는 항목 이름
const FORBIDDEN_KEYS = [
  "costPrice", "basePrice", "tier2Price", "tier3Price", "supplierName",
  "passwordHash", "adminNote", "selectedExtrasJson",
];

// 로그인 없이 여는 주소 — 새 공개 API·페이지를 만들면 여기에 추가한다
const PUBLIC_URLS = [
  "/api/products?limit=2000",
  "/api/products?diverse=true&limit=50",
  "/api/products?ids=296",
  "/api/products?partNos=A73501983",
  "/api/products/lookup?partNo=A73501983",
  "/api/products/counts",
  "/api/repair/kits",
  "/",
  "/products",
  "/products/A73501983",
  "/repair",
  "/quote",
  "/blog",
];

// --static에서 "위험 공개 파일"로 보는 기준
const RISKY_PATTERN = new RegExp(
  [
    ...FORBIDDEN_KEYS,
    String.raw`prisma\.(product|user|repairKit|repairKitExtra|repairRequest|priceRule|quote|order)\.find`,
  ].join("|")
);

const args = process.argv.slice(2);
const baseIdx = args.indexOf("--base");
const BASE = (baseIdx !== -1 ? args[baseIdx + 1] : DEFAULT_BASE).replace(/\/$/, "");

function sha(file) {
  const text = fs.readFileSync(path.join(ROOT, file), "utf-8").replace(/\r\n/g, "\n");
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function riskyPublicRoutes() {
  const files = execSync("git ls-files app/api", { cwd: ROOT, encoding: "utf-8" })
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f.endsWith("route.ts") && !f.startsWith("app/api/admin/"));
  return files.filter((f) => fs.existsSync(path.join(ROOT, f)) && RISKY_PATTERN.test(fs.readFileSync(path.join(ROOT, f), "utf-8")));
}

async function liveCheck() {
  console.log(`[leak-check] 로그인 없이 검사: ${BASE}`);
  let failed = 0;
  for (const url of PUBLIC_URLS) {
    let body;
    let status;
    try {
      const res = await fetch(BASE + url, { redirect: "follow", headers: { "cache-control": "no-cache" } });
      status = res.status;
      body = await res.text();
    } catch (e) {
      console.log(`  [오류] ${url} — 열 수 없음 (${e instanceof Error ? e.message : e})`);
      failed++;
      continue;
    }
    const found = FORBIDDEN_KEYS.filter((k) => new RegExp(`\\b${k}\\b`).test(body));
    if (found.length > 0) {
      console.log(`  [노출] ${url} (${status}) — ${found.join(", ")}`);
      failed++;
    } else if (status >= 500) {
      console.log(`  [오류] ${url} — 서버 오류 ${status}`);
      failed++;
    } else {
      console.log(`  [통과] ${url} (${status})`);
    }
  }
  return failed === 0;
}

function staticCheck() {
  const reviewed = fs.existsSync(REVIEWED_FILE) ? JSON.parse(fs.readFileSync(REVIEWED_FILE, "utf-8")) : {};
  const problems = [];
  for (const f of riskyPublicRoutes()) {
    const h = sha(f);
    if (!reviewed[f]) problems.push(`  [미검토] ${f} — 원가·개인정보를 다루는 새 공개 기능`);
    else if (reviewed[f] !== h) problems.push(`  [변경됨] ${f} — 원가·개인정보를 다루는 공개 기능이 바뀜`);
  }
  if (problems.length === 0) {
    console.log("[leak-check] 공개 기능 사전 검사 통과");
    return true;
  }
  console.log("[leak-check] ⛔ push 중단 — 원가·개인정보가 밖으로 나갈 수 있는 파일이 검사 없이 바뀌었습니다.");
  console.log(problems.join("\n"));
  console.log("\n  해결 순서:");
  console.log("  1) 응답에 원가·관리자 메모 등이 빠졌는지 코드 확인 (통째 전달 ...row 금지, 필요한 항목만 골라 보내기)");
  console.log("  2) 로컬 서버 실행: npx next dev -p 3100");
  console.log("  3) node scripts/check-public-leaks.mjs --approve --base http://localhost:3100");
  console.log("  4) 바뀐 scripts/public-api-reviewed.json을 함께 커밋한 뒤 다시 push");
  return false;
}

async function approve() {
  if (baseIdx === -1) {
    console.log("[leak-check] --approve에는 --base http://localhost:포트 가 필요합니다 (바뀐 코드를 실제로 검사해야 함).");
    return false;
  }
  if (!(await liveCheck())) {
    console.log("[leak-check] 실검사 실패 — 검토 완료로 등록하지 않았습니다.");
    return false;
  }
  const reviewed = {};
  for (const f of riskyPublicRoutes()) reviewed[f] = sha(f);
  fs.writeFileSync(REVIEWED_FILE, JSON.stringify(reviewed, null, 2) + "\n", "utf-8");
  console.log(`[leak-check] 검토 완료 등록: ${Object.keys(reviewed).length}개 파일 → scripts/public-api-reviewed.json`);
  return true;
}

const ok = args.includes("--static") ? staticCheck() : args.includes("--approve") ? await approve() : await liveCheck();
process.exit(ok ? 0 : 1);
