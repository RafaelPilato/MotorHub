import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { abrir } from '../test/renderizar';
import { RESUMO, VEICULO, chamadas, respostaApi, simularApi } from '../test/api-falsa';

afterEach(() => vi.unstubAllGlobals());

describe('T01 · Cadastro do veículo', () => {
  it('cadastra o carro e volta para o Início já com os dados', async () => {
    let cadastrado = false;
    const fetchFalso = simularApi({
      '/api/veiculos': () => (cadastrado ? [VEICULO] : []),
      'POST /api/veiculos': () => {
        cadastrado = true;
        return respostaApi(201, VEICULO);
      },
      '/api/veiculos/1/resumo': RESUMO,
    });
    abrir('/cadastro');

    expect(await screen.findByRole('heading', { name: 'Cadastre seu carro' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Marca'), 'Chevrolet');
    await userEvent.type(screen.getByLabelText('Modelo'), 'Onix');
    await userEvent.type(screen.getByLabelText('Ano'), '2018');
    await userEvent.type(screen.getByLabelText('Placa'), 'abc-1d23');
    await userEvent.type(screen.getByLabelText('Km atual'), '62340');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar veículo' }));

    // volta para o Início, que mostra o carro cadastrado
    expect(await screen.findByText('Chevrolet Onix 2018')).toBeInTheDocument();

    const [[, requisicao]] = chamadas(fetchFalso, 'POST', '/api/veiculos');
    expect(JSON.parse(requisicao.body)).toEqual({
      marca: 'Chevrolet', modelo: 'Onix', ano: '2018', placa: 'ABC-1D23', km_atual: '62340',
    });
  });

  it('mostra o erro de cada campo devolvido pela API', async () => {
    simularApi({
      '/api/veiculos': [],
      'POST /api/veiculos': respostaApi(400, {
        erro: 'Dados do veículo inválidos.',
        campos: { placa: 'Placa inválida. Use o formato ABC-1234 ou ABC-1D23.', km_atual: 'Informe a quilometragem (0 ou mais).' },
      }),
    });
    abrir('/cadastro');

    await userEvent.type(await screen.findByLabelText('Placa'), '123');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar veículo' }));

    expect(await screen.findByText(/placa inválida/i)).toBeInTheDocument();
    expect(screen.getByText(/informe a quilometragem/i)).toBeInTheDocument();
    expect(screen.getByText('Confira os campos destacados.')).toBeInTheDocument();
  });

  it('com carro já cadastrado, a mesma tela edita e salva com PUT', async () => {
    const fetchFalso = simularApi({
      '/api/veiculos': [VEICULO],
      'PUT /api/veiculos/1': { ...VEICULO, km_atual: 63000 },
      '/api/veiculos/1/resumo': RESUMO,
    });
    abrir('/cadastro');

    expect(await screen.findByRole('heading', { name: 'Editar veículo' })).toBeInTheDocument();
    expect(screen.getByLabelText('Marca')).toHaveValue('Chevrolet');
    expect(screen.getByLabelText('Placa')).toHaveValue('ABC-1D23');

    const km = screen.getByLabelText('Km atual');
    await userEvent.clear(km);
    await userEvent.type(km, '63000');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar veículo' }));

    await screen.findByText('Chevrolet Onix 2018');
    const [[, requisicao]] = chamadas(fetchFalso, 'PUT', '/api/veiculos/1');
    expect(JSON.parse(requisicao.body).km_atual).toBe('63000');
  });
});
