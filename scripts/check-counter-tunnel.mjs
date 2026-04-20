import { chromium } from "playwright";

const targets = [
  { label: "localhost", url: "http://localhost:3000/", out: "scripts/counter-local.png" },
  {
    label: "tunnel",
    url: "https://periods-firewall-open-gathered.trycloudflare.com/",
    out: "scripts/counter-tunnel.png",
  },
];

const browser = await chromium.launch();

for (const t of targets) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const logs = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => logs.push(`[PAGEERROR] ${err.message}`));

  console.log("\n==== " + t.label + " · " + t.url + " ====");

  try {
    await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  } catch (e) {
    console.log("GOTO ERROR:", e.message);
    await context.close();
    continue;
  }

  // Initial SSR HTML check
  const initialHtmlCounter = await page
    .evaluate(() => {
      const spans = Array.from(document.querySelectorAll(".tabular"));
      return spans.slice(0, 6).map((s) => s.textContent);
    })
    .catch(() => []);
  console.log("INITIAL:", JSON.stringify(initialHtmlCounter));

  const snaps = [];
  for (let i = 0; i < 16; i++) {
    const v = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll(".tabular"));
      return spans.slice(0, 6).map((s) => (s.textContent || "").trim());
    });
    snaps.push(`t=${(i * 500).toString().padStart(5, " ")}ms: ${JSON.stringify(v)}`);
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: t.out, fullPage: false }).catch(() => {});

  console.log("OBSERVATIONS:");
  snaps.forEach((l) => console.log("  " + l));
  console.log("CONSOLE:");
  logs.slice(0, 25).forEach((l) => console.log("  " + l));

  await context.close();
}

await browser.close();
