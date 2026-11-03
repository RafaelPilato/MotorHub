// Cálculo dos alertas de revisão (T05). Dispara pelo que vier primeiro: km ou data (RN01).
const { somarDias, diasEntre, hoje } = require('../utils/validacao');

// Percentual do intervalo já consumido a partir do qual o alerta muda de status.
const LIMITE_ATENCAO = 0.85; // vermelho
const LIMITE_EM_BREVE = 0.6; // amarelo

function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

// Recebe um plano de revisão e o veículo e devolve o alerta calculado.
function calcularAlerta(plano, veiculo, dataHoje = hoje()) {
  const proximoKm = plano.ultimo_km + plano.intervalo_km;
  const proximaData = somarDias(plano.ultima_data, plano.intervalo_dias);
  const kmRestantes = proximoKm - veiculo.km_atual;
  const diasRestantes = diasEntre(dataHoje, proximaData);

  const usadoKm = (veiculo.km_atual - plano.ultimo_km) / plano.intervalo_km;
  const usadoDias = diasEntre(plano.ultima_data, dataHoje) / plano.intervalo_dias;
  const consumido = Math.max(usadoKm, usadoDias);

  let status = 'ok';
  if (kmRestantes <= 0 || diasRestantes <= 0) status = 'vencido';
  else if (consumido >= LIMITE_ATENCAO) status = 'atencao';
  else if (consumido >= LIMITE_EM_BREVE) status = 'em_breve';

  return {
    id: plano.id,
    nome: plano.nome,
    tipo_servico: plano.tipo_servico,
    intervalo_km: plano.intervalo_km,
    intervalo_dias: plano.intervalo_dias,
    ultimo_km: plano.ultimo_km,
    ultima_data: plano.ultima_data,
    proximo_km: proximoKm,
    proxima_data: proximaData,
    km_restantes: kmRestantes,
    dias_restantes: diasRestantes,
    progresso: Math.round(limitar(consumido, 0, 1) * 100),
    criterio: usadoKm >= usadoDias ? 'km' : 'data', // o que está mais perto de vencer
    status,
  };
}

module.exports = { calcularAlerta };
