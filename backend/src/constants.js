// Categorias do painel de gastos (T04) e opções da tela de registro (T03).
const { normalizarTexto } = require('./utils/validacao');

const CATEGORIAS = ['Revisão', 'Peças', 'Reparos', 'Documentos', 'Outros'];

// Chips exibidos na tela "Novo serviço".
const TIPOS_SUGERIDOS = ['Troca de óleo', 'Pneus', 'Freios', 'Revisão', 'Outro'];

// Palavras-chave que indicam a categoria quando o usuário não escolhe uma.
// A ordem importa: a primeira categoria que combinar vence.
const PALAVRAS_POR_CATEGORIA = [
  ['Documentos', ['ipva', 'licenciamento', 'seguro', 'vistoria', 'multa', 'taxa', 'documento']],
  ['Revisão', ['oleo', 'revisao', 'filtro', 'fluido']],
  ['Peças', ['pneu', 'freio', 'pastilha', 'bateria', 'peca', 'lampada', 'correia']],
  ['Reparos', ['reparo', 'conserto', 'suspensao', 'alinhamento', 'balanceamento', 'mecanic', 'eletric']],
];

function inferirCategoria(tipo) {
  const texto = normalizarTexto(tipo);
  for (const [categoria, palavras] of PALAVRAS_POR_CATEGORIA) {
    if (palavras.some((p) => texto.includes(p))) return categoria;
  }
  return 'Outros';
}

// Alertas de revisão criados automaticamente quando um veículo é cadastrado (T05).
const PLANOS_PADRAO = [
  { nome: 'Troca de óleo', tipo_servico: 'Troca de óleo', intervalo_km: 10000, intervalo_dias: 365 },
  { nome: 'Filtro de ar', tipo_servico: 'Filtro de ar', intervalo_km: 15000, intervalo_dias: 730 },
  { nome: 'Pastilhas de freio', tipo_servico: 'Freios', intervalo_km: 20000, intervalo_dias: 1095 },
];

const TIPOS_DOCUMENTO = ['IPVA', 'Licenciamento', 'Seguro'];

module.exports = { CATEGORIAS, TIPOS_SUGERIDOS, PLANOS_PADRAO, TIPOS_DOCUMENTO, inferirCategoria };
