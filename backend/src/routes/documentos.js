// Documentos do veículo (tela T06): IPVA, licenciamento e seguro, com lembretes.
const express = require('express');
const db = require('../db/database');
const { ErroHttp } = require('../utils/erros');
const { TIPOS_DOCUMENTO } = require('../constants');
const { dataValida, idValido } = require('../utils/validacao');
const { buscarVeiculo } = require('../services/veiculos');
const { formatarDocumento } = require('../services/documentos');

const router = express.Router();

const STATUS = ['pendente', 'pago'];

// Converte true/false/1/0/"1"/"0" em 1 ou 0. Devolve null se for inválido.
function paraFlag(valor) {
  if (valor === true || valor === 1 || valor === '1' || valor === 'true') return 1;
  if (valor === false || valor === 0 || valor === '0' || valor === 'false') return 0;
  return null;
}

function buscarDocumento(idTexto) {
  const id = idValido(idTexto);
  const doc = id && db.prepare('SELECT * FROM documentos WHERE id = ?').get(id);
  if (!doc) throw new ErroHttp(404, 'Documento não encontrado.');
  return doc;
}

// Valida os campos informados. Em "parcial" (PATCH) só valida o que veio no corpo.
function validarDocumento(corpo = {}, parcial = false) {
  const campos = {};
  const dados = {};
  const veio = (c) => corpo[c] !== undefined;

  if (!parcial || veio('tipo')) {
    if (!TIPOS_DOCUMENTO.includes(corpo.tipo)) campos.tipo = `Tipo inválido. Use: ${TIPOS_DOCUMENTO.join(', ')}.`;
    else dados.tipo = corpo.tipo;
  }
  if (!parcial || veio('vencimento')) {
    if (!dataValida(corpo.vencimento)) campos.vencimento = 'Data inválida. Use o formato AAAA-MM-DD.';
    else dados.vencimento = corpo.vencimento;
  }
  if (veio('status')) {
    if (!STATUS.includes(corpo.status)) campos.status = `Status inválido. Use: ${STATUS.join(', ')}.`;
    else dados.status = corpo.status;
  }
  if (veio('lembrete_ativo')) {
    const flag = paraFlag(corpo.lembrete_ativo);
    if (flag === null) campos.lembrete_ativo = 'Use true ou false.';
    else dados.lembrete_ativo = flag;
  }

  if (Object.keys(campos).length) throw new ErroHttp(400, 'Dados do documento inválidos.', campos);
  return dados;
}

// Lista os documentos do veículo (os que vencem primeiro aparecem antes).
router.get('/veiculos/:veiculoId/documentos', (req, res) => {
  const veiculo = buscarVeiculo(req.params.veiculoId);
  const docs = db.prepare('SELECT * FROM documentos WHERE veiculo_id = ? ORDER BY vencimento, id').all(veiculo.id);
  res.json(docs.map((d) => formatarDocumento(d)));
});

// "Adicionar lembrete".
router.post('/veiculos/:veiculoId/documentos', (req, res) => {
  const veiculo = buscarVeiculo(req.params.veiculoId);
  const dados = validarDocumento(req.body);
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO documentos (veiculo_id, tipo, vencimento, status, lembrete_ativo)
       VALUES (@veiculo_id, @tipo, @vencimento, @status, @lembrete_ativo)`
    )
    .run({ status: 'pendente', lembrete_ativo: 1, ...dados, veiculo_id: veiculo.id });
  res.status(201).json(formatarDocumento(db.prepare('SELECT * FROM documentos WHERE id = ?').get(lastInsertRowid)));
});

// Altera vencimento, status (pendente/pago) ou liga/desliga o lembrete.
router.patch('/documentos/:id', (req, res) => {
  const doc = buscarDocumento(req.params.id);
  const dados = validarDocumento(req.body, true);
  const chaves = Object.keys(dados);
  if (chaves.length) {
    const sets = chaves.map((c) => `${c} = @${c}`).join(', ');
    db.prepare(`UPDATE documentos SET ${sets} WHERE id = @id`).run({ ...dados, id: doc.id });
  }
  res.json(formatarDocumento(db.prepare('SELECT * FROM documentos WHERE id = ?').get(doc.id)));
});

router.delete('/documentos/:id', (req, res) => {
  const doc = buscarDocumento(req.params.id);
  db.prepare('DELETE FROM documentos WHERE id = ?').run(doc.id);
  res.status(204).end();
});

module.exports = router;
