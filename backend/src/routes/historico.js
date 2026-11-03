// Início (T02) e relatório de histórico para venda (T07).
const crypto = require('crypto');
const express = require('express');
const db = require('../db/database');
const { ErroHttp } = require('../utils/erros');
const { hoje } = require('../utils/validacao');
const { buscarVeiculo } = require('../services/veiculos');
const { formatarServico } = require('../services/servicos');
const { calcularAlerta } = require('../services/alertas');
const { formatarDocumento } = require('../services/documentos');

const router = express.Router();

// Monta o relatório completo do veículo: resumo + linha do tempo de serviços.
function montarHistorico(veiculo) {
  const servicos = db
    .prepare('SELECT * FROM servicos WHERE veiculo_id = ? ORDER BY data DESC, id DESC')
    .all(veiculo.id);

  const resumo = db
    .prepare(
      `SELECT COUNT(*) AS total_servicos,
              ROUND(COALESCE(SUM(valor), 0), 2) AS total_investido,
              MIN(data) AS primeiro_registro,
              MAX(data) AS ultimo_servico,
              COALESCE(SUM(CASE WHEN foto_nota IS NOT NULL THEN 1 ELSE 0 END), 0) AS servicos_com_nota
       FROM servicos WHERE veiculo_id = ?`
    )
    .get(veiculo.id);

  return { veiculo, resumo, linha_do_tempo: servicos.map(formatarServico) };
}

// Ordem de urgência para listar os próximos vencimentos.
const ORDEM_STATUS = { vencido: 0, atencao: 1, em_breve: 2 };

// Tela Início: gasto do mês, próximos vencimentos e últimos serviços.
router.get('/veiculos/:veiculoId/resumo', (req, res) => {
  const veiculo = buscarVeiculo(req.params.veiculoId);
  const dataHoje = hoje();

  const { total: gastoMes } = db
    .prepare(
      `SELECT ROUND(COALESCE(SUM(valor), 0), 2) AS total FROM servicos
       WHERE veiculo_id = ? AND strftime('%Y-%m', data) = ?`
    )
    .get(veiculo.id, dataHoje.slice(0, 7));

  const vencimentos = [];
  db.prepare('SELECT * FROM planos_revisao WHERE veiculo_id = ?').all(veiculo.id).forEach((plano) => {
    const a = calcularAlerta(plano, veiculo, dataHoje);
    if (a.status !== 'ok') {
      vencimentos.push({
        origem: 'revisao', id: a.id, titulo: a.nome, status: a.status,
        km_restantes: a.km_restantes, dias_restantes: a.dias_restantes, criterio: a.criterio,
        ordem: a.progresso,
      });
    }
  });
  db.prepare("SELECT * FROM documentos WHERE veiculo_id = ? AND status = 'pendente'").all(veiculo.id).forEach((doc) => {
    const d = formatarDocumento(doc, dataHoje);
    let status = null;
    if (d.situacao === 'atrasado') status = 'vencido';
    else if (d.situacao === 'atencao') status = 'atencao';
    else if (d.dias_restantes <= 60) status = 'em_breve';
    if (status) {
      vencimentos.push({
        origem: 'documento', id: d.id, titulo: d.tipo, status,
        vencimento: d.vencimento, dias_restantes: d.dias_restantes,
        ordem: 100 - Math.max(d.dias_restantes, 0),
      });
    }
  });
  vencimentos.sort((a, b) => ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] || b.ordem - a.ordem);

  const ultimos = db
    .prepare('SELECT * FROM servicos WHERE veiculo_id = ? ORDER BY data DESC, id DESC LIMIT 3')
    .all(veiculo.id)
    .map(formatarServico);

  res.json({
    veiculo,
    gasto_mes: gastoMes,
    proximos_vencimentos: vencimentos.slice(0, 4).map(({ ordem, ...resto }) => resto),
    ultimos_servicos: ultimos,
  });
});

// Histórico completo do veículo (T07).
router.get('/veiculos/:veiculoId/historico', (req, res) => {
  res.json(montarHistorico(buscarVeiculo(req.params.veiculoId)));
});

// "Compartilhar link": gera um endereço público e difícil de adivinhar para o relatório.
router.post('/veiculos/:veiculoId/relatorio/compartilhar', (req, res) => {
  const veiculo = buscarVeiculo(req.params.veiculoId);
  const token = crypto.randomBytes(16).toString('hex');
  db.prepare('INSERT INTO compartilhamentos (token, veiculo_id) VALUES (?, ?)').run(token, veiculo.id);
  res.status(201).json({ token, caminho: `/relatorio/${token}` });
});

// Relatório público acessado por quem recebeu o link (sem login).
router.get('/relatorio/:token', (req, res) => {
  const link = db.prepare('SELECT * FROM compartilhamentos WHERE token = ?').get(req.params.token);
  if (!link) throw new ErroHttp(404, 'Relatório não encontrado.');
  const veiculo = db.prepare('SELECT * FROM veiculos WHERE id = ?').get(link.veiculo_id);
  res.json({ ...montarHistorico(veiculo), gerado_em: link.criado_em });
});

module.exports = router;
