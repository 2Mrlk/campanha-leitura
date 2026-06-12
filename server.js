require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const alunosRoutes = require('./routes/alunos');
const registrosRoutes = require('./routes/registros');
const rankingsRoutes = require('./routes/rankings');
const turmasRoutes = require('./routes/turmas');
// Se tiver admin routes:
// const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/alunos', alunosRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/turmas', turmasRoutes);
// app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

// Exportar para Vercel (não usar app.listen)
module.exports = app;

// Se quiser manter para rodar localmente, pode fazer:
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Local: http://localhost:${PORT}`));
}
