import { chromium, type Page } from 'playwright';
import type { ScrapedCompany } from '../types/company.js';

const DEFAULT_LIMIT = Number(process.env.SCRAPE_LIMIT ?? 20);

export async function scrapeGoogleMaps(searchTerm: string, limit = DEFAULT_LIMIT): Promise<ScrapedCompany[]> {
  const browser = await chromium.launch({
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false'
  });

  const context = await browser.newContext({
    locale: 'pt-BR',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await acceptConsentIfPresent(page);
    await page.waitForTimeout(2500);

    const resultLinks = await collectResultLinks(page, limit);
    const companies: ScrapedCompany[] = [];

    if (resultLinks.length === 0) {
      const details = await extractDetails(page);
      return details.name ? [details] : [];
    }

    for (const link of resultLinks.slice(0, limit)) {
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(1200);
      const details = await extractDetails(page);

      if (details.name && !companies.some((company) => company.name === details.name && company.address === details.address)) {
        companies.push(details);
      }
    }

    return companies;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function acceptConsentIfPresent(page: Page): Promise<void> {
  const buttons = [
    'button:has-text("Aceitar tudo")',
    'button:has-text("Aceito")',
    'button:has-text("Accept all")',
    'button:has-text("I agree")'
  ];

  for (const selector of buttons) {
    const button = page.locator(selector).first();
    if (await button.isVisible().catch(() => false)) {
      await button.click();
      await page.waitForTimeout(1000);
      return;
    }
  }
}

async function collectResultLinks(page: Page, limit: number): Promise<string[]> {
  const feed = page.locator('div[role="feed"]').first();

  if (await feed.isVisible().catch(() => false)) {
    for (let index = 0; index < Math.ceil(limit / 4); index += 1) {
      await feed.evaluate((element) => {
        element.scrollBy(0, element.scrollHeight);
      });
      await page.waitForTimeout(900);
    }
  }

  const hrefs = await page.locator('a[href*="/maps/place/"]').evaluateAll((links) =>
    links
      .map((link) => (link as { href?: string }).href ?? '')
      .filter((href, index, array) => href && array.indexOf(href) === index)
  );

  return hrefs.slice(0, limit);
}

async function extractDetails(page: Page): Promise<ScrapedCompany> {
  const name = await textContent(page, 'h1');
  const category = await textContent(page, 'button[jsaction*="category"]');
  const ratingText = await textContent(page, 'div[role="img"][aria-label*="estrelas"], span[aria-label*="estrelas"]');
  const reviewsText = await textContent(page, 'button[aria-label*="avaliações"], button[aria-label*="reviews"]');
  const website = await hrefContent(page, 'a[data-item-id="authority"], a[aria-label*="Website"], a[aria-label*="site"]');
  const address = await ariaOrText(page, 'button[data-item-id="address"], button[aria-label*="Endereço"], button[aria-label*="Address"]');
  const phone = await ariaOrText(page, 'button[data-item-id^="phone"], button[aria-label*="Telefone"], button[aria-label*="Phone"]');

  return {
    name: cleanLabel(name) ?? '',
    phone: cleanPhone(phone),
    address: cleanAddress(address),
    website: website ? stripGoogleRedirect(website) : null,
    category: cleanLabel(category),
    rating: parseRating(ratingText),
    reviewCount: parseReviewCount(reviewsText)
  };
}

async function textContent(page: Page, selector: string): Promise<string | null> {
  const locator = page.locator(selector).first();
  if (!(await locator.isVisible().catch(() => false))) {
    return null;
  }

  return locator.textContent({ timeout: 3000 });
}

async function hrefContent(page: Page, selector: string): Promise<string | null> {
  const locator = page.locator(selector).first();
  if (!(await locator.isVisible().catch(() => false))) {
    return null;
  }

  return locator.getAttribute('href', { timeout: 3000 });
}

async function ariaOrText(page: Page, selector: string): Promise<string | null> {
  const locator = page.locator(selector).first();
  if (!(await locator.isVisible().catch(() => false))) {
    return null;
  }

  const aria = await locator.getAttribute('aria-label').catch(() => null);
  return aria ?? locator.textContent({ timeout: 3000 });
}

function cleanLabel(value: string | null): string | null {
  const cleaned = value?.replace(/\s+/g, ' ').trim();
  return cleaned || null;
}

function cleanAddress(value: string | null): string | null {
  return cleanLabel(value?.replace(/^Endereço:\s*/i, '').replace(/^Address:\s*/i, '') ?? null);
}

function cleanPhone(value: string | null): string | null {
  return cleanLabel(value?.replace(/^Telefone:\s*/i, '').replace(/^Phone:\s*/i, '') ?? null);
}

function parseRating(value: string | null): number | null {
  const match = value?.match(/(\d+[,.]?\d*)/);
  return match ? Number(match[1].replace(',', '.')) : null;
}

function parseReviewCount(value: string | null): number | null {
  const match = value?.match(/[\d.,]+/);
  return match ? Number(match[0].replace(/\D/g, '')) : null;
}

function stripGoogleRedirect(value: string): string {
  try {
    const url = new URL(value);
    return url.searchParams.get('q') ?? value;
  } catch {
    return value;
  }
}
