import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { abrir } from '../test/renderizar';
import { OPCOES, RESUMO, VEICULO, chamadas, respostaApi, simularApi } from '../test/api-falsa';

const rotasBase = () => ({
  '/api/veiculos': [VEICULO],
  '/api/opcoes': OPCOES,
  '/api/veiculos/1/resumo': RESUMO,
});

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:previa');
  URL.revokeObjectURL = vi.fn();
});
afterEach(() => vi.unstubAllGlobals());

describe('T03 · Novo serviço', () => {
  it('registra um serviço com o tipo escolhido e volta para o Início', async () => {
    const fetchFalso = simularApi({
      ...rotasBase(),
      'POST /api/veiculos/1/servicos': respostaApi(201, { id: 99 }),
    });
    abrir('/servico/novo');

    expect(await screen.findByRole('heading', { name: 'Novo serviço' })).toBeInTheDocument();
    expect(screen.getByLabelText('Km')).toHaveValue('62340'); // já vem com o km atual do carro

    await userEvent.click(screen.getByRole('button', { name: 'Freios' }));
    await userEvent.type(screen.getByLabelText('Valor (R$)'), '520,00');
    await userEvent.type(screen.getByLabelText('Oficina (opcional)'), 'Auto Center Silva');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar serviço' }));

    expect(await screen.findByText('Chevrolet Onix 2018')).toBeInTheDocument(); // voltou ao Início

    const [[, requisicao]] = chamadas(fetchFalso, 'POST', '/api/veiculos/1/servicos');
    const dados = requisicao.body;
    expect(dados.get('tipo')).toBe('Freios');
    expect(dados.get('valor')).toBe('520,00');
    expect(dados.get('km')).toBe('62340');
    expect(dados.get('oficina')).toBe('Auto Center Silva');
    expect(dados.get('foto')).toBeNull();
  });

  it('"Outro" abre um campo para digitar o nome do serviço', async () => {
    const fetchFalso = simularApi({ ...rotasBase(), 'POST /api/veiculos/1/servicos': respostaApi(201, { id: 1 }) });
    abrir('/servico/novo');

    await userEvent.click(await screen.findByRole('button', { name: 'Outro' }));
    await userEvent.type(screen.getByLabelText('Qual serviço?'), 'Lavagem');
    await userEvent.type(screen.getByLabelText('Valor (R$)'), '100');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar serviço' }));

    await screen.findByText('Chevrolet Onix 2018');
    expect(chamadas(fetchFalso, 'POST', '/api/veiculos/1/servicos')[0][1].body.get('tipo')).toBe('Lavagem');
  });

  it('anexa a foto da nota, mostra a prévia e envia junto com o serviço', async () => {
    const fetchFalso = simularApi({ ...rotasBase(), 'POST /api/veiculos/1/servicos': respostaApi(201, { id: 1 }) });
    abrir('/servico/novo');
    await screen.findByRole('heading', { name: 'Novo serviço' });

    const foto = new File(['x'], 'nota.png', { type: 'image/png' });
    await userEvent.upload(screen.getByTestId('entrada-foto'), foto);
    expect(await screen.findByAltText('Prévia da nota fiscal')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Valor (R$)'), '220');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar serviço' }));

    await screen.findByText('Chevrolet Onix 2018');
    const enviado = chamadas(fetchFalso, 'POST', '/api/veiculos/1/servicos')[0][1].body.get('foto');
    expect(enviado).toBeInstanceOf(File);
    expect(enviado.name).toBe('nota.png');
  });

  it('recusa arquivo que não é imagem e permite remover a foto escolhida', async () => {
    simularApi(rotasBase());
    abrir('/servico/novo');
    await screen.findByRole('heading', { name: 'Novo serviço' });

    // applyAccept desligado: simula um arquivo fora do formato permitido
    const entrada = screen.getByTestId('entrada-foto');
    await userEvent.setup({ applyAccept: false }).upload(entrada, new File(['x'], 'nota.pdf', { type: 'application/pdf' }));
    expect(await screen.findByText('Use uma imagem JPG, PNG ou WEBP.')).toBeInTheDocument();

    await userEvent.upload(entrada, new File(['x'], 'nota.jpg', { type: 'image/jpeg' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Remover foto' }));
    expect(screen.queryByAltText('Prévia da nota fiscal')).not.toBeInTheDocument();
  });

  it('mostra os erros de validação da API nos campos', async () => {
    simularApi({
      ...rotasBase(),
      'POST /api/veiculos/1/servicos': respostaApi(400, {
        erro: 'Dados do serviço inválidos.',
        campos: { valor: 'Informe o valor (0 ou mais).', data: 'A data do serviço não pode ser no futuro.' },
      }),
    });
    abrir('/servico/novo');

    await userEvent.click(await screen.findByRole('button', { name: 'Salvar serviço' }));
    expect(await screen.findByText('Informe o valor (0 ou mais).')).toBeInTheDocument();
    expect(screen.getByText('A data do serviço não pode ser no futuro.')).toBeInTheDocument();
  });

  it('pede o cadastro do carro antes de registrar serviços', async () => {
    simularApi({ '/api/veiculos': [], '/api/opcoes': OPCOES });
    abrir('/servico/novo');

    expect(await screen.findByText('Cadastre seu carro primeiro')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastrar meu carro' })).toHaveAttribute('href', '/cadastro');
  });
});
