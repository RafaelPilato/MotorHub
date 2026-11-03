// Busca de veículo reutilizada pelas rotas (devolve erro 404 se não existir).
const db = require('../db/database');
const { ErroHttp } = require('../utils/erros');
const { idValido } = require('../utils/validacao');

function buscarVeiculo(idTexto) {
  const id = idValido(idTexto);
  const veiculo = id && db.prepare('SELECT * FROM veiculos WHERE id = ?').get(id);
  if (!veiculo) throw new ErroHttp(404, 'Veículo não encontrado.');
  return veiculo;
}

module.exports = { buscarVeiculo };
