const express = require('express');
const router = express.Router();
const supabase = require('../data/supabase');

// GET /api/rankings/turmas
router.get('/turmas', async (req, res, next) => {
  try {
    const { data: turmas, error } = await supabase
      .from('turmas')
      .select(`
        id,
        nome,
        alunos (
          registros_leitura ( minutos )
        )
      `);

    if (error) throw error;

    const ranking = turmas.map(turma => {
      let total = 0;
      (turma.alunos || []).forEach(aluno => {
        (aluno.registros_leitura || []).forEach(reg => {
          total += reg.minutos;
        });
      });
      return { id: turma.id, nome: turma.nome, total_minutos: total };
    });

    ranking.sort((a, b) => b.total_minutos - a.total_minutos);
    res.json(ranking);
  } catch (err) {
    next(err);
  }
});

// GET /api/rankings/geral
router.get('/geral', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('registros_leitura')
      .select('minutos');

    if (error) throw error;
    const total = data.reduce((acc, reg) => acc + reg.minutos, 0);
    res.json({ total_minutos: total, meta: 1000000 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;