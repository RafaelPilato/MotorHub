import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { abrir } from '../test/renderizar';
import { VEICULO, chamadas, respostaApi, simularApi } from '../test/api-falsa';

afterEach(() => vi.unstubAllGlobals());

const DOCS = [
  { id: 1, tipo: 'IPVA', vencimento: '2026-03-15', status: 'pago', lembrete_ativo: true, dias_restantes: -233, situacao: 'pago' },
  { id: 2, tipo: 'Licenciamento', vencimento: '2026-11-18', status: 'pendente', lembrete_ativo: true, dias_restantes: 15, situacao: 'atencao' },
  { id: 3, tipo: 'Seguro', vencimento: '2027-08-20', status: 'pendente', lembrete_ativo: false, dias_restantes: 290, situacao: 'em_dia' },
];

const cartaoDe = async (tipo) => (await screen.findByRole('heading', { name: tipo })).closest('li');

describe('T06 · Documentos', () => {
  it('mostra cada documento com vencimento, prazo e situação', async () => {
    simularApi({ '/api/veiculos': [VEICULO], '/api/veiculos/1/documentos': DOCS });
    abrir('/documentos');

    const ipva = within(await cartaoDe('IPVA'));
    expect(ipva.getByText('Pago')).toBeInTheDocument();
    expect(ipva.getByText('Vencimento: 15/03/2026')).toBeInTheDocument();

    const licenciamento = within(await cartaoDe('Licenciamento'));
    expect(licenciamento.getByText('Atenção')).toBeInTheDocument();
    expect(licenciamento.getByText(/Vence em 15 dias/)).toBeInTheDocument();

    expect(within(await cartaoDe('Seguro')).getByText('Em dia')).toBeInTheDocument();
    expect(within(await cartaoDe('Seguro')).getByRole('switch')).not.toBeChecked();
  });

  it('liga e desliga o lembrete, e marca como pago', async () => {
    const fetchFalso = simularApi({
      '/api/veiculos': [VEICULO],
      '/api/veiculos/1/documentos': DOCS,
      'PATCH /api/documentos/2': { ...DOCS[1] },
    });
    abrir('/documentos');

    const licenciamento = within(await cartaoDe('Licenciamento'));
    await userEvent.click(licenciamento.getByRole('switch'));
    await userEvent.click(licenciamento.getByRole('button', { name: 'Marcar como pago' }));

    const corpos = chamadas(fetchFalso, 'PATCH', '/api/documentos/2').map(([, init]) => JSON.parse(init.body));
    expect(corpos).toEqual([{ lembrete_ativo: false }, { status: 'pago' }]);
  });

  it('exclui o lembrete depois de confirmar', async () => {
    vi.stubGlobal('confirm', vi.fn(() => true));
    const fetchFalso = simularApi({
      '/api/veiculos': [VEICULO],
      '/api/veiculos/1/documentos': DOCS,
      'DELETE /api/documentos/3': respostaApi(204, null),
    });
    abrir('/documentos');

    await userEvent.click(within(await cartaoDe('Seguro')).getByRole('button', { name: 'Excluir' }));
    expect(chamadas(fetchFalso, 'DELETE', '/api/documentos/3')).toHaveLength(1);
  });

  it('adiciona um novo lembrete', async () => {
    const fetchFalso = simularApi({
      '/api/veiculos': [VEICULO],
      '/api/veiculos/1/documentos': DOCS,
      'POST /api/veiculos/1/documentos': respostaApi(201, { id: 9 }),
    });
    abrir('/documentos');

    await userEvent.click(await screen.findByRole('button', { name: 'Adicionar lembrete' }));
    await userEvent.selectOptions(screen.getByLabelText('Documento'), 'Seguro');
    await userEvent.type(screen.getByLabelText('Vencimento'), '2027-01-20');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar lembrete' }));

    const [[, requisicao]] = chamadas(fetchFalso, 'POST', '/api/veiculos/1/documentos');
    expect(JSON.parse(requisicao.body)).toEqual({ tipo: 'Seguro', vencimento: '2027-01-20' });
  });

  it('mostra o erro da API ao adicionar com dados inválidos', async () => {
    simularApi({
      '/api/veiculos': [VEICULO],
      '/api/veiculos/1/documentos': [],
      'POST /api/veiculos/1/documentos': respostaApi(400, { erro: 'Dados do documento inválidos.', campos: { vencimento: 'Data inválida. Use o formato AAAA-MM-DD.' } }),
    });
    abrir('/documentos');

    expect(await screen.findByText(/nenhum lembrete cadastrado/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar lembrete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Salvar lembrete' }));
    expect(await screen.findByText(/data inválida/i)).toBeInTheDocument();
  });
});
