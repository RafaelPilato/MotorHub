// Configuração do Express e registro das rotas.
const express = require('express');
const cors = require('cors');
const db = require('./db/database');
const { PASTA_UPLOADS } = require('./middleware/upload');
const veiculosRouter = require('./routes/veiculos');
const servicosRouter = require('./routes/servicos');
const gastosRouter = require('./routes/gastos');
const alertasRouter = require('./routes/alertas');
const documentosRouter = require('./routes/documentos');
const historicoRouter = require('./routes/historico');

const app = express();

app.use(cors());
app.use(express.json());

// Fotos das notas fiscais enviadas pelos usuários.
app.use('/uploads', express.static(PASTA_UPLOADS));

// Rota de verificação: confirma que a API e o banco estão funcionando.
app.get('/api/saude', (req, res) => {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM veiculos').get();
  res.json({ status: 'ok', banco: 'conectado', veiculos: total });
});

// Rotas da API.
app.use('/api/veiculos', veiculosRouter);
app.use('/api', servicosRouter);
app.use('/api', gastosRouter);
app.use('/api', alertasRouter);
app.use('/api', documentosRouter);
app.use('/api', historicoRouter);

// Rota inexistente dentro da API.
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Tratamento de erros: erros esperados (ErroHttp) viram JSON com o código certo.
app.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({ erro: err.message, ...(err.campos && { campos: err.campos }) });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

module.exports = app;
