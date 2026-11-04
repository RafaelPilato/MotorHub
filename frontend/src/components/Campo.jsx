// Campo de formulário em cartão escuro: rótulo pequeno, valor e mensagem de erro.
// Use com um <input> ou <select> dentro.
export default function Campo({ rotulo, erro, children }) {
  return (
    <div>
      <label className={`campo${erro ? ' campo--erro' : ''}`}>
        <span className="campo__rotulo">{rotulo}</span>
        {children}
      </label>
      {erro && (
        <p className="campo__erro" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
