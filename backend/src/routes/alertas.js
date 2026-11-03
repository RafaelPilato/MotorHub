// Alertas de revisão (tela T05).
const express = require('express');
const db = require('../db/database');
const { ErroHttp } = require('../utils/erros');
const { idValido } = require('../utils/validacao');
const { buscarVeiculo } = require('../services/veiculos');
const { calcularAlerta } = require('../services/alertas');
const { validarServico, criarServico } = require('../services/servicos');

const router = express.Router();

// Lista os alertas do veículo, dos mais urgentes para os menos urgentes.
router.get('/veiculos/:veiculoId/alertas', (req, res) => {
  const veiculo = buscarVeiculo(req.params.veiculoId);
  const planos = db.prepare('SELECT * FROM planos_revisao WHERE veiculo_id = ?').all(veiculo.id);
  const alertas = planos.map((p) => calcularAlerta(p, veiculo));
  alertas.sort((a, b) => b.progresso - a.progresso || a.km_restantes - b.km_restantes);
  res.json(alertas);
});

// "Marcar como feito": registra o serviço do alerta (hoje, no km atual do carro)
// e reinicia a contagem. Opcional no corpo: valor, oficina, km, data.
router.post('/veiculos/:veiculoId/alertas/:planoId/concluir', (req, res) => {
  const veiculo = buscarVeiculo(req.params.veiculoId);
  const planoId = idValido(req.params.planoId);
  const plano = planoId && db.prepare('SELECT * FROM planos_revisao WHERE id = ? AND veiculo_id = ?').get(planoId, veiculo.id);
  if (!plano) throw new ErroHttp(404, 'Alerta não encontrado.');

  const corpo = req.body || {};
  const dados = validarServico({
    data: corpo.data,
    km: corpo.km ?? veiculo.km_atual,
    tipo: plano.tipo_servico,
    valor: corpo.valor ?? 0,
    oficina: corpo.oficina,
  });
  const servico = criarServico(veiculo, dados);

  const atualizado = db.prepare('SELECT * FROM planos_revisao WHERE id = ?').get(plano.id);
  const veiculoAtualizado = db.prepare('SELECT * FROM veiculos WHERE id = ?').get(veiculo.id);
  res.status(201).json({ servico, alerta: calcularAlerta(atualizado, veiculoAtualizado) });
});

module.exports = router;
