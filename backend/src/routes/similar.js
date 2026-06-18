const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

function tokenize(title) {
  return title
    .toLowerCase()
    .replace(/[^a-zа-ш0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2)
}

// Use the shorter model as the query — handles long Delmak model names vs short Delovi ones
function modelRecall(a, b) {
  const tA = tokenize(a);
  const tB = tokenize(b);
  const [query, candidateSet] = tA.length <= tB.length
    ? [tA, new Set(tB)]
    : [tB, new Set(tA)];
  if (query.length === 0) return 0;
  return query.filter(t => candidateSet.has(t)).length / query.length;
}

// Jaccard similarity between two token arrays
function similarity(a, b) {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = [...setA].filter(x => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

// GET /api/similar/:id
// Returns listings with title similarity >= threshold, from any store except the source listing's store
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  try {
    const source = await prisma.listing.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true, logoUrl: true } },
        vehicle: { select: { brand: true, model: true } },
        category: { select: { name: true } },
      },
    })

    if (!source) return res.status(404).json({ error: 'Listing not found' })

    // Fuzzy-match vehicles of the same brand across all stores
    const allVehicles = await prisma.vehicle.findMany({ where: { brand: source.vehicle.brand } });
    const matchedVehicleIds = allVehicles
      .filter(v => modelRecall(v.model, source.vehicle.model) >= 0.8)
      .map(v => v.id);

    const candidates = await prisma.listing.findMany({
      where: {
        vehicleId: { in: matchedVehicleIds },
        category: { name: source.category.name },
        id: { not: id },
        storeId: { not: source.store.id },
      },
      include: {
        store: { select: { id: true, name: true, logoUrl: true } },
      },
    })

    const sourceTokens = tokenize(source.title)

    const THRESHOLD = 0.25

    const matches = candidates
      .map(c => ({ ...c, score: similarity(sourceTokens, tokenize(c.title)) }))
      .filter(c => c.score >= THRESHOLD)
      .sort((a, b) => a.price - b.price)

    res.json({ source, matches })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router;
