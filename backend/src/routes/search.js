const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/search?brand=BMW&model=E90&category=Brake+Pads
router.get('/', async (req, res) => {
  const { brand, model, category, sort } = req.query;

  if (!brand || !model || !category) {
    return res.status(400).json({ error: 'brand, model, and category are required' });
  }

  try {
    const listings = await prisma.listing.findMany({
      where: {
        vehicle: {
          brand: { equals: brand, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },
        },
        category: {
          name: { equals: category, mode: 'insensitive' },
        },
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
