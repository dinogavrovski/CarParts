const axios = require('axios');
const cheerio = require('cheerio');
const BaseScraper = require('./BaseScraper');

const BASE = 'https://delovi.mk';
const DELAY_MS = 300;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const http = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
    'Accept-Language': 'mk,en;q=0.9',
  },
});

class DeloviScraper extends BaseScraper {
  constructor() {
    super('Delovi', BASE);
  }

  async _get(path) {
    await sleep(DELAY_MS);
    const res = await http.get(path);
    return cheerio.load(res.data);
  }

  _parsePrice(text) {
    if (!text) return null;
    // Remove currency ("ден"), dots used as thousand separators, spaces
    const raw = text.replace(/ден\.?/gi, '').replace(/\./g, '').replace(/\s/g, '').trim();
    const num = parseFloat(raw);
    return isNaN(num) ? null : num;
  }

  async _fetchBrands() {
    const $ = await this._get('/');
    const brands = [];
    // Brand grid links: /product-category/{brand}/
    $('a[href*="/product-category/"]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/\/product-category\/([^/]+)\/?$/);
      if (match) {
        const slug = match[1];
        const name = $(el).text().trim() || slug.replace(/-/g, ' ').toUpperCase();
        if (name) brands.push({ name: name.toUpperCase(), href });
      }
    });
    return [...new Map(brands.map((b) => [b.href, b])).values()];
  }

  async _fetchModelLinks(brandHref) {
    const $ = await this._get(brandHref);
    const links = [];
    // Model links: /product-category/{brand}/{model}/
    $('a[href*="/product-category/"]').each((_i, el) => {
      const href = $(el).attr('href') || '';
      const segments = href.replace(BASE, '').split('/').filter(Boolean);
      // exactly ["product-category", brand, model]
      if (segments.length === 3 && segments[0] === 'product-category') {
        links.push(href);
      }
    });
    return [...new Set(links)];
  }

  _scrapeProducts($) {
    const products = [];

    $('h2.product_title').each((_i, el) => {
      const titleLink = $(el).find('a');
      const title = titleLink.text().trim();
      if (!title) return;

      const productUrl = titleLink.attr('href') || '';
      if (!productUrl) return;

      // Outer card: up to e-con.e-child (title panel), then parent (full card)
      const outerCard = $(el).closest('.e-con.e-child').parent();

      // Price: prefer sale (ins), fall back to any price
      const salePriceText = outerCard.find('.price ins .woocommerce-Price-amount bdi').first().text().trim();
      const anyPriceText = outerCard.find('.price .woocommerce-Price-amount bdi').last().text().trim();
      const price = this._parsePrice(salePriceText || anyPriceText) || 0;

      // Image: woodmart theme stores real URL in data-wood-src
      const imgEl = outerCard.parent().find('img.wd-lazy-load').first();
      const imageUrl = imgEl.attr('data-wood-src') || null;

      products.push({
        title,
        price,
        currency: 'MKD',
        availability: 'Во залиха',
        productUrl,
        imageUrl,
      });
    });

    return products;
  }

  async scrapeListings(categoryUrl) {
    const all = [];
    let page = 1;

    while (true) {
      const url = page === 1 ? categoryUrl : `${categoryUrl}page/${page}/`;
      const $ = await this._get(url);

      const products = this._scrapeProducts($);
      all.push(...products);

      const hasNext = $('a.next.page-numbers').length > 0;
      if (!hasNext) break;
      page++;
    }

    return all;
  }

  async scrapeVehicles() {
    const brands = await this._fetchBrands();
    console.log(`  Found ${brands.length} brands`);
    const vehicles = [];

    for (const brand of brands) {
      console.log(`  → ${brand.name}`);
      const modelLinks = await this._fetchModelLinks(brand.href);

      for (const modelHref of modelLinks) {
        const modelSlug = modelHref.split('/').filter(Boolean).pop();
        const modelName = modelSlug.replace(/-/g, ' ').toUpperCase();
        vehicles.push({ brand: brand.name, model: modelName, categoryPageUrl: modelHref });
      }
    }

    return vehicles;
  }
}

module.exports = DeloviScraper;
