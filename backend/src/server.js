const express = require('express');
const cors = require('cors');

const brandsRouter = require('./routes/brands');
const modelsRouter = require('./routes/models');
const categoriesRouter = require('./routes/categories');
const searchRouter = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/brands', brandsRouter);
app.use('/api/models', modelsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/search', searchRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
