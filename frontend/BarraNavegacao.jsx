import { NavLink } from 'react-router-dom';
import { IconeAlertas, IconeDocumentos, IconeGastos, IconeHistorico, IconeInicio } from './Icones';

const ABAS = [
  { para: '/', rotulo: 'Início', Icone: IconeInicio, exata: true },
  { para: '/gastos', rotulo: 'Gastos', Icone: IconeGastos },
  { para: '/alertas', rotulo: 'Alertas', Icone: IconeAlertas },
  { para: '/documentos', rotulo: 'Documentos', Icone: IconeDocumentos },
  { para: '/historico', rotulo: 'Histórico', Icone: IconeHistorico },
];

// Barra de navegação inferior, igual à do protótipo.
export default function BarraNavegacao() {
  return (
    <nav className="nav" aria-label="Navegação principal">
      {ABAS.map(({ para, rotulo, Icone, exata }) => (
        <NavLink
          key={para}
          to={para}
          end={exata}
          className={({ isActive }) => `nav__link${isActive ? ' ativo' : ''}`}
        >
          <Icone />
          <span>{rotulo}</span>
        </NavLink>
      ))}
    </nav>
  );
}
