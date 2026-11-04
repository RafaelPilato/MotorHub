import { ROTULO_STATUS } from '../utils/formatar';

// Selo colorido: Em dia (verde), Em breve (amarelo), Atenção e Vencido (vermelho).
// "rotulo" permite trocar o texto (ex.: "Pago") mantendo a cor do status.
export default function SeloStatus({ status, rotulo }) {
  return <span className={`selo selo--${status}`}>{rotulo ?? ROTULO_STATUS[status] ?? status}</span>;
}
