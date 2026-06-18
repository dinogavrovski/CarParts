const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

function tokenize(str) {
  return str.toLowerCase().replace(/[^a-zа-ш0-9]/gi, ' ').split(/\s+/).filter(w => w.length >= 2);
}

// Returns fraction of queryTokens that appear in candidate — ignores extra words in candidate
function modelRecall(query, candidate) {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return 0;
  const cSet = new Set(tokenize(candidate));
  return qTokens.filter(t => cSet.has(t)).length / qTokens.length;
}

// GET /api/search?brand=FORD&model=FOCUS+04+08&category=Bumpers&sort=price_asc
router.get('/', async (req, res) => {
  const { brand, model, category, sort } = req.query;

  if (!brand || !model) {
    return res.status(400).json({ error: 'brand and model are required' });
  }

  try {
    // Find all vehicles for this brand, then fuzzy-match on model name
    const allVehicles = await prisma.vehicle.findMany({ where: { brand } });
    const matchedIds = allVehicles
      .filter(v => modelRecall(model, v.model) >= 0.8)
      .map(v => v.id);

    if (matchedIds.length === 0) {
      return res.json([]);
    }

    const listings = await prisma.listing.findMany({
      where: {
        vehicleId: { in: matchedIds },
        ...(category ? { category: { name: category } } : {}),
      },
      include: {
        store: { select: { name: true, logoUrl: true } },
        vehicle: { select: { brand: true, model: true } },
        category: { select: { name: true } },
      },
      orderBy: sort === 'price_desc' ? { price: 'desc' } : { price: 'asc' },
    });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
