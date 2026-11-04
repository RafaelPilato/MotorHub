import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { abrir } from '../test/renderizar';
import { VEICULO, respostaApi, simularApi } from '../test/api-falsa';

afterEach(() => vi.unstubAllGlobals());

describe('Relatório público (link compartilhado)', () => {
  it('mostra o histórico em modo leitura, sem navegação do app, e o botão de baixar PDF', async () => {
    simularApi({
      '/api/veiculos': [VEICULO],
      '/api/relatorio/abc123': {
        veiculo: VEICULO,
        resumo: { total_servicos: 1, total_investido: 90, primeiro_registro: '2026-10-14', ultimo_servico: '2026-10-14', servicos_com_nota: 0 },
        linha_do_tempo: [{ id: 1, data: '2026-10-14', km: 62100, tipo: 'Alinhamento', valor: 90, oficina: null, foto_url: null }],
        gerado_em: '2026-11-03 20:00:00',
      },
    });
    abrir('/relatorio/abc123');

    expect(await screen.findByText('Chevrolet Onix 2018')).toBeInTheDocument();
    expect(screen.getByText('Alinhamento')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Baixar PDF' })).toHaveAttribute('href', '/api/relatorio/abc123/pdf');
    expect(screen.getByText(/gerado pelo motorhub em 03\/11\/2026/i)).toBeInTheDocument();

    expect(screen.queryByRole('navigation', { name: 'Navegação principal' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument(); // só leitura
  });

  it('avisa quando o link não existe', async () => {
    simularApi({
      '/api/veiculos': [VEICULO],
      '/api/relatorio/invalido': respostaApi(404, { erro: 'Relatório não encontrado.' }),
    });
    abrir('/relatorio/invalido');

    expect(await screen.findByText('Relatório não encontrado.')).toBeInTheDocument();
  });
});
