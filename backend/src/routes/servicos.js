// Serviços (tela T03 – Registro rápido). Cada serviço alimenta o histórico,
// o painel de gastos e o cálculo dos alertas (regra RN02).
const express = require('express');
const db = require('../db/database');
const { ErroHttp } = require('../utils/erros');
const { CATEGORIAS, TIPOS_SUGERIDOS } = require('../constants');
const { uploadFoto, removerFoto } = require('../middleware/upload');
const { paraInteiro, idValido } = require('../utils/validacao');
const { buscarVeiculo } = require('../services/veiculos');
const { formatarServico, validarServico, recalcularPlanos, criarServico } = require('../services/servicos');

const router = express.Router();

// Opções para montar a tela de registro.
router.get('/opcoes', (req, res) => {
  res.json({ categorias: CATEGORIAS, tipos_sugeridos: TIPOS_SUGERIDOS });
});

// Lista os serviços de um veículo (mais recentes primeiro).
// Filtros opcionais: ?ano=2026  ?categoria=Revisão  ?limite=5
router.get('/veiculos/:veiculoId/servicos', (req, res) => {
  const veiculo = buscarVeiculo(req.params.veiculoId);
  const filtros = ['veiculo_id = @veiculoId'];
  const params = { veiculoId: veiculo.id };

  if (req.query.ano) {
    filtros.push("strftime('%Y', data) = @ano");
    params.ano = String(req.query.ano);
  }
  if (req.query.categoria) {
    filtros.push('categoria = @categoria');
    params.categoria = String(req.query.categoria);
  }

  let sql = `SELECT * FROM servicos WHERE ${filtros.join(' AND ')} ORDER BY data DESC, id DESC`;
  const limite = paraInteiro(req.query.limite);
  if (limite && limite > 0) {
    sql += ' LIMIT @limite';
    params.limite = limite;
  }

  res.json(db.prepare(sql).all(params).map(formatarServico));
});

// Registra um serviço. Aceita JSON ou multipart/form-data (com o campo "foto").
router.post('/veiculos/:veiculoId/servicos', uploadFoto, (req, res, next) => {
  try {
    const veiculo = buscarVeiculo(req.params.veiculoId);
    const dados = validarServico(req.body);
    const servico = criarServico(veiculo, dados, req.file ? req.file.filename : null);
    res.status(201).json(servico);
  } catch (err) {
    if (req.file) removerFoto(req.file.filename); // não deixa foto órfã se o registro falhar
    next(err);
  }
});

router.get('/servicos/:id', (req, res) => {
  const id = idValido(req.params.id);
  const servico = id && db.prepare('SELECT * FROM servicos WHERE id = ?').get(id);
  if (!servico) throw new ErroHttp(404, 'Serviço não encontrado.');
  res.json(formatarServico(servico));
});

router.delete('/servicos/:id', (req, res) => {
  const id = idValido(req.params.id);
  const servico = id && db.prepare('SELECT * FROM servicos WHERE id = ?').get(id);
  if (!servico) throw new ErroHttp(404, 'Serviço não encontrado.');

  db.transaction(() => {
    db.prepare('DELETE FROM servicos WHERE id = ?').run(id);
    recalcularPlanos(servico.veiculo_id);
  })();
  removerFoto(servico.foto_nota);
  res.status(204).end();
});

module.exports = router;
