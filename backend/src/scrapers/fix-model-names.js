const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function cleanModel(brand, model) {
  let cleaned = model;

  // Strip long Macedonian suffix: " - DELOVI ZA ..."
  const deloviIdx = cleaned.indexOf(' - DELOVI ZA');
  if (deloviIdx !== -1) cleaned = cleaned.slice(0, deloviIdx).trim();

  // Strip leading brand prefix if duplicated: "DS DS7" → "DS7"
  const prefix = brand.toUpperCase() + ' ';
  if (cleaned.toUpperCase().startsWith(prefix)) {
    cleaned = cleaned.slice(prefix.length).trim();
  }

  return cleaned;
}

async function main() {
  const vehicles = await prisma.vehicle.findMany();
  let fixed = 0, skipped = 0;

  for (const v of vehicles) {
    const cleaned = cleanModel(v.brand, v.model);
    if (cleaned === v.model) continue;

    // Check if a vehicle with the cleaned name already exists
    const existing = await prisma.vehicle.findUnique({
      where: { brand_model: { brand: v.brand, model: cleaned } },
    });

    if (existing) {
      // Merge: move all listings from v to existing, then delete v
      await prisma.listing.updateMany({
        where: { vehicleId: v.id },
        data: { vehicleId: existing.id },
      });
      await prisma.vehicle.delete({ where: { id: v.id } });
      console.log(`Merged: "${v.brand}" | "${v.model}" → existing "${cleaned}"`);
      skipped++;
    } else {
      await prisma.vehicle.update({
        where: { id: v.id },
        data: { model: cleaned },
      });
      console.log(`Fixed:  "${v.brand}" | "${v.model}" → "${cleaned}"`);
      fixed++;
    }
  }

  console.log(`\nDone. Fixed: ${fixed}, Merged: ${skipped}`);
  await prisma.$disconnect();
}

main().catch(console.error);
