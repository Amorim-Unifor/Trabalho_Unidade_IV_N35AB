/**
 * Unit Converter Backend - ExpressJS
 * Endpoints:
 *  POST /api/convert -> { from: "m"|"km"|"mi"|"ft", to: "m"|"km"|"mi"|"ft", value: number }
 *  GET  /api/health -> { status: 'ok' }
 */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const toMeters = {
  m: 1,
  km: 1000,
  mi: 1609.344,
  ft: 0.3048
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/convert', (req, res) => {
  try {
    const { from, to, value } = req.body || {};
    if (!from || !to || value === undefined) {
      return res.status(400).json({ error: 'Parâmetros ausentes. Use from, to e value.' });
    }
    if (!toMeters[from] || !toMeters[to]) {
      return res.status(400).json({ error: 'Unidades inválidas. Use m, km, mi ou ft.' });
    }
    const V = Number(value);
    if (!Number.isFinite(V)) {
      return res.status(400).json({ error: 'Valor inválido para "value".' });
    }

    const result = V * toMeters[from] / toMeters[to];
    const expression = `${V} ${from} = ${result} ${to}`;
    res.json({ result, expression });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Converter backend rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
