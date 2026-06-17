const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/search?brand=FORD&model=FOCUS+98-04&category=Bumpers&sort=price_asc
// category is optional — omit to get all parts for a vehicle
router.get('/', async (req, res) => {
  const { brand, model, category, sort } = req.query;

  if (!brand || !model) {
    return res.status(400).json({ error: 'brand and model are required' });
  }

  try {
    const listings = await prisma.listing.findMany({
      where: {
        vehicle: { brand, model },
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
