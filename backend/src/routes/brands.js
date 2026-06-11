const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/brands
// Returns all distinct vehicle brands that have at least one listing
router.get('/', async (_req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      distinct: ['brand'],
      select: { brand: true },
      orderBy: { brand: 'asc' },
    });
    res.json(vehicles.map((v) => v.brand));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
