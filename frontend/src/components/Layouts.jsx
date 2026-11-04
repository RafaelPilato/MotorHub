import { Outlet } from 'react-router-dom';
import BarraNavegacao from './BarraNavegacao';

// Telas principais: conteúdo + barra de navegação inferior.
export function LayoutComAbas() {
  return (
    <div className="app">
      <main className="conteudo conteudo--com-abas">
        <Outlet />
      </main>
      <BarraNavegacao />
    </div>
  );
}

// Telas de formulário (cadastro, novo serviço): sem barra inferior.
export function LayoutSimples() {
  return (
    <div className="app">
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
