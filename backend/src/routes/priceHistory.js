const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/price-history/:id — last 30 price snapshots for a listing
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const history = await prisma.priceHistory.findMany({
      where: { listingId: id },
      orderBy: { recordedAt: 'asc' },
      take: 30,
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
