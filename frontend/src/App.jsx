import { Route, Routes } from 'react-router-dom';
import { LayoutComAbas, LayoutSimples } from './components/Layouts';
import Alertas from './pages/Alertas';
import Cadastro from './pages/Cadastro';
import Documentos from './pages/Documentos';
import Gastos from './pages/Gastos';
import Historico from './pages/Historico';
import Inicio from './pages/Inicio';
import NaoEncontrada from './pages/NaoEncontrada';
import NovoServico from './pages/NovoServico';
import RelatorioPublico from './pages/RelatorioPublico';

export default function App() {
  return (
    <Routes>
      {/* Telas com barra de navegação inferior */}
      <Route element={<LayoutComAbas />}>
        <Route index element={<Inicio />} />
        <Route path="gastos" element={<Gastos />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="historico" element={<Historico />} />
      </Route>

      {/* Telas de formulário e relatório público, sem barra inferior */}
      <Route element={<LayoutSimples />}>
        <Route path="cadastro" element={<Cadastro />} />
        <Route path="servico/novo" element={<NovoServico />} />
        <Route path="relatorio/:token" element={<RelatorioPublico />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  );
}
