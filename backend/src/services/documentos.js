// Situação dos documentos do veículo (T06): IPVA, licenciamento e seguro.
const { diasEntre, hoje } = require('../utils/validacao');

// Devolve o documento com os dias restantes e a situação calculada:
//   pago      -> já quitado
//   atrasado  -> pendente e vencido
//   atencao   -> pendente e vence em até 30 dias
//   em_dia    -> pendente e vence depois de 30 dias
function formatarDocumento(doc, dataHoje = hoje()) {
  const diasRestantes = diasEntre(dataHoje, doc.vencimento);
  let situacao = 'em_dia';
  if (doc.status === 'pago') situacao = 'pago';
  else if (diasRestantes < 0) situacao = 'atrasado';
  else if (diasRestantes <= 30) situacao = 'atencao';

  return {
    id: doc.id,
    veiculo_id: doc.veiculo_id,
    tipo: doc.tipo,
    vencimento: doc.vencimento,
    status: doc.status,
    lembrete_ativo: doc.lembrete_ativo === 1,
    dias_restantes: diasRestantes,
    situacao,
  };
}

module.exports = { formatarDocumento };
