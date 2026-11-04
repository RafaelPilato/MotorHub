// Interruptor liga/desliga (usado nos lembretes de documentos).
export default function Interruptor({ rotulo, ligado, aoMudar, desabilitado }) {
  return (
    <label className="interruptor">
      <input
        type="checkbox"
        role="switch"
        checked={ligado}
        disabled={desabilitado}
        onChange={(e) => aoMudar(e.target.checked)}
      />
      <span className="interruptor__trilho" aria-hidden="true" />
      <span>{rotulo}</span>
    </label>
  );
}
