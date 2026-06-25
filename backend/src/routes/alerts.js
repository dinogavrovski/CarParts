const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/alerts — create a price alert
// Body: { email, listingId, targetPrice }
router.post('/', async (req, res) => {
  const { email, listingId, targetPrice } = req.body;
  if (!email || !listingId || !targetPrice) {
    return res.status(400).json({ error: 'email, listingId and targetPrice are required' });
  }

  try {
    const alert = await prisma.priceAlert.upsert({
      where: { email_listingId: { email, listingId: parseInt(listingId) } },
      update: { targetPrice: parseFloat(targetPrice), active: true },
      create: {
        email,
        listingId: parseInt(listingId),
        targetPrice: parseFloat(targetPrice),
      },
    });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/alerts — remove a price alert
// Body: { email, listingId }
router.delete('/', async (req, res) => {
  const { email, listingId } = req.body;
  if (!email || !listingId) {
    return res.status(400).json({ error: 'email and listingId are required' });
  }

  try {
    await prisma.priceAlert.updateMany({
      where: { email, listingId: parseInt(listingId) },
      data: { active: false },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
