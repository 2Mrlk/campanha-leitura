require('dotenv').config(); // ⚠️ DEVE SER A PRIMEIRA LINHA

const express = require('express');
const cors = require('cors');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const alunosRoutes = require('./routes/alunos');
const registrosRoutes = require('./routes/registros');
const rankingsRoutes = require('./routes/rankings');
const turmasRoutes = require('./routes/turmas');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/alunos', alunosRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/turmas', turmasRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});