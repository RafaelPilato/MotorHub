// Testes de gastos, alertas, documentos, resumo e histórico. Rodam com: npm test
// Usam um banco temporário, então não mexem nos dados reais.
process.env.DB_FILE = require('path').join(require('os').tmpdir(), `motorhub-teste-analises-${Date.now()}.db`);

const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('../src/app');
const db = require('../src/db/database');
const { hoje, somarDias } = require('../src/utils/validacao');

let servidor;
let base;
let carro; // veículo com histórico fixo (2025 e 2026)
let outro; // veículo para testar o resumo da tela inicial

test.before(async () => {
  await new Promise((resolve) => {
    servidor = app.listen(0, resolve);
  });
  base = `http://localhost:${servidor.address().port}`;
});

test.after(() => {
  servidor.close();
  db.close();
});

async function api(metodo, url, corpo) {
  const res = await fetch(base + url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await res.text();
  return { status: res.status, corpo: texto ? JSON.parse(texto) : null };
}

async function criarVeiculo(placa, km) {
  const r = await api('POST', '/api/veiculos', { marca: 'Chevrolet', modelo: 'Onix', ano: 2018, placa, km_atual: km });
  assert.equal(r.status, 201);
  return r.corpo;
}

test('preparação: veículo com serviços em 2025 e 2026', async () => {
  carro = await criarVeiculo('ABC-1D23', 62340);
  const servicos = [
    ['2025-02-14', 50000, 'Revisão 50.000 km', 890],
    ['2025-04-22', 51400, 'Pneus', 1800],
    ['2025-12-17', 53540, 'Troca de óleo', 210],
    ['2026-08-12', 60010, 'Revisão 60.000 km', 900],
    ['2026-08-15', 60100, 'Freios', 520],
    ['2026-10-14', 62100, 'Alinhamento', 90],
  ];
  for (const [data, km, tipo, valor] of servicos) {
    const r = await api('POST', `/api/veiculos/${carro.id}/servicos`, { data, km, tipo, valor });
    assert.equal(r.status, 201);
  }
});

// ---------- Gastos (T04) ----------

test('gastos anuais: total, comparativo com o ano anterior, categorias e meses', async () => {
  const { status, corpo: g } = await api('GET', `/api/veiculos/${carro.id}/gastos?ano=2026`);
  assert.equal(status, 200);
  assert.equal(g.periodo, 'anual');
  assert.equal(g.total, 1510);
  assert.equal(g.quantidade_servicos, 3);
  assert.equal(g.total_anterior, 2900);
  assert.equal(g.variacao_percentual, -47.9);

  assert.deepEqual(g.por_categoria.map((c) => c.categoria), ['Revisão', 'Peças', 'Reparos', 'Documentos', 'Outros']);
  assert.deepEqual(g.por_categoria.map((c) => c.total), [900, 520, 90, 0, 0]);
  assert.equal(g.por_categoria[0].percentual, 59.6);

  assert.equal(g.por_mes.length, 12);
  assert.equal(g.por_mes[7].total, 1420); // agosto
  assert.equal(g.por_mes[9].total, 90); // outubro
  assert.equal(g.por_mes[0].total, 0);

  assert.deepEqual(g.anos_disponiveis.slice(0, 2).sort(), [2025, 2026]);
});

test('gastos mensais: compara com o mês anterior (inclusive virada de ano)', async () => {
  const agosto = (await api('GET', `/api/veiculos/${carro.id}/gastos?ano=2026&mes=8`)).corpo;
  assert.equal(agosto.periodo, 'mensal');
  assert.equal(agosto.total, 1420);
  assert.equal(agosto.total_anterior, 0);
  assert.equal(agosto.variacao_percentual, null);

  const janeiro = (await api('GET', `/api/veiculos/${carro.id}/gastos?ano=2026&mes=1`)).corpo;
  assert.equal(janeiro.total, 0);
  assert.equal(janeiro.total_anterior, 210); // dezembro de 2025
  assert.equal(janeiro.variacao_percentual, -100);
});

test('gastos: parâmetros inválidos e veículo inexistente', async () => {
  const a = await api('GET', `/api/veiculos/${carro.id}/gastos?ano=abc`);
  assert.equal(a.status, 400);
  assert.ok(a.corpo.campos.ano);
  const m = await api('GET', `/api/veiculos/${carro.id}/gastos?mes=13`);
  assert.equal(m.status, 400);
  assert.ok(m.corpo.campos.mes);
  assert.equal((await api('GET', '/api/veiculos/999/gastos')).status, 404);
});

// ---------- Alertas (T05) ----------

test('alertas: status, critério (km ou data) e ordenação por urgência', async () => {
  const v = (await api('GET', `/api/veiculos/${carro.id}`)).corpo;
  const ajustar = db.prepare('UPDATE planos_revisao SET ultimo_km = ?, ultima_data = ? WHERE veiculo_id = ? AND tipo_servico = ?');
  ajustar.run(v.km_atual - 8800, somarDias(hoje(), -30), carro.id, 'Troca de óleo'); // 88% por km
  ajustar.run(v.km_atual - 4000, somarDias(hoje(), -400), carro.id, 'Filtro de ar'); // 55% por data
  ajustar.run(v.km_atual - 100, somarDias(hoje(), -1200), carro.id, 'Freios'); // passou do prazo

  const { status, corpo: alertas } = await api('GET', `/api/veiculos/${carro.id}/alertas`);
  assert.equal(status, 200);
  assert.deepEqual(alertas.map((a) => a.nome), ['Pastilhas de freio', 'Troca de óleo', 'Filtro de ar']);

  const [freios, oleo, filtro] = alertas;
  assert.equal(freios.status, 'vencido');
  assert.equal(freios.criterio, 'data');
  assert.equal(freios.progresso, 100);
  assert.ok(freios.dias_restantes < 0);

  assert.equal(oleo.status, 'atencao');
  assert.equal(oleo.criterio, 'km');
  assert.equal(oleo.km_restantes, 1200);
  assert.equal(oleo.progresso, 88);

  assert.equal(filtro.status, 'ok');
  assert.equal(filtro.criterio, 'data');
  assert.equal(filtro.dias_restantes, 330);
});

test('marcar alerta como feito: registra o serviço e reinicia a contagem', async () => {
  const oleo = (await api('GET', `/api/veiculos/${carro.id}/alertas`)).corpo.find((a) => a.nome === 'Troca de óleo');
  const r = await api('POST', `/api/veiculos/${carro.id}/alertas/${oleo.id}/concluir`, { valor: '230,00', oficina: 'Auto Center Silva' });
  assert.equal(r.status, 201);
  assert.equal(r.corpo.servico.tipo, 'Troca de óleo');
  assert.equal(r.corpo.servico.valor, 230);
  assert.equal(r.corpo.servico.categoria, 'Revisão');
  assert.equal(r.corpo.alerta.status, 'ok');
  assert.equal(r.corpo.alerta.progresso, 0);
  assert.equal(r.corpo.alerta.km_restantes, 10000);

  assert.equal((await api('POST', `/api/veiculos/${carro.id}/alertas/999/concluir`)).status, 404);
});

// ---------- Documentos (T06) ----------

let docIpva;

test('documentos: cadastra e calcula a situação de cada um', async () => {
  const lic = await api('POST', `/api/veiculos/${carro.id}/documentos`, { tipo: 'Licenciamento', vencimento: somarDias(hoje(), 10) });
  assert.equal(lic.status, 201);
  assert.equal(lic.corpo.situacao, 'atencao');
  assert.equal(lic.corpo.dias_restantes, 10);
  assert.equal(lic.corpo.lembrete_ativo, true);

  const ipva = await api('POST', `/api/veiculos/${carro.id}/documentos`, { tipo: 'IPVA', vencimento: somarDias(hoje(), -5) });
  assert.equal(ipva.corpo.situacao, 'atrasado');
  docIpva = ipva.corpo.id;

  const seguro = await api('POST', `/api/veiculos/${carro.id}/documentos`, { tipo: 'Seguro', vencimento: somarDias(hoje(), 200) });
  assert.equal(seguro.corpo.situacao, 'em_dia');

  const lista = (await api('GET', `/api/veiculos/${carro.id}/documentos`)).corpo;
  assert.deepEqual(lista.map((d) => d.tipo), ['IPVA', 'Licenciamento', 'Seguro']); // por vencimento
});

test('documentos: marcar como pago, desligar lembrete e validar dados', async () => {
  const pago = await api('PATCH', `/api/documentos/${docIpva}`, { status: 'pago' });
  assert.equal(pago.status, 200);
  assert.equal(pago.corpo.situacao, 'pago');

  const lembrete = await api('PATCH', `/api/documentos/${docIpva}`, { lembrete_ativo: false });
  assert.equal(lembrete.corpo.lembrete_ativo, false);
  assert.equal(lembrete.corpo.status, 'pago'); // não mexeu no resto

  const ruim = await api('PATCH', `/api/documentos/${docIpva}`, { status: 'talvez' });
  assert.equal(ruim.status, 400);

  const invalido = await api('POST', `/api/veiculos/${carro.id}/documentos`, { tipo: 'Multa', vencimento: '31/12/2026' });
  assert.equal(invalido.status, 400);
  assert.deepEqual(Object.keys(invalido.corpo.campos).sort(), ['tipo', 'vencimento']);
});

test('documentos: exclui e retorna 404 depois', async () => {
  assert.equal((await api('DELETE', `/api/documentos/${docIpva}`)).status, 204);
  assert.equal((await api('PATCH', `/api/documentos/${docIpva}`, {})).status, 404);
});

// ---------- Início (T02) ----------

test('resumo da tela inicial: gasto do mês, próximos vencimentos e últimos serviços', async () => {
  outro = await criarVeiculo('XYZ-9876', 1000);
  for (const [data, valor, tipo] of [
    [somarDias(hoje(), -90), 100, 'Lavagem'],
    [somarDias(hoje(), -60), 120, 'Bateria'],
    [somarDias(hoje(), -30), 140, 'Suspensão'],
    [hoje(), 50, 'Lavagem'],
  ]) {
    await api('POST', `/api/veiculos/${outro.id}/servicos`, { data, km: 1000, tipo, valor });
  }
  await api('POST', `/api/veiculos/${outro.id}/documentos`, { tipo: 'Licenciamento', vencimento: somarDias(hoje(), 10) });
  db.prepare("UPDATE planos_revisao SET ultima_data = ? WHERE veiculo_id = ? AND tipo_servico = 'Troca de óleo'").run(
    somarDias(hoje(), -400),
    outro.id
  );

  const { status, corpo: r } = await api('GET', `/api/veiculos/${outro.id}/resumo`);
  assert.equal(status, 200);
  assert.equal(r.veiculo.placa, 'XYZ-9876');
  assert.ok(r.gasto_mes >= 50);

  assert.equal(r.ultimos_servicos.length, 3);
  assert.equal(r.ultimos_servicos[0].data, hoje());

  assert.equal(r.proximos_vencimentos.length, 2);
  assert.equal(r.proximos_vencimentos[0].origem, 'revisao'); // vencido vem primeiro
  assert.equal(r.proximos_vencimentos[0].status, 'vencido');
  assert.equal(r.proximos_vencimentos[1].origem, 'documento');
  assert.equal(r.proximos_vencimentos[1].status, 'atencao');
  assert.equal(r.proximos_vencimentos[1].dias_restantes, 10);
});

// ---------- Histórico (T07) ----------

test('histórico: resumo e linha do tempo do veículo', async () => {
  const { status, corpo: h } = await api('GET', `/api/veiculos/${carro.id}/historico`);
  assert.equal(status, 200);
  assert.equal(h.resumo.total_servicos, h.linha_do_tempo.length);
  assert.equal(h.resumo.total_servicos, 7); // 6 do preparo + 1 do "marcar como feito"
  assert.equal(h.resumo.total_investido, 890 + 1800 + 210 + 900 + 520 + 90 + 230);
  assert.equal(h.resumo.primeiro_registro, '2025-02-14');
  assert.equal(h.resumo.ultimo_servico, hoje());
  assert.equal(h.resumo.servicos_com_nota, 0);

  const datas = h.linha_do_tempo.map((s) => s.data);
  assert.deepEqual(datas, [...datas].sort().reverse());
});

test('compartilhar relatório: gera link público e rejeita token inválido', async () => {
  const c = await api('POST', `/api/veiculos/${carro.id}/relatorio/compartilhar`);
  assert.equal(c.status, 201);
  assert.match(c.corpo.token, /^[0-9a-f]{32}$/);
  assert.equal(c.corpo.caminho, `/relatorio/${c.corpo.token}`);

  const publico = await api('GET', `/api/relatorio/${c.corpo.token}`);
  assert.equal(publico.status, 200);
  assert.equal(publico.corpo.veiculo.placa, 'ABC-1D23');
  assert.equal(publico.corpo.linha_do_tempo.length, 7);
  assert.ok(publico.corpo.gerado_em);

  assert.equal((await api('GET', '/api/relatorio/naoexiste')).status, 404);
});
