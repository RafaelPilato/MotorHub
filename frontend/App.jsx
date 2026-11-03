import { Route, Routes } from 'react-router-dom';
import { LayoutComAbas, LayoutSimples } from './components/Layouts';
import EmConstrucao from './pages/EmConstrucao';
import Inicio from './pages/Inicio';
import NaoEncontrada from './pages/NaoEncontrada';

export default function App() {
  return (
    <Routes>
      {/* Telas com barra de navegação inferior */}
      <Route element={<LayoutComAbas />}>
        <Route index element={<Inicio />} />
        <Route path="gastos" element={<EmConstrucao titulo="Gastos" />} />
        <Route path="alertas" element={<EmConstrucao titulo="Alertas de revisão" />} />
        <Route path="documentos" element={<EmConstrucao titulo="Documentos do veículo" />} />
        <Route path="historico" element={<EmConstrucao titulo="Histórico do veículo" />} />
      </Route>

      {/* Telas de formulário, sem barra inferior */}
      <Route element={<LayoutSimples />}>
        <Route path="cadastro" element={<EmConstrucao titulo="Cadastre seu carro" />} />
        <Route path="servico/novo" element={<EmConstrucao titulo="Novo serviço" />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  );
}
