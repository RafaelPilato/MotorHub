// Popula o banco com dados de exemplo para desenvolvimento e demonstração.
// Uso: npm run seed   (apaga os dados atuais e recria tudo)
const db = require('./database');
const { hoje, somarDias } = require('../utils/validacao');

// Devolve a data (AAAA-MM-DD) de hoje somada a um número de dias.
function dataEmDias(dias) {
  return somarDias(hoje(), dias);
}

const veiculo = {
  marca: 'Chevrolet',
  modelo: 'Onix',
  ano: 2018,
  placa: 'ABC-1D23',
  km_atual: 62340,
};

// [data, km, tipo, categoria, valor, oficina]
const servicos = [
  ['2025-02-14', 50000, 'Revisão 50.000 km',  'Revisão',    890,  'Auto Center Silva'],
  ['2025-04-22', 51400, 'Pneus',              'Peças',      1800, 'Pneus Sul'],
  ['2025-12-17', 53540, 'Troca de óleo',      'Revisão',    210,  'Auto Center Silva'],
  ['2026-01-12', 54200, 'Reparo elétrico',    'Reparos',    150,  'Auto Elétrica Central'],
  ['2026-01-20', 54400, 'Taxa de vistoria',   'Documentos', 150,  null],
  ['2026-02-10', 55300, 'Filtro de ar',       'Revisão',    300,  'Auto Center Silva'],
  ['2026-03-10', 56100, 'IPVA 2026',          'Documentos', 250,  null],
  ['2026-04-08', 57000, 'Bateria',            'Peças',      380,  'Auto Center Silva'],
  ['2026-06-18', 58600, 'Suspensão',          'Reparos',    410,  'Mecânica do Paulo'],
  ['2026-07-05', 59300, 'Lavagem e polimento','Outros',     100,  'Estética Auto'],
  ['2026-08-12', 60010, 'Revisão 60.000 km',  'Revisão',    900,  'Auto Center Silva'],
  ['2026-08-15', 60100, 'Freios',             'Peças',      520,  'Auto Center Silva'],
  ['2026-10-14', 62100, 'Alinhamento',        'Reparos',    90,   'Auto Center Silva'],
];

// [nome, tipo_servico, intervalo_km, intervalo_dias, ultimo_km, ultima_data]
const planos = [
  ['Troca de óleo',      'Troca de óleo', 10000, 365,  53540, '2025-12-17'],
  ['Filtro de ar',       'Filtro de ar',  15000, 730,  55300, '2026-02-10'],
  ['Pastilhas de freio', 'Freios',        20000, 1095, 60100, '2026-08-15'],
];

// [tipo, vencimento, status]
const documentos = [
  ['IPVA',          '2026-03-15',   'pago'],
  ['Licenciamento', dataEmDias(15), 'pendente'],
  ['Seguro',        '2027-08-20',   'pago'],
];

const recriar = db.transaction(() => {
  db.exec('DELETE FROM compartilhamentos; DELETE FROM documentos; DELETE FROM planos_revisao; DELETE FROM servicos; DELETE FROM veiculos;');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('documentos','planos_revisao','servicos','veiculos');");

  const { lastInsertRowid: veiculoId } = db
    .prepare('INSERT INTO veiculos (marca, modelo, ano, placa, km_atual) VALUES (@marca, @modelo, @ano, @placa, @km_atual)')
    .run(veiculo);

  const inserirServico = db.prepare(
    'INSERT INTO servicos (veiculo_id, data, km, tipo, categoria, valor, oficina) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  servicos.forEach((s) => inserirServico.run(veiculoId, ...s));

  const inserirPlano = db.prepare(
    'INSERT INTO planos_revisao (veiculo_id, nome, tipo_servico, intervalo_km, intervalo_dias, ultimo_km, ultima_data) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  planos.forEach((p) => inserirPlano.run(veiculoId, ...p));

  const inserirDocumento = db.prepare(
    'INSERT INTO documentos (veiculo_id, tipo, vencimento, status) VALUES (?, ?, ?, ?)'
  );
  documentos.forEach((d) => inserirDocumento.run(veiculoId, ...d));
});

recriar();

const contagem = (tabela) => db.prepare(`SELECT COUNT(*) AS n FROM ${tabela}`).get().n;
console.log('Banco populado com dados de exemplo:');
console.log(`  veículos: ${contagem('veiculos')}`);
console.log(`  serviços: ${contagem('servicos')}`);
console.log(`  planos de revisão: ${contagem('planos_revisao')}`);
console.log(`  documentos: ${contagem('documentos')}`);
