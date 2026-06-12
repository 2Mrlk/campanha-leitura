require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ================= ROTAS =================
// Login
app.post('/api/alunos/login', async (req, res) => {
  const { rm, senha } = req.body;
  const { data, error } = await supabase
    .from('alunos')
    .select('id, rm, nome, turma_id')
    .eq('rm', rm)
    .eq('senha_hash', senha)
    .maybeSingle();
  if (error || !data) return res.status(401).json({ sucesso: false, mensagem: 'RM ou senha inválidos' });
  const { data: turma } = await supabase.from('turmas').select('nome').eq('id', data.turma_id).maybeSingle();
  res.json({ sucesso: true, aluno: { ...data, turma_nome: turma?.nome || 'N/A' } });
});

// Registrar minutos
app.post('/api/registros', async (req, res) => {
  const { aluno_id, minutos } = req.body;
  const hoje = new Date().toISOString().slice(0,10);
  if (!aluno_id || minutos < 1 || minutos > 16) return res.status(400).json({ sucesso: false, mensagem: 'Dados inválidos' });
  const { data: existente } = await supabase
    .from('registros_leitura')
    .select('minutos')
    .eq('aluno_id', aluno_id)
    .eq('data_registro', hoje)
    .maybeSingle();
  const total = (existente?.minutos || 0) + minutos;
  if (total > 16) return res.status(400).json({ sucesso: false, mensagem: `Limite de 16min/dia. Você já leu ${existente?.minutos || 0}min.` });
  const { error } = await supabase
    .from('registros_leitura')
    .upsert({ aluno_id, data_registro: hoje, minutos: total });
  if (error) return res.status(500).json({ sucesso: false });
  res.json({ sucesso: true, mensagem: `${minutos}min registrados! Total hoje: ${total}/16` });
});

// Histórico do aluno
app.get('/api/registros/aluno/:aluno_id', async (req, res) => {
  const { data } = await supabase
    .from('registros_leitura')
    .select('*')
    .eq('aluno_id', req.params.aluno_id)
    .order('data_registro', { ascending: false });
  res.json(data);
});

// Total geral
app.get('/api/rankings/geral', async (req, res) => {
  const { data } = await supabase.from('registros_leitura').select('minutos');
  const total = data?.reduce((a,b) => a + b.minutos, 0) || 0;
  res.json({ total_minutos: total, meta: 1000000 });
});

// Ranking por turma
app.get('/api/rankings/turmas', async (req, res) => {
  const { data: turmas } = await supabase.from('turmas').select('id, nome');
  const { data: alunos } = await supabase.from('alunos').select('id, turma_id');
  const { data: registros } = await supabase.from('registros_leitura').select('aluno_id, minutos');
  const mapAlunoTurma = Object.fromEntries((alunos || []).map(a => [a.id, a.turma_id]));
  const somaPorTurma = {};
  (registros || []).forEach(r => {
    const turmaId = mapAlunoTurma[r.aluno_id];
    if (turmaId) somaPorTurma[turmaId] = (somaPorTurma[turmaId] || 0) + r.minutos;
  });
  const ranking = (turmas || []).map(t => ({ id: t.id, nome: t.nome, total_minutos: somaPorTurma[t.id] || 0 }));
  ranking.sort((a,b) => b.total_minutos - a.total_minutos);
  res.json(ranking);
});

// Listar turmas (para cadastro)
app.get('/api/turmas', async (req, res) => {
  const { data } = await supabase.from('turmas').select('*').order('nome');
  res.json(data || []);
});

// Rota de saúde
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Fallback para 404 (se nenhuma rota acima atender)
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Exporta para Vercel
module.exports = app;
