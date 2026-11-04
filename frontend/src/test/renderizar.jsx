import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { VeiculoProvider } from '../context/VeiculoContext';

const FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

// Abre o app inteiro (rotas + veículo) em uma rota específica, como no navegador.
export function abrir(rota = '/') {
  return render(
    <MemoryRouter initialEntries={[rota]} future={FLAGS}>
      <VeiculoProvider>
        <App />
      </VeiculoProvider>
    </MemoryRouter>
  );
}
