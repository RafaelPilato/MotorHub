import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { VeiculoProvider } from '../context/VeiculoContext';
import { OPCOES, RESUMO, VEICULO, simularApi } from '../test/api-falsa';

function abrir(rota = '/') {
  return render(
    <MemoryRouter initialEntries={[rota]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <VeiculoProvider>
        <App />
      </VeiculoProvider>
    </MemoryRouter>
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('tela Início', () => {
  it('mostra o veículo, o gasto do mês, os vencimentos e os últimos serviços', async () => {
    simularApi({ '/api/veiculos': [VEICULO], '/api/veiculos/1/resumo': RESUMO });
    abrir();

    expect(await screen.findByText('Chevrolet Onix 2018')).toBeInTheDocument();
    expect(screen.getByText('ABC-1D23')).toBeInTheDocument();
    expect(screen.getByText('62.340 km')).toBeInTheDocument();
    expect(screen.getByText('R$ 480,00')).toBeInTheDocument();

    expect(screen.getByText('Troca de óleo')).toBeInTheDocument();
    expect(screen.getByText('Faltam 1.200 km ou 44 dias')).toBeInTheDocument();
    expect(screen.getByText('Licenciamento')).toBeInTheDocument();
    expect(screen.getByText('Vence em 15 dias')).toBeInTheDocument();
    expect(screen.getAllByText('Atenção')).toHaveLength(2);

    expect(screen.getByText('Alinhamento')).toBeInTheDocument();
    expect(screen.getByText('14/10/2026')).toBeInTheDocument();
    expect(screen.getByText('R$ 520,00')).toBeInTheDocument();
  });

  it('tem o botão de registrar serviço levando para a tela de novo serviço', async () => {
    simularApi({ '/api/veiculos': [VEICULO], '/api/veiculos/1/resumo': RESUMO });
    abrir();

    const botao = await screen.findByRole('link', { name: /registrar serviço/i });
    expect(botao).toHaveAttribute('href', '/servico/novo');
  });

  it('mostra mensagens amigáveis quando não há vencimentos nem serviços', async () => {
    simularApi({
      '/api/veiculos': [VEICULO],
      '/api/veiculos/1/resumo': { ...RESUMO, gasto_mes: 0, proximos_vencimentos: [], ultimos_servicos: [] },
    });
    abrir();

    expect(await screen.findByText(/nenhum vencimento próximo/i)).toBeInTheDocument();
    expect(screen.getByText(/nenhum serviço registrado ainda/i)).toBeInTheDocument();
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
  });

  it('convida a cadastrar o carro quando ainda não existe veículo', async () => {
    simularApi({ '/api/veiculos': [] });
    abrir();

    expect(await screen.findByText('Bem-vindo ao MotorHub')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cadastrar meu carro' })).toHaveAttribute('href', '/cadastro');
  });

  it('mostra erro com botão para tentar de novo quando a API não responde', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    abrir();

    expect(await screen.findByText(/não foi possível conectar ao servidor/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });
});

describe('navegação', () => {
  it('exibe as 5 abas e leva às demais telas', async () => {
    simularApi({ '/api/veiculos': [VEICULO], '/api/veiculos/1/resumo': RESUMO });
    abrir();
    await screen.findByText('Chevrolet Onix 2018');

    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(nav.querySelectorAll('a')).toHaveLength(5);

    await userEvent.click(screen.getByRole('link', { name: /gastos/i }));
    expect(await screen.findByRole('heading', { name: 'Gastos' })).toBeInTheDocument();
  });

  it('telas de formulário não mostram a barra de navegação', async () => {
    simularApi({ '/api/veiculos': [VEICULO], '/api/opcoes': OPCOES });
    abrir('/servico/novo');

    expect(await screen.findByRole('heading', { name: 'Novo serviço' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Navegação principal' })).not.toBeInTheDocument();
  });

  it('endereço inexistente mostra a página não encontrada', async () => {
    simularApi({ '/api/veiculos': [VEICULO] });
    abrir('/qualquer-coisa');

    expect(await screen.findByText('Página não encontrada')).toBeInTheDocument();
  });
});
