import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { abrir } from '../test/renderizar';
import { VEICULO, chamadas, respostaApi, simularApi } from '../test/api-falsa';

afterEach(() => vi.unstubAllGlobals());

const HISTORICO = {
  veiculo: VEICULO,
  resumo: { total_servicos: 2, total_investido: 610, primeiro_registro: '2026-08-15', ultimo_servico: '2026-10-14', servicos_com_nota: 1 },
  linha_do_tempo: [
    { id: 13, data: '2026-10-14', km: 62100, tipo: 'Alinhamento', valor: 90, oficina: 'Auto Center Silva', foto_url: null },
    { id: 12, data: '2026-08-15', km: 60100, tipo: 'Freios', valor: 520, oficina: null, foto_url: '/uploads/nota.jpg' },
  ],
};

describe('T07 · Histórico do veículo', () => {
  it('mostra o resumo, a linha do tempo e o botão de gerar PDF', async () => {
    simularApi({ '/api/veiculos': [VEICULO], '/api/veiculos/1/historico': HISTORICO });
    abrir('/historico');

    expect(await screen.findByText('Chevrolet Onix 2018')).toBeInTheDocument();
    expect(screen.getByText('R$ 610,00')).toBeInTheDocument();
    expect(screen.getByText('Alinhamento')).toBeInTheDocument();
    expect(screen.getByText(/14\/10\/2026 · 62\.100 km · Auto Center Silva/)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Gerar PDF' })).toHaveAttribute('href', '/api/veiculos/1/relatorio/pdf');
    expect(screen.getByRole('link', { name: 'Ver nota fiscal' })).toHaveAttribute('href', '/uploads/nota.jpg');
  });

  it('gera o link público para compartilhar e permite copiar', async () => {
    const copiar = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText: copiar } });
    simularApi({
      '/api/veiculos': [VEICULO],
      '/api/veiculos/1/historico': HISTORICO,
      'POST /api/veiculos/1/relatorio/compartilhar': respostaApi(201, { token: 'abc123', caminho: '/relatorio/abc123' }),
    });
    abrir('/historico');

    await userEvent.click(await screen.findByRole('button', { name: 'Compartilhar link' }));
    const campo = await screen.findByLabelText('Link do relatório');
    expect(campo.value).toMatch(/\/relatorio\/abc123$/);

    await userEvent.click(screen.getByRole('button', { name: 'Copiar link' }));
    expect(copiar).toHaveBeenCalledWith(campo.value);
    expect(await screen.findByText('Link copiado!')).toBeInTheDocument();
  });

  it('exclui um serviço depois de confirmar e recarrega a lista', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    const fetchFalso = simularApi({
      '/api/veiculos': [VEICULO],
      '/api/veiculos/1/historico': HISTORICO,
      'DELETE /api/servicos/13': respostaApi(204, null),
    });
    abrir('/historico');

    const botoes = await screen.findAllByRole('button', { name: 'Excluir' });
    await userEvent.click(botoes[0]);

    expect(chamadas(fetchFalso, 'DELETE', '/api/servicos/13')).toHaveLength(1);
    expect(chamadas(fetchFalso, 'GET', '/api/veiculos/1/historico').length).toBeGreaterThanOrEqual(2);
  });

  it('não exclui se o usuário cancelar a confirmação', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    const fetchFalso = simularApi({ '/api/veiculos': [VEICULO], '/api/veiculos/1/historico': HISTORICO });
    abrir('/historico');

    await userEvent.click((await screen.findAllByRole('button', { name: 'Excluir' }))[0]);
    expect(chamadas(fetchFalso, 'DELETE', '/api/servicos/13')).toHaveLength(0);
  });

  it('mostra mensagem quando ainda não há serviços', async () => {
    simularApi({
      '/api/veiculos': [VEICULO],
      '/api/veiculos/1/historico': { ...HISTORICO, resumo: { ...HISTORICO.resumo, total_servicos: 0, total_investido: 0 }, linha_do_tempo: [] },
    });
    abrir('/historico');

    expect(await screen.findByText('Nenhum serviço registrado ainda.')).toBeInTheDocument();
  });
});
