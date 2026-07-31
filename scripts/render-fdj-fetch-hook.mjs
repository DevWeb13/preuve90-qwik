import { chromium } from "playwright-core";

const nativeFetch = globalThis.fetch.bind(globalThis);
const FDJ_HOST = "www.pointdevente.parionssport.fdj.fr";

function requestUrl(input) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function isFdjLotoFootUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.hostname === FDJ_HOST &&
      url.pathname.includes("/grilles/loto-foot/")
    );
  } catch {
    return false;
  }
}

async function renderFdjPage(url) {
  const executablePath = process.env.CHROME_PATH;
  if (!executablePath) {
    throw new Error("CHROME_PATH est absent : Chromium ne peut pas être lancé.");
  }

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const context = await browser.newContext({
      locale: "fr-FR",
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36 Preuve90/1.0",
    });
    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(3_000);

    const html = await page.content();
    const inputCount = await page.locator("input").count();
    const selectedCount = await page
      .locator(
        'input:checked, [aria-checked="true"], [data-selected="true"], [data-checked="true"], [data-winner="true"], [data-winning="true"], .selected, .is-selected, .winner, .winning, .correct',
      )
      .count();

    console.log(
      `FDJ_RENDERED url=${url} html_bytes=${Buffer.byteLength(html)} inputs=${inputCount} selected_candidates=${selectedCount}`,
    );

    return html;
  } finally {
    await browser.close();
  }
}

globalThis.fetch = async (input, init) => {
  const url = requestUrl(input);
  if (!isFdjLotoFootUrl(url)) return nativeFetch(input, init);

  const html = await renderFdjPage(url);
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
};
