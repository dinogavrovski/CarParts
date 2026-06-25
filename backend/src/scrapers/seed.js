const { PrismaClient } = require('@prisma/client');
const DelmakScraper = require('./DelmakScraper');
const DeloviScraper = require('./DeloviScraper');

const prisma = new PrismaClient();

// Keyword → category name mapping (case-insensitive, checks product title)
const CATEGORY_KEYWORDS = [
  { keywords: ['сопирачки', 'сопирач', 'brake', 'накнади', 'чашки'], name: 'Brake Pads' },
  { keywords: ['фар', 'headlight', 'светло', 'рефлектор'], name: 'Headlights' },
  { keywords: ['огледал', 'mirror', 'ретровизор'], name: 'Mirrors' },
  { keywords: ['браник', 'bumper', 'бампер'], name: 'Bumpers' },
  { keywords: ['филтер', 'filter'], name: 'Filters' },
  { keywords: ['амортизер', 'shock', 'пружина', 'spring'], name: 'Suspension' },
  { keywords: ['каиш', 'belt', 'ремен'], name: 'Belts' },
  { keywords: ['врата', 'door', 'брава'], name: 'Doors & Locks' },
  { keywords: ['стакло', 'glass', 'шофершајбна', 'windscreen'], name: 'Glass' },
  { keywords: ['радијатор', 'radiator', 'ладник', 'cooler'], name: 'Cooling' },
  { keywords: ['грејач', 'греалка', 'heater'], name: 'Heating' },
];

function inferCategory(title) {
  const lower = title.toLowerCase();
  for (const { keywords, name } of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return name;
  }
  return 'Other';
}

async function upsertStore(name, website) {
  return prisma.store.upsert({
    where: { name },
    update: {},
    create: { name, website },
  });
}

async function upsertVehicle(brand, model) {
  return prisma.vehicle.upsert({
    where: { brand_model: { brand, model } },
    update: {},
    create: { brand, model },
  });
}

async function upsertCategory(name) {
  return prisma.partCategory.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function upsertListing(data) {
  const listing = await prisma.listing.upsert({
    where: { productUrl: data.productUrl },
    update: {
      title: data.title,
      price: data.price,
      availability: data.availability,
      imageUrl: data.imageUrl,
    },
    create: data,
  });
  // Record price snapshot for history tracking
  await prisma.priceHistory.create({
    data: { listingId: listing.id, price: data.price },
  });
  return listing;
}

async function processVehicle(scraper, store, vehicle, counter) {
  try {
    const listings = await scraper.scrapeListings(vehicle.categoryPageUrl);
    if (listings.length === 0) return 0;

    const dbVehicle = await upsertVehicle(vehicle.brand, vehicle.model);
    let count = 0;

    for (const listing of listings) {
      const categoryName = inferCategory(listing.title);
      const dbCategory = await upsertCategory(categoryName);
      await upsertListing({
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        availability: listing.availability,
        productUrl: listing.productUrl,
        imageUrl: listing.imageUrl || null,
        storeId: store.id,
        vehicleId: dbVehicle.id,
        categoryId: dbCategory.id,
      });
      count++;
    }

    console.log(`  ✓ [${counter.done}/${counter.total}] ${vehicle.brand} ${vehicle.model} — ${listings.length} listings`);
    return count;
  } catch (err) {
    console.error(`  ✗ ${vehicle.brand} ${vehicle.model}: ${err.message}`);
    return 0;
  }
}

async function runScraper(scraper, storeName, storeWebsite, concurrency = 5) {
  console.log(`\nStarting ${storeName} scrape...\n`);

  const store = await upsertStore(storeName, storeWebsite);

  console.log('Fetching vehicles...');
  const vehicles = await scraper.scrapeVehicles();
  console.log(`\nFound ${vehicles.length} vehicle/category pages — scraping with concurrency ${concurrency}\n`);

  let totalListings = 0;
  const counter = { done: 0, total: vehicles.length };

  // Process vehicles in parallel batches
  for (let i = 0; i < vehicles.length; i += concurrency) {
    const batch = vehicles.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(v => {
        counter.done++;
        return processVehicle(scraper, store, v, counter);
      })
    );
    totalListings += results.reduce((a, b) => a + b, 0);
  }

  console.log(`\n${storeName} done. Total listings upserted: ${totalListings}`);
  return totalListings;
}

async function run() {
  // Which scrapers to run — pass scraper name as CLI arg, e.g. "node seed.js delmak" or "node seed.js delovi"
  // Default: run both
  const target = process.argv[2]?.toLowerCase();

  if (!target || target === 'delmak') {
    await runScraper(new DelmakScraper(), 'Delmak', 'https://delmak.mk');
  }

  if (!target || target === 'delovi') {
    await runScraper(new DeloviScraper(), 'Delovi', 'https://delovi.mk');
  }

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
