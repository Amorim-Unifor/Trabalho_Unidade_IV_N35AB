/**
 * Unit Converter Backend - ExpressJS
 * Endpoints:
 *  POST /api/convert -> { from: "m"|"km"|"mi"|"ft", to: "m"|"km"|"mi"|"ft", value: number }
 *  GET  /api/health -> { status: 'ok' }
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend
const frontendPath = path.resolve(__dirname, '../converter-frontend');
console.log(`📁 Servindo arquivos estáticos de: ${frontendPath}`);
app.use(express.static(frontendPath));

const toMeters = {
  m: 1,
  km: 1000,
  mi: 1609.344,
  ft: 0.3048
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      console.error('Erro ao servir index.html:', err.message);
      res.status(500).send('Erro ao carregar a aplicação');
    }
  });
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

// Fallback para servir index.html para rotas que não são API
app.get('*', (req, res) => {
  const indexPath = path.resolve(__dirname, '../converter-frontend/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`❌ Erro ao servir ${indexPath}:`, err.message);
      res.status(500).send('Erro ao carregar a página');
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Converter backend rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
