import { vi } from 'vitest';

// Resposta com código HTTP específico (ex.: 201 ou 400) dentro de uma rota simulada.
export const respostaApi = (status, corpo) => ({ __resposta: true, status, corpo });

function montarResposta(status, corpo) {
  return { ok: status < 400, status, json: async () => corpo };
}

// Substitui o fetch por respostas prontas, para testar as telas sem precisar do back-end.
//   simularApi({
//     '/api/veiculos': [ ... ],                       // qualquer método, responde 200
//     'POST /api/veiculos': (init) => respostaApi(201, {...}),  // função recebe a requisição
//   })
// Devolve o mock do fetch, para conferir as chamadas feitas.
export function simularApi(rotas) {
  const fetchFalso = vi.fn(async (url, init = {}) => {
    const metodo = (init.method || 'GET').toUpperCase();
    const chave = `${metodo} ${url}`;
    const rota = chave in rotas ? rotas[chave] : rotas[url];
    if (rota === undefined) return montarResposta(404, { erro: 'Rota não encontrada' });

    const resultado = typeof rota === 'function' ? await rota(init) : rota;
    if (resultado?.__resposta) return montarResposta(resultado.status, resultado.corpo);
    return montarResposta(200, resultado);
  });
  vi.stubGlobal('fetch', fetchFalso);
  return fetchFalso;
}

// Chamadas feitas ao fetch para um método e uma URL.
export function chamadas(fetchFalso, metodo, url) {
  return fetchFalso.mock.calls.filter(([u, init]) => u === url && (init?.method || 'GET').toUpperCase() === metodo);
}

export const VEICULO = {
  id: 1,
  marca: 'Chevrolet',
  modelo: 'Onix',
  ano: 2018,
  placa: 'ABC-1D23',
  km_atual: 62340,
};

export const RESUMO = {
  veiculo: VEICULO,
  gasto_mes: 480,
  proximos_vencimentos: [
    { origem: 'revisao', id: 1, titulo: 'Troca de óleo', status: 'atencao', km_restantes: 1200, dias_restantes: 44, criterio: 'km' },
    { origem: 'documento', id: 2, titulo: 'Licenciamento', status: 'atencao', vencimento: '2026-11-18', dias_restantes: 15 },
  ],
  ultimos_servicos: [
    { id: 13, data: '2026-10-14', tipo: 'Alinhamento', valor: 90 },
    { id: 12, data: '2026-08-15', tipo: 'Freios', valor: 520 },
  ],
};

export const OPCOES = {
  categorias: ['Revisão', 'Peças', 'Reparos', 'Documentos', 'Outros'],
  tipos_sugeridos: ['Troca de óleo', 'Pneus', 'Freios', 'Revisão', 'Outro'],
};
