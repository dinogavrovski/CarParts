const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/models/:brand
// Returns all models for a given brand
router.get('/:brand', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { brand: req.params.brand },
      select: { model: true },
      orderBy: { model: 'asc' },
    });
    res.json(vehicles.map((v) => v.model));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
