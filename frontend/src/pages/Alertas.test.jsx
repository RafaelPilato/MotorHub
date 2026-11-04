import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { abrir } from '../test/renderizar';
import { VEICULO, chamadas, respostaApi, simularApi } from '../test/api-falsa';

afterEach(() => vi.unstubAllGlobals());

const ALERTAS = [
  { id: 1, nome: 'Troca de óleo', tipo_servico: 'Troca de óleo', ultimo_km: 53540, ultima_data: '2025-12-17', km_restantes: 1200, dias_restantes: 44, progresso: 88, status: 'atencao', criterio: 'km' },
  { id: 2, nome: 'Filtro de ar', tipo_servico: 'Filtro de ar', ultimo_km: 55300, ultima_data: '2026-02-10', km_restantes: 7960, dias_restantes: 464, progresso: 47, status: 'ok', criterio: 'km' },
  { id: 3, nome: 'Pastilhas de freio', tipo_servico: 'Freios', ultimo_km: 60100, ultima_data: '2026-08-15', km_restantes: -100, dias_restantes: 900, progresso: 100, status: 'vencido', criterio: 'km' },
];

describe('T05 · Alertas de revisão', () => {
  it('lista os alertas com status, prazo e barra de progresso', async () => {
    simularApi({ '/api/veiculos': [VEICULO], '/api/veiculos/1/alertas': ALERTAS });
    abrir('/alertas');

    expect(await screen.findByText('Troca de óleo')).toBeInTheDocument();
    expect(screen.getByText('Faltam 1.200 km ou 44 dias')).toBeInTheDocument();
    expect(screen.getByText('Faltam 7.960 km ou 464 dias')).toBeInTheDocument();
    expect(screen.getByText('Passou 100 km do prazo')).toBeInTheDocument();
    expect(screen.getByText('Atenção')).toBeInTheDocument();
    expect(screen.getByText('Em dia')).toBeInTheDocument();
    expect(screen.getByText('Vencido')).toBeInTheDocument();
    expect(screen.getByText(/Última vez: 17\/12\/2025 · 53\.540 km/)).toBeInTheDocument();

    const barras = screen.getAllByRole('progressbar');
    expect(barras).toHaveLength(3);
    expect(barras[0]).toHaveAttribute('aria-valuenow', '88');
  });

  it('"Marcar como feito" registra o serviço e recarrega os alertas', async () => {
    let feito = false;
    const fetchFalso = simularApi({
      '/api/veiculos': [VEICULO],
      '/api/veiculos/1/alertas': () =>
        feito ? ALERTAS.map((a) => (a.id === 1 ? { ...a, progresso: 0, status: 'ok', km_restantes: 10000, dias_restantes: 365 } : a)) : ALERTAS,
      'POST /api/veiculos/1/alertas/1/concluir': () => {
        feito = true;
        return respostaApi(201, { servico: { id: 50 }, alerta: {} });
      },
    });
    abrir('/alertas');

    const cartao = (await screen.findByText('Troca de óleo')).closest('li');
    await userEvent.click(within(cartao).getByRole('button', { name: 'Marcar como feito' }));
    await userEvent.type(within(cartao).getByLabelText('Valor pago (opcional)'), '230,00');
    await userEvent.click(within(cartao).getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByText('Faltam 10.000 km ou 365 dias')).toBeInTheDocument();
    const [[, requisicao]] = chamadas(fetchFalso, 'POST', '/api/veiculos/1/alertas/1/concluir');
    expect(JSON.parse(requisicao.body)).toEqual({ valor: '230,00' });
  });

  it('permite cancelar sem registrar nada', async () => {
    const fetchFalso = simularApi({ '/api/veiculos': [VEICULO], '/api/veiculos/1/alertas': ALERTAS });
    abrir('/alertas');

    const cartao = (await screen.findByText('Troca de óleo')).closest('li');
    await userEvent.click(within(cartao).getByRole('button', { name: 'Marcar como feito' }));
    await userEvent.click(within(cartao).getByRole('button', { name: 'Cancelar' }));

    expect(within(cartao).getByRole('button', { name: 'Marcar como feito' })).toBeInTheDocument();
    expect(chamadas(fetchFalso, 'POST', '/api/veiculos/1/alertas/1/concluir')).toHaveLength(0);
  });
});
