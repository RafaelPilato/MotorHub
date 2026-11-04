// Funções de formatação usadas nas telas (valores, datas e textos de prazo).

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// 3250 -> "R$ 3.250,00"
export function moeda(valor) {
  return formatoMoeda.format(Number(valor) || 0);
}

// 62340 -> "62.340 km"
export function km(valor) {
  return `${Number(valor || 0).toLocaleString('pt-BR')} km`;
}

// "2026-10-14" -> "14/10/2026" (sem usar Date, para não sofrer com fuso horário)
export function data(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function plural(n, singular, pluralTexto) {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

export const ROTULO_STATUS = {
  ok: 'Em dia',
  em_breve: 'Em breve',
  atencao: 'Atenção',
  vencido: 'Vencido',
};

// Texto de prazo de um item de "Próximos vencimentos" (revisão ou documento).
export function textoVencimento(item) {
  if (item.origem === 'documento') {
    const d = item.dias_restantes;
    if (d === 0) return 'Vence hoje';
    if (d > 0) return `Vence em ${plural(d, 'dia', 'dias')}`;
    return `Venceu há ${plural(Math.abs(d), 'dia', 'dias')}`;
  }

  if (item.status === 'vencido') {
    if (item.km_restantes <= 0) return `Passou ${km(Math.abs(item.km_restantes))} do prazo`;
    if (item.dias_restantes === 0) return 'Vence hoje';
    return `Prazo vencido há ${plural(Math.abs(item.dias_restantes), 'dia', 'dias')}`;
  }
  return `Faltam ${km(item.km_restantes)} ou ${plural(item.dias_restantes, 'dia', 'dias')}`;
}
