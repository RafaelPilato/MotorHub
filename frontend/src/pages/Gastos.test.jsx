import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { abrir } from '../test/renderizar';
import { VEICULO, chamadas, simularApi } from '../test/api-falsa';
import { nomeMes } from '../utils/formatar';

afterEach(() => vi.unstubAllGlobals());

const hoje = new Date();
const ANO = hoje.getFullYear();
const MES = hoje.getMonth() + 1;

const porMes = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, total: i === 7 ? 1420 : 0 }));
const porCategoria = [
  { categoria: 'Revisão', total: 1200, percentual: 36.9 },
  { categoria: 'Peças', total: 900, percentual: 27.7 },
  { categoria: 'Reparos', total: 650, percentual: 20 },
  { categoria: 'Documentos', total: 400, percentual: 12.3 },
  { categoria: 'Outros', total: 100, percentual: 3.1 },
];

const anual = {
  periodo: 'anual', ano: ANO, mes: null, total: 3250, quantidade_servicos: 10,
  total_anterior: 2900, variacao_percentual: 12.1,
  por_categoria: porCategoria, por_mes: porMes, anos_disponiveis: [ANO, ANO - 1],
};

describe('T04 · Painel de gastos', () => {
  it('mostra o total do ano, o comparativo, o gráfico e as categorias', async () => {
    simularApi({ '/api/veiculos': [VEICULO], [`/api/veiculos/1/gastos?ano=${ANO}`]: anual });
    abrir('/gastos');

    expect(await screen.findByText(`Total em ${ANO}`)).toBeInTheDocument();
    expect(screen.getByText('R$ 3.250,00')).toBeInTheDocument();
    expect(screen.getByText(/12,1% a mais que o ano anterior/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: `Gráfico de gastos por mês em ${ANO}` })).toBeInTheDocument();

    const categorias = within(screen.getByRole('region', { name: 'Gastos por categoria' }));
    expect(categorias.getByText('Revisão')).toBeInTheDocument();
    expect(categorias.getByText('R$ 1.200,00')).toBeInTheDocument();
    expect(categorias.getByText('36,9% do total')).toBeInTheDocument();
  });

  it('alterna para a visão mensal e busca o mês escolhido', async () => {
    const mensal = { ...anual, periodo: 'mensal', mes: MES, total: 90, quantidade_servicos: 1, total_anterior: 0, variacao_percentual: null };
    const fetchFalso = simularApi({
      '/api/veiculos': [VEICULO],
      [`/api/veiculos/1/gastos?ano=${ANO}`]: anual,
      [`/api/veiculos/1/gastos?ano=${ANO}&mes=${MES}`]: mensal,
    });
    abrir('/gastos');
    await screen.findByText(`Total em ${ANO}`);

    await userEvent.click(screen.getByRole('button', { name: 'Mensal' }));

    expect(await screen.findByText(`Total em ${nomeMes(MES)} de ${ANO}`)).toBeInTheDocument();
    expect(screen.getByText('R$ 90,00')).toBeInTheDocument();
    expect(screen.getByLabelText('Mês')).toBeInTheDocument();
    expect(chamadas(fetchFalso, 'GET', `/api/veiculos/1/gastos?ano=${ANO}&mes=${MES}`)).toHaveLength(1);
  });

  it('avisa quando não há gastos no período', async () => {
    simularApi({
      '/api/veiculos': [VEICULO],
      [`/api/veiculos/1/gastos?ano=${ANO}`]: { ...anual, total: 0, quantidade_servicos: 0, variacao_percentual: null, por_mes: porMes.map((m) => ({ ...m, total: 0 })) },
    });
    abrir('/gastos');

    expect(await screen.findByText('Nenhum gasto registrado neste período.')).toBeInTheDocument();
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
  });

  it('troca o ano e busca os dados do ano escolhido', async () => {
    const fetchFalso = simularApi({
      '/api/veiculos': [VEICULO],
      [`/api/veiculos/1/gastos?ano=${ANO}`]: anual,
      [`/api/veiculos/1/gastos?ano=${ANO - 1}`]: { ...anual, ano: ANO - 1, total: 2900, variacao_percentual: null },
    });
    abrir('/gastos');
    await screen.findByText(`Total em ${ANO}`);

    await userEvent.selectOptions(screen.getByLabelText('Ano'), String(ANO - 1));
    expect(await screen.findByText(`Total em ${ANO - 1}`)).toBeInTheDocument();
    expect(screen.getByText('R$ 2.900,00')).toBeInTheDocument();
    expect(chamadas(fetchFalso, 'GET', `/api/veiculos/1/gastos?ano=${ANO - 1}`)).toHaveLength(1);
  });
});
