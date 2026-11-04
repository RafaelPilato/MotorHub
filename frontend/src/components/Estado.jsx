// Estados padrão das telas: carregando e erro (com botão para tentar de novo).
export default function Estado({ tipo, mensagem, aoTentarNovamente }) {
  if (tipo === 'carregando') {
    return (
      <div className="estado" role="status" aria-label="Carregando">
        <div className="carregando" />
      </div>
    );
  }
  return (
    <div className="estado" role="alert">
      <h2 className="estado__titulo">Algo deu errado</h2>
      <p className="estado__texto">{mensagem}</p>
      {aoTentarNovamente && (
        <button type="button" className="botao" onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
