import { Link } from 'react-router-dom';

export default function NaoEncontrada() {
  return (
    <div className="estado">
      <h1 className="estado__titulo">Página não encontrada</h1>
      <p className="estado__texto">O endereço que você abriu não existe.</p>
      <Link to="/" className="botao">
        Voltar ao início
      </Link>
    </div>
  );
}
