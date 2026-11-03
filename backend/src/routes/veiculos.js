// Veículo (tela T01 – Cadastro do veículo).
const express = require('express');
const db = require('../db/database');
const { ErroHttp } = require('../utils/erros');
const { paraInteiro, normalizarPlaca, hoje } = require('../utils/validacao');
const { PLANOS_PADRAO } = require('../constants');
const { buscarVeiculo } = require('../services/veiculos');

const router = express.Router();

// Valida o corpo da requisição e devolve os dados limpos.
function validarVeiculo(corpo = {}) {
  const campos = {};
  const marca = String(corpo.marca || '').trim();
  const modelo = String(corpo.modelo || '').trim();
  const ano = paraInteiro(corpo.ano);
  const placa = normalizarPlaca(corpo.placa);
  const kmAtual = paraInteiro(corpo.km_atual);
  const anoMaximo = new Date().getFullYear() + 1;

  if (!marca) campos.marca = 'Informe a marca.';
  if (!modelo) campos.modelo = 'Informe o modelo.';
  if (ano === null || ano < 1950 || ano > anoMaximo) campos.ano = `Informe um ano entre 1950 e ${anoMaximo}.`;
  if (!placa) campos.placa = 'Placa inválida. Use o formato ABC-1234 ou ABC-1D23.';
  if (kmAtual === null || kmAtual < 0) campos.km_atual = 'Informe a quilometragem atual (0 ou mais).';

  if (Object.keys(campos).length) {
    throw new ErroHttp(400, 'Dados do veículo inválidos.', campos);
  }
  return { marca, modelo, ano, placa, km_atual: kmAtual };
}

// Placa repetida vira erro 409 em vez de erro interno.
function tratarPlacaDuplicada(err) {
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return new ErroHttp(409, 'Já existe um veículo com essa placa.', { placa: 'Placa já cadastrada.' });
  }
  return err;
}

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM veiculos ORDER BY id').all());
});

router.get('/:id', (req, res) => {
  res.json(buscarVeiculo(req.params.id));
});

router.post('/', (req, res, next) => {
  try {
    const dados = validarVeiculo(req.body);

    const cadastrar = db.transaction(() => {
      const { lastInsertRowid } = db
        .prepare('INSERT INTO veiculos (marca, modelo, ano, placa, km_atual) VALUES (@marca, @modelo, @ano, @placa, @km_atual)')
        .run(dados);

      // Cria os alertas de revisão padrão (T05), contando a partir de hoje.
      const inserirPlano = db.prepare(
        `INSERT INTO planos_revisao (veiculo_id, nome, tipo_servico, intervalo_km, intervalo_dias, ultimo_km, ultima_data)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      PLANOS_PADRAO.forEach((p) =>
        inserirPlano.run(lastInsertRowid, p.nome, p.tipo_servico, p.intervalo_km, p.intervalo_dias, dados.km_atual, hoje())
      );
      return lastInsertRowid;
    });

    const id = cadastrar();
    res.status(201).json(db.prepare('SELECT * FROM veiculos WHERE id = ?').get(id));
  } catch (err) {
    next(tratarPlacaDuplicada(err));
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const atual = buscarVeiculo(req.params.id);
    const dados = validarVeiculo(req.body);
    db.prepare(
      'UPDATE veiculos SET marca = @marca, modelo = @modelo, ano = @ano, placa = @placa, km_atual = @km_atual WHERE id = @id'
    ).run({ ...dados, id: atual.id });
    res.json(db.prepare('SELECT * FROM veiculos WHERE id = ?').get(atual.id));
  } catch (err) {
    next(tratarPlacaDuplicada(err));
  }
});

module.exports = router;
