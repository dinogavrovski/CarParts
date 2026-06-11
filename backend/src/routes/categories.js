const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/categories
// Returns all part categories
router.get('/', async (_req, res) => {
  try {
    const categories = await prisma.partCategory.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories.map((c) => c.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
