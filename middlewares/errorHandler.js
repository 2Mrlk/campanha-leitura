const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({
    sucesso: false,
    mensagem: 'Erro interno do servidor',
    erro: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;