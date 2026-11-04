import { km, moeda } from '../utils/formatar';

// Resumo do veículo no relatório de histórico (usado na tela T07 e no link público).
export default function ResumoVeiculo({ veiculo, resumo }) {
  return (
    <section className="cartao cartao--veiculo" aria-label="Resumo do veículo">
      <h2 className="veiculo__nome">
        {veiculo.marca} {veiculo.modelo} {veiculo.ano}
      </h2>
      <div className="veiculo__linha">
        <span className="placa">{veiculo.placa}</span>
        <span className="veiculo__km">{km(veiculo.km_atual)}</span>
      </div>
      <dl className="estatisticas">
        <div>
          <dt>Serviços registrados</dt>
          <dd>{resumo.total_servicos}</dd>
        </div>
        <div>
          <dt>Total investido</dt>
          <dd>{moeda(resumo.total_investido)}</dd>
        </div>
      </dl>
    </section>
  );
}
