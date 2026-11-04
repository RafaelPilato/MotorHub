import { data, km, moeda } from '../utils/formatar';

// Linha do tempo vertical dos serviços (T07 e relatório público).
// Se "aoExcluir" for passado, cada serviço mostra o botão Excluir.
export default function LinhaDoTempo({ servicos, aoExcluir }) {
  if (servicos.length === 0) {
    return <p className="vazio">Nenhum serviço registrado ainda.</p>;
  }
  return (
    <ol className="linha">
      {servicos.map((s) => (
        <li key={s.id} className="linha__item">
          <span className="linha__marcador" aria-hidden="true" />
          <div className="linha__cartao">
            <div className="linha__topo">
              <p className="item__titulo">{s.tipo}</p>
              <span className="item__valor">{moeda(s.valor)}</span>
            </div>
            <p className="item__detalhe">
              {data(s.data)} · {km(s.km)}
              {s.oficina ? ` · ${s.oficina}` : ''}
            </p>
            <div className="linha__acoes">
              {s.foto_url && (
                <a href={s.foto_url} target="_blank" rel="noreferrer" className="link">
                  Ver nota fiscal
                </a>
              )}
              {aoExcluir && (
                <button type="button" className="link link--perigo" onClick={() => aoExcluir(s)}>
                  Excluir
                </button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
