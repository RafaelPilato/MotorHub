import { Link } from 'react-router-dom';

// Cabeçalho das telas de formulário: seta de voltar + título.
export default function CabecalhoTela({ titulo, subtitulo, voltarPara = '/' }) {
  return (
    <header className="cabecalho">
      <Link to={voltarPara} className="cabecalho__voltar" aria-label="Voltar">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </Link>
      <div>
        <h1 className="cabecalho__titulo">{titulo}</h1>
        {subtitulo && <p className="cabecalho__sub">{subtitulo}</p>}
      </div>
    </header>
  );
}
