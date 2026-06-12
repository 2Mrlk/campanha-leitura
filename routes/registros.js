const express = require('express');
const router = express.Router();
const supabase = require('../data/supabase');

// POST /api/registros
router.post('/', async (req, res, next) => {
  try {
    const { aluno_id, minutos } = req.body;
    const hoje = new Date().toISOString().slice(0, 10);

    if (!aluno_id || !minutos || minutos < 1 || minutos > 16) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'aluno_id e minutos (1 a 16) são obrigatórios'
      });
    }

    // Verifica registro de hoje
    const { data: existente, error: fetchError } = await supabase
      .from('registros_leitura')
      .select('minutos')
      .eq('aluno_id', aluno_id)
      .eq('data_registro', hoje)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const minutosAtuais = existente?.minutos || 0;
    const totalMinutos = minutosAtuais + minutos;

    if (totalMinutos > 16) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Limite de 16 minutos por dia. Você já leu ${minutosAtuais} min hoje. Só pode adicionar mais ${16 - minutosAtuais} min.`
      });
    }

    // Upsert
    const { data, error } = await supabase
      .from('registros_leitura')
      .upsert({
        aluno_id,
        data_registro: hoje,
        minutos: totalMinutos
      })
      .select();

    if (error) throw error;

    res.json({
      sucesso: true,
      registro: data[0],
      mensagem: `${minutos} minutos registrados! Total hoje: ${totalMinutos}/16`
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/registros/aluno/:aluno_id (histórico)
router.get('/aluno/:aluno_id', async (req, res, next) => {
  try {
    const { aluno_id } = req.params;
    const { data, error } = await supabase
      .from('registros_leitura')
      .select('*')
      .eq('aluno_id', aluno_id)
      .order('data_registro', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;