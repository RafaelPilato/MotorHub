// Barra de progresso colorida pelo status (ok, em_breve, atencao, vencido).
export default function BarraProgresso({ valor, status }) {
  const largura = Math.min(100, Math.max(0, valor));
  return (
    <div className="barra" role="progressbar" aria-valuenow={largura} aria-valuemin={0} aria-valuemax={100}>
      <div className={`barra__preenchimento barra--${status}`} style={{ width: `${largura}%` }} />
    </div>
  );
}
