// Testes automáticos da API. Rodam com: npm test
// Usam um banco temporário, então não mexem nos dados reais.
process.env.DB_FILE = require('path').join(require('os').tmpdir(), `motorhub-teste-${Date.now()}.db`);

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const app = require('../src/app');
const db = require('../src/db/database');
const { PASTA_UPLOADS } = require('../src/middleware/upload');

let servidor;
let base;
let veiculoId;

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

const json = (metodo, url, corpo) =>
  fetch(base + url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });

// Imagem PNG mínima (1x1 pixel) para testar o upload.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

test('saúde da API', async () => {
  const res = await fetch(`${base}/api/saude`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok', banco: 'conectado', veiculos: 0 });
});

test('cadastra veículo e normaliza a placa', async () => {
  const res = await json('POST', '/api/veiculos', {
    marca: 'Chevrolet', modelo: 'Onix', ano: 2018, placa: 'abc1d23', km_atual: '62340',
  });
  assert.equal(res.status, 201);
  const v = await res.json();
  assert.equal(v.placa, 'ABC-1D23');
  assert.equal(v.km_atual, 62340);
  veiculoId = v.id;
  const planos = db.prepare('SELECT COUNT(*) n FROM planos_revisao WHERE veiculo_id = ?').get(v.id);
  assert.equal(planos.n, 3, 'o cadastro deve criar os 3 alertas de revisão padrão');
});

test('rejeita veículo inválido com detalhes por campo', async () => {
  const res = await json('POST', '/api/veiculos', { marca: '', modelo: 'Onix', ano: 1800, placa: '123', km_atual: -5 });
  assert.equal(res.status, 400);
  const corpo = await res.json();
  assert.deepEqual(Object.keys(corpo.campos).sort(), ['ano', 'km_atual', 'marca', 'placa']);
});

test('rejeita placa duplicada (409)', async () => {
  const res = await json('POST', '/api/veiculos', {
    marca: 'Fiat', modelo: 'Uno', ano: 2010, placa: 'ABC-1D23', km_atual: 0,
  });
  assert.equal(res.status, 409);
});

test('atualiza o veículo', async () => {
  const res = await json('PUT', `/api/veiculos/${veiculoId}`, {
    marca: 'Chevrolet', modelo: 'Onix', ano: 2018, placa: 'ABC-1D23', km_atual: 63000,
  });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).km_atual, 63000);
});

test('veículo inexistente retorna 404', async () => {
  assert.equal((await fetch(`${base}/api/veiculos/999`)).status, 404);
  assert.equal((await fetch(`${base}/api/veiculos/abc`)).status, 404);
  assert.equal((await fetch(`${base}/api/veiculos/999/servicos`)).status, 404);
});

test('registra serviço em JSON: infere categoria e aceita valor com vírgula', async () => {
  const res = await json('POST', `/api/veiculos/${veiculoId}/servicos`, {
    data: '2026-10-20', km: 62900, tipo: 'Troca de óleo', valor: '220,50', oficina: 'Auto Center Silva',
  });
  assert.equal(res.status, 201);
  const s = await res.json();
  assert.equal(s.categoria, 'Revisão');
  assert.equal(s.valor, 220.5);
  assert.equal(s.foto_url, null);
});

test('serviço com km menor não diminui o km do veículo; km maior aumenta', async () => {
  await json('POST', `/api/veiculos/${veiculoId}/servicos`, { data: '2026-01-10', km: 50000, tipo: 'Pneus', valor: 100 });
  let v = await (await fetch(`${base}/api/veiculos/${veiculoId}`)).json();
  assert.equal(v.km_atual, 63000);

  await json('POST', `/api/veiculos/${veiculoId}/servicos`, { data: '2026-10-25', km: 63500, tipo: 'Alinhamento', valor: 90 });
  v = await (await fetch(`${base}/api/veiculos/${veiculoId}`)).json();
  assert.equal(v.km_atual, 63500);
});

test('rejeita serviço inválido (data futura, valor negativo, tipo vazio)', async () => {
  const res = await json('POST', `/api/veiculos/${veiculoId}/servicos`, {
    data: '2999-01-01', km: 'abc', tipo: '', valor: -1,
  });
  assert.equal(res.status, 400);
  const { campos } = await res.json();
  assert.deepEqual(Object.keys(campos).sort(), ['data', 'km', 'tipo', 'valor']);
});

test('upload da foto da nota: salva, serve o arquivo e apaga ao excluir o serviço', async () => {
  const form = new FormData();
  form.append('data', '2026-10-28');
  form.append('km', '63600');
  form.append('tipo', 'Freios');
  form.append('valor', '520');
  form.append('foto', new Blob([PNG], { type: 'image/png' }), 'nota.png');

  const res = await fetch(`${base}/api/veiculos/${veiculoId}/servicos`, { method: 'POST', body: form });
  assert.equal(res.status, 201);
  const s = await res.json();
  assert.equal(s.categoria, 'Peças');
  assert.match(s.foto_url, /^\/uploads\/.+\.png$/);

  const arquivo = path.join(PASTA_UPLOADS, path.basename(s.foto_url));
  assert.ok(fs.existsSync(arquivo));
  assert.equal((await fetch(base + s.foto_url)).status, 200);

  assert.equal((await fetch(`${base}/api/servicos/${s.id}`, { method: 'DELETE' })).status, 204);
  await new Promise((r) => setTimeout(r, 100));
  assert.ok(!fs.existsSync(arquivo), 'a foto deveria ter sido apagada');
  assert.equal((await fetch(`${base}/api/servicos/${s.id}`)).status, 404);
});

test('rejeita arquivo que não é imagem e não deixa registro', async () => {
  const antes = db.prepare('SELECT COUNT(*) n FROM servicos').get().n;
  const form = new FormData();
  form.append('km', '63700');
  form.append('tipo', 'Teste');
  form.append('valor', '10');
  form.append('foto', new Blob(['texto'], { type: 'text/plain' }), 'nota.txt');

  const res = await fetch(`${base}/api/veiculos/${veiculoId}/servicos`, { method: 'POST', body: form });
  assert.equal(res.status, 400);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM servicos').get().n, antes);
});

test('validação falha depois do upload: a foto não fica órfã', async () => {
  const antes = fs.readdirSync(PASTA_UPLOADS).length;
  const form = new FormData();
  form.append('km', 'abc');
  form.append('tipo', 'Freios');
  form.append('valor', '10');
  form.append('foto', new Blob([PNG], { type: 'image/png' }), 'nota.png');

  const res = await fetch(`${base}/api/veiculos/${veiculoId}/servicos`, { method: 'POST', body: form });
  assert.equal(res.status, 400);
  await new Promise((r) => setTimeout(r, 100));
  assert.equal(fs.readdirSync(PASTA_UPLOADS).length, antes);
});

test('lista serviços: mais recentes primeiro, com filtros e limite', async () => {
  const todos = await (await fetch(`${base}/api/veiculos/${veiculoId}/servicos`)).json();
  const datas = todos.map((s) => s.data);
  assert.deepEqual(datas, [...datas].sort().reverse());

  const de2026 = await (await fetch(`${base}/api/veiculos/${veiculoId}/servicos?ano=2026`)).json();
  assert.equal(de2026.length, todos.length);
  const de2025 = await (await fetch(`${base}/api/veiculos/${veiculoId}/servicos?ano=2025`)).json();
  assert.equal(de2025.length, 0);
  const so1 = await (await fetch(`${base}/api/veiculos/${veiculoId}/servicos?limite=1`)).json();
  assert.equal(so1.length, 1);
  const pecas = await (await fetch(`${base}/api/veiculos/${veiculoId}/servicos?categoria=Peças`)).json();
  assert.ok(pecas.every((s) => s.categoria === 'Peças'));
});

test('registrar serviço atualiza o plano de revisão (base dos alertas)', async () => {
  db.prepare(
    "UPDATE planos_revisao SET ultimo_km = 1000, ultima_data = '2020-01-01' WHERE veiculo_id = ? AND tipo_servico = 'Troca de óleo'"
  ).run(veiculoId);

  await json('POST', `/api/veiculos/${veiculoId}/servicos`, {
    data: '2026-11-01', km: 63800, tipo: 'TROCA DE ÓLEO', valor: 230,
  });
  const plano = db.prepare("SELECT * FROM planos_revisao WHERE veiculo_id = ? AND tipo_servico = 'Troca de óleo'").get(veiculoId);
  assert.equal(plano.ultimo_km, 63800);
  assert.equal(plano.ultima_data, '2026-11-01');
});

test('opções da tela de registro', async () => {
  const o = await (await fetch(`${base}/api/opcoes`)).json();
  assert.deepEqual(o.categorias, ['Revisão', 'Peças', 'Reparos', 'Documentos', 'Outros']);
  assert.ok(o.tipos_sugeridos.includes('Troca de óleo'));
});

test('JSON malformado retorna 400', async () => {
  const res = await fetch(`${base}/api/veiculos`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops',
  });
  assert.equal(res.status, 400);
});
