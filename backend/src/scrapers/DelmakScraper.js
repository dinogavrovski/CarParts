const axios = require('axios');
const cheerio = require('cheerio');
const BaseScraper = require('./BaseScraper');

const BASE = 'https://delmak.mk';
const DELAY_MS = 400;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const http = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
    'Accept-Language': 'mk,en;q=0.9',
  },
});

class DelmakScraper extends BaseScraper {
  constructor() {
    super('Delmak', BASE);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  async _get(path) {
    await sleep(DELAY_MS);
    const res = await http.get(path);
    return cheerio.load(res.data);
  }

  /** Parse price text like "495 ден." or "2.591 ден." → float */
  _parsePrice(text) {
    if (!text) return null;
    // Remove currency and spaces, keep digits and dots
    const raw = text.replace('ден.', '').replace(/\s/g, '').replace(/\./g, '').trim();
    const num = parseFloat(raw);
    return isNaN(num) ? null : num;
  }

  // ── Brand list ─────────────────────────────────────────────────────────────

  async _fetchBrands() {
    const $ = await this._get('/');
    const brands = [];
    // Brand logos grid — each brand is an <a> whose href matches /c/{id}/vozila/{slug}
    $('a[href*="/vozila/"]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/^\/c\/\d+\/vozila\/([^/]+)$/);
      if (match) {
        const slug = match[1];
        const name = $(el).text().trim() || slug.replace(/-/g, ' ').toUpperCase();
        brands.push({ name, href });
      }
    });
    // Deduplicate by href
    return [...new Map(brands.map((b) => [b.href, b])).values()];
  }

  // ── Models (one level below brand) ────────────────────────────────────────

  async _fetchModelLinks(brandHref) {
    const $ = await this._get(brandHref);
    const links = [];
    $('a[href*="/vozila/"]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      // Model URLs have exactly 5 path segments: c/{id}/vozila/{brand}/{model}
      const segments = href.split('/').filter(Boolean);
      if (segments.length === 5 && segments[2] === 'vozila') {
        links.push(href);
      }
    });
    return [...new Set(links)];
  }

  // ── Sub-models / year variants ─────────────────────────────────────────────

  async _fetchSubModelLinks(modelHref) {
    const $ = await this._get(modelHref);
    const links = [];
    $('a[href*="/vozila/"]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      const segments = href.split('/').filter(Boolean);
      // Sub-model URLs have 6+ path segments
      if (segments.length >= 6 && segments[2] === 'vozila') {
        links.push(href);
      }
    });
    return [...new Set(links)];
  }

  // ── Product listings on a leaf category page ───────────────────────────────

  async _scrapePage(url) {
    const $ = await this._get(url);
    const products = [];

    $('.pc__info').each((_i, el) => {
      const card = $(el);

      // Title + product link
      const titleLink = card.find('h6.pc__title a').first();
      const title = titleLink.text().trim();
      if (!title) return;

      const rawHref = titleLink.attr('href') || '';
      if (!rawHref) return;
      const productUrl = `${BASE}${rawHref.split('?')[0]}`;

      // Price: prefer .price-sale, fall back to first .money.price
      const salePriceEl = card.find('.price-sale').first();
      const anyPriceEl = card.find('.money.price').last();
      const priceText = (salePriceEl.length ? salePriceEl : anyPriceEl).text().trim();
      const price = this._parsePrice(priceText) || 0;

      // Availability: text node inside p.pc__item_number (after the img)
      const availText = card.find('p.pc__item_number').first().text().trim();
      const availability = availText || 'Непознато';

      // Image: pc__img inside the sibling pc__img-wrapper
      const imgEl = card.parent().find('img.pc__img').first();
      const imageUrl = imgEl.attr('src') || null;

      products.push({ title, price, currency: 'MKD', availability, productUrl, imageUrl });
    });

    return products;
  }

  /** Follow pagination — delmak uses ?page=N */
  async scrapeListings(categoryUrl) {
    const all = [];
    let page = 1;
    while (true) {
      const url = page === 1 ? categoryUrl : `${categoryUrl}?page=${page}`;
      const $ = await this._get(url);

      // Check if there are products on this page
      const productCount = $('h6').length;
      if (productCount === 0) break;

      const products = await this._scrapePage(url);
      all.push(...products);

      // Check for a next-page link
      const hasNext = $('a[href*="?page="], a[href*="&page="]').filter((_i, el) => {
        const n = parseInt($(el).text().trim());
        return n === page + 1;
      }).length > 0;

      if (!hasNext) break;
      page++;
    }
    return all;
  }

  // ── Top-level: collect all (brand, model, url) tuples ─────────────────────

  async scrapeVehicles() {
    const brands = await this._fetchBrands();
    console.log(`  Found ${brands.length} brands`);
    const vehicles = [];

    for (const brand of brands) {
      console.log(`  → ${brand.name}`);
      const modelLinks = await this._fetchModelLinks(brand.href);

      for (const modelHref of modelLinks) {
        const subLinks = await this._fetchSubModelLinks(modelHref);
        const modelSlug = modelHref.split('/').pop();
        const modelName = modelSlug.replace(/-/g, ' ').replace(/^[a-z]+ /, '').toUpperCase();

        if (subLinks.length === 0) {
          // No sub-models — this IS the listing page
          vehicles.push({ brand: brand.name, model: modelName, categoryPageUrl: modelHref });
        } else {
          for (const subHref of subLinks) {
            const subSlug = subHref.split('/').pop();
            const subName = subSlug.replace(/-/g, ' ').toUpperCase();
            vehicles.push({ brand: brand.name, model: `${modelName} - ${subName}`, categoryPageUrl: subHref });
          }
        }
      }
    }

    return vehicles;
  }
}

module.exports = DelmakScraper;
