import { ROTULO_STATUS } from '../utils/formatar';

// Selo colorido: Em dia (verde), Em breve (amarelo), Atenção e Vencido (vermelho).
export default function SeloStatus({ status }) {
  return <span className={`selo selo--${status}`}>{ROTULO_STATUS[status] ?? status}</span>;
}
