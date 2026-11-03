// Painel de gastos (tela T04): totais por período, por categoria e por mês.
const express = require('express');
const db = require('../db/database');
const { ErroHttp } = require('../utils/erros');
const { CATEGORIAS } = require('../constants');
const { paraInteiro, hoje } = require('../utils/validacao');
const { buscarVeiculo } = require('../services/veiculos');

const router = express.Router();

const arredondar = (n, casas = 1) => Math.round(n * 10 ** casas) / 10 ** casas;
const doisDigitos = (n) => String(n).padStart(2, '0');

// Monta o filtro SQL de ano (e mês, se informado).
function filtroPeriodo(ano, mes) {
  const params = { ano: String(ano) };
  let sql = "strftime('%Y', data) = @ano";
  if (mes) {
    sql += " AND strftime('%m', data) = @mes";
    params.mes = doisDigitos(mes);
  }
  return { sql, params };
}

function totalDoPeriodo(veiculoId, ano, mes) {
  const { sql, params } = filtroPeriodo(ano, mes);
  return db
    .prepare(
      `SELECT ROUND(COALESCE(SUM(valor), 0), 2) AS total, COUNT(*) AS quantidade
       FROM servicos WHERE veiculo_id = @veiculoId AND ${sql}`
    )
    .get({ veiculoId, ...params });
}

// GET /api/veiculos/:id/gastos?ano=2026            -> visão anual
// GET /api/veiculos/:id/gastos?ano=2026&mes=10     -> visão mensal
router.get('/veiculos/:veiculoId/gastos', (req, res) => {
  const veiculo = buscarVeiculo(req.params.veiculoId);
  const campos = {};

  const anoAtual = Number(hoje().slice(0, 4));
  const ano = req.query.ano === undefined || req.query.ano === '' ? anoAtual : paraInteiro(req.query.ano);
  if (ano === null || ano < 1900 || ano > 2100) campos.ano = 'Informe um ano válido (ex.: 2026).';

  let mes = null;
  if (req.query.mes !== undefined && req.query.mes !== '') {
    mes = paraInteiro(req.query.mes);
    if (mes === null || mes < 1 || mes > 12) campos.mes = 'Informe um mês de 1 a 12.';
  }
  if (Object.keys(campos).length) throw new ErroHttp(400, 'Parâmetros inválidos.', campos);

  // Período atual e período anterior (mês anterior ou ano anterior), para o comparativo.
  const atual = totalDoPeriodo(veiculo.id, ano, mes);
  let anterior;
  if (mes) anterior = mes === 1 ? totalDoPeriodo(veiculo.id, ano - 1, 12) : totalDoPeriodo(veiculo.id, ano, mes - 1);
  else anterior = totalDoPeriodo(veiculo.id, ano - 1, null);
  const variacao = anterior.total > 0 ? arredondar(((atual.total - anterior.total) / anterior.total) * 100) : null;

  // Gasto por categoria no período (todas as categorias aparecem, mesmo zeradas).
  const { sql, params } = filtroPeriodo(ano, mes);
  const linhasCategoria = db
    .prepare(
      `SELECT categoria, ROUND(SUM(valor), 2) AS total FROM servicos
       WHERE veiculo_id = @veiculoId AND ${sql} GROUP BY categoria`
    )
    .all({ veiculoId: veiculo.id, ...params });
  const porCategoria = CATEGORIAS.map((categoria) => {
    const total = linhasCategoria.find((l) => l.categoria === categoria)?.total || 0;
    return { categoria, total, percentual: atual.total > 0 ? arredondar((total / atual.total) * 100) : 0 };
  }).sort((a, b) => b.total - a.total || CATEGORIAS.indexOf(a.categoria) - CATEGORIAS.indexOf(b.categoria));

  // Gasto mês a mês do ano (para o gráfico de barras).
  const linhasMes = db
    .prepare(
      `SELECT CAST(strftime('%m', data) AS INTEGER) AS mes, ROUND(SUM(valor), 2) AS total
       FROM servicos WHERE veiculo_id = ? AND strftime('%Y', data) = ? GROUP BY mes`
    )
    .all(veiculo.id, String(ano));
  const porMes = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    total: linhasMes.find((l) => l.mes === i + 1)?.total || 0,
  }));

  // Anos com registros, para o seletor da tela.
  const anos = db
    .prepare("SELECT DISTINCT CAST(strftime('%Y', data) AS INTEGER) AS ano FROM servicos WHERE veiculo_id = ?")
    .all(veiculo.id)
    .map((l) => l.ano);
  if (!anos.includes(anoAtual)) anos.push(anoAtual);

  res.json({
    veiculo_id: veiculo.id,
    periodo: mes ? 'mensal' : 'anual',
    ano,
    mes,
    total: atual.total,
    quantidade_servicos: atual.quantidade,
    total_anterior: anterior.total,
    variacao_percentual: variacao, // null quando o período anterior não tem gastos
    por_categoria: porCategoria,
    por_mes: porMes,
    anos_disponiveis: anos.sort((a, b) => b - a),
  });
});

module.exports = router;
