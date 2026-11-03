import { vi } from 'vitest';

// Substitui o fetch por respostas prontas, para testar as telas sem precisar do back-end.
// Uso: simularApi({ '/api/veiculos': [ ... ] })
export function simularApi(rotas) {
  const fetchFalso = vi.fn(async (url) => {
    if (!(url in rotas)) {
      return { ok: false, status: 404, json: async () => ({ erro: 'Rota não encontrada' }) };
    }
    return { ok: true, status: 200, json: async () => rotas[url] };
  });
  vi.stubGlobal('fetch', fetchFalso);
  return fetchFalso;
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
