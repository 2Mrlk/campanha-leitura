const express = require('express');
const router = express.Router();
const supabase = require('../data/supabase');

// POST /api/alunos/login
router.post('/login', async (req, res, next) => {
  try {
    const { rm, senha } = req.body;
    if (!rm || !senha) {
      return res.status(400).json({ sucesso: false, mensagem: 'RM e senha são obrigatórios' });
    }

    // Busca aluno pelo RM e senha (em produção, use hash bcrypt)
    const { data: aluno, error } = await supabase
      .from('alunos')
      .select('id, rm, nome, turma_id')
      .eq('rm', rm)
      .eq('senha_hash', senha) // ⚠️ substituir por bcrypt em produção
      .maybeSingle();

    if (error) throw error;
    if (!aluno) {
      return res.status(401).json({ sucesso: false, mensagem: 'RM ou senha inválidos' });
    }

    // Busca nome da turma
    const { data: turma } = await supabase
      .from('turmas')
      .select('nome')
      .eq('id', aluno.turma_id)
      .maybeSingle();

    res.json({
      sucesso: true,
      aluno: {
        id: aluno.id,
        rm: aluno.rm,
        nome: aluno.nome,
        turma_id: aluno.turma_id,
        turma_nome: turma?.nome || 'Turma não definida'
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;