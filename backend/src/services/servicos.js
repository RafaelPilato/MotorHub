// Regras de serviço compartilhadas entre as rotas (registro, "marcar como feito", exclusão).
const db = require('../db/database');
const { ErroHttp } = require('../utils/erros');
const { CATEGORIAS, inferirCategoria } = require('../constants');
const { paraInteiro, paraValor, dataValida, hoje, normalizarTexto } = require('../utils/validacao');

// Formato devolvido pela API: troca o nome do arquivo pela URL da foto.
function formatarServico(linha) {
  const { foto_nota: foto, ...resto } = linha;
  return { ...resto, foto_url: foto ? `/uploads/${foto}` : null };
}

function validarServico(corpo = {}) {
  const campos = {};
  const data = corpo.data || hoje();
  const km = paraInteiro(corpo.km);
  const tipo = String(corpo.tipo || '').trim();
  const valor = paraValor(corpo.valor);
  const oficina = String(corpo.oficina || '').trim() || null;
  const categoria = corpo.categoria ? String(corpo.categoria).trim() : inferirCategoria(tipo);

  if (!dataValida(data)) campos.data = 'Data inválida. Use o formato AAAA-MM-DD.';
  else if (data > hoje()) campos.data = 'A data do serviço não pode ser no futuro.';
  if (km === null || km < 0) campos.km = 'Informe a quilometragem (0 ou mais).';
  if (!tipo) campos.tipo = 'Informe o tipo de serviço.';
  if (valor === null || valor < 0) campos.valor = 'Informe o valor (0 ou mais).';
  if (!CATEGORIAS.includes(categoria)) campos.categoria = `Categoria inválida. Use: ${CATEGORIAS.join(', ')}.`;

  if (Object.keys(campos).length) throw new ErroHttp(400, 'Dados do serviço inválidos.', campos);
  return { data, km, tipo, categoria, valor, oficina };
}

// Atualiza o "último serviço" de cada plano de revisão do veículo (base dos alertas, T05).
function recalcularPlanos(veiculoId) {
  const planos = db.prepare('SELECT * FROM planos_revisao WHERE veiculo_id = ?').all(veiculoId);
  const servicos = db
    .prepare('SELECT tipo, data, km FROM servicos WHERE veiculo_id = ? ORDER BY data DESC, km DESC')
    .all(veiculoId);
  const atualizar = db.prepare('UPDATE planos_revisao SET ultimo_km = ?, ultima_data = ? WHERE id = ?');

  for (const plano of planos) {
    const alvo = normalizarTexto(plano.tipo_servico);
    const ultimo = servicos.find((s) => normalizarTexto(s.tipo) === alvo);
    if (ultimo) atualizar.run(ultimo.km, ultimo.data, plano.id);
  }
}

// Grava o serviço e aplica a regra RN02: o km do carro só sobe e os alertas são recalculados.
// Devolve o serviço gravado (já formatado).
function criarServico(veiculo, dados, nomeFoto = null) {
  const registrar = db.transaction(() => {
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO servicos (veiculo_id, data, km, tipo, categoria, valor, oficina, foto_nota)
         VALUES (@veiculo_id, @data, @km, @tipo, @categoria, @valor, @oficina, @foto_nota)`
      )
      .run({ ...dados, veiculo_id: veiculo.id, foto_nota: nomeFoto });

    if (dados.km > veiculo.km_atual) {
      db.prepare('UPDATE veiculos SET km_atual = ? WHERE id = ?').run(dados.km, veiculo.id);
    }
    recalcularPlanos(veiculo.id);
    return lastInsertRowid;
  });

  const id = registrar();
  return formatarServico(db.prepare('SELECT * FROM servicos WHERE id = ?').get(id));
}

module.exports = { formatarServico, validarServico, recalcularPlanos, criarServico };
