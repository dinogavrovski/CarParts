const { PrismaClient } = require('@prisma/client');
const DelmakScraper = require('./DelmakScraper');

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
  return prisma.listing.upsert({
    where: { productUrl: data.productUrl },
    update: {
      title: data.title,
      price: data.price,
      availability: data.availability,
    },
    create: data,
  });
}

async function run() {
  console.log('Starting Delmak scrape...\n');

  const store = await upsertStore('Delmak', 'https://delmak.mk');
  const scraper = new DelmakScraper();

  console.log('Fetching vehicles...');
  const vehicles = await scraper.scrapeVehicles();
  console.log(`\nFound ${vehicles.length} vehicle/category pages\n`);

  let totalListings = 0;

  for (const vehicle of vehicles) {
    console.log(`Scraping: ${vehicle.brand} ${vehicle.model}`);
    try {
      const listings = await scraper.scrapeListings(vehicle.categoryPageUrl);
      if (listings.length === 0) continue;

      const dbVehicle = await upsertVehicle(vehicle.brand, vehicle.model);

      for (const listing of listings) {
        const categoryName = inferCategory(listing.title);
        const dbCategory = await upsertCategory(categoryName);

        await upsertListing({
          title: listing.title,
          price: listing.price,
          currency: listing.currency,
          availability: listing.availability,
          productUrl: listing.productUrl,
          storeId: store.id,
          vehicleId: dbVehicle.id,
          categoryId: dbCategory.id,
        });
        totalListings++;
      }

      console.log(`  ✓ ${listings.length} listings`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  console.log(`\nDone. Total listings upserted: ${totalListings}`);
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
