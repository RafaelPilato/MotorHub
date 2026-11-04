import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useVeiculo } from '../context/VeiculoContext';
import Estado from '../components/Estado';
import Marca from '../components/Marca';
import SeloStatus from '../components/SeloStatus';
import { IconeMais } from '../components/Icones';
import { data, km, moeda, textoVencimento } from '../utils/formatar';

// Primeiro acesso: ainda não há carro cadastrado.
function BoasVindas() {
  return (
    <div className="estado">
      <img className="estado__logo" src="/logo-motorhub.jpeg" alt="MotorHub" />
      <h1 className="estado__titulo">Bem-vindo ao MotorHub</h1>
      <p className="estado__texto">Cadastre seu carro para acompanhar gastos, revisões e documentos.</p>
      <Link to="/cadastro" className="botao">
        Cadastrar meu carro
      </Link>
    </div>
  );
}

function InicioDoVeiculo({ veiculoId }) {
  const { dados: resumo, carregando, erro, recarregar } = useApi(`/api/veiculos/${veiculoId}/resumo`);

  if (carregando) return <Estado tipo="carregando" />;
  if (erro) return <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;

  const { veiculo, gasto_mes: gastoMes, proximos_vencimentos: vencimentos, ultimos_servicos: ultimos } = resumo;

  return (
    <>
      <header className="topo">
        <Marca />
        <span className="topo__slogan">Seu carro sempre em dia</span>
      </header>

      <section className="cartao cartao--veiculo" aria-label="Veículo">
        <h1 className="veiculo__nome">
          {veiculo.marca} {veiculo.modelo} {veiculo.ano}
        </h1>
        <div className="veiculo__linha">
          <span className="placa">{veiculo.placa}</span>
          <span className="veiculo__km">{km(veiculo.km_atual)}</span>
        </div>
      </section>

      <section className="cartao cartao--gasto" aria-label="Gasto do mês">
        <p className="rotulo">Gasto do mês</p>
        <p className="valor-grande">{moeda(gastoMes)}</p>
      </section>

      <section className="secao">
        <h2 className="secao__titulo">Próximos vencimentos</h2>
        {vencimentos.length === 0 ? (
          <p className="vazio">Nenhum vencimento próximo. Está tudo em dia.</p>
        ) : (
          <ul className="lista">
            {vencimentos.map((v) => (
              <li key={`${v.origem}-${v.id}`}>
                <Link to={v.origem === 'documento' ? '/documentos' : '/alertas'} className="item">
                  <div>
                    <p className="item__titulo">{v.titulo}</p>
                    <p className="item__detalhe">{textoVencimento(v)}</p>
                  </div>
                  <SeloStatus status={v.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="secao">
        <h2 className="secao__titulo">Últimos serviços</h2>
        {ultimos.length === 0 ? (
          <p className="vazio">Nenhum serviço registrado ainda. Toque em "Registrar serviço" para começar.</p>
        ) : (
          <ul className="lista">
            {ultimos.map((s) => (
              <li key={s.id} className="item">
                <div>
                  <p className="item__titulo">{s.tipo}</p>
                  <p className="item__detalhe">{data(s.data)}</p>
                </div>
                <span className="item__valor">{moeda(s.valor)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/servico/novo" className="botao fab">
        <IconeMais />
        Registrar serviço
      </Link>
    </>
  );
}

export default function Inicio() {
  const { veiculo, carregando, erro, recarregar } = useVeiculo();

  if (carregando) return <Estado tipo="carregando" />;
  if (erro) return <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;
  if (!veiculo) return <BoasVindas />;
  return <InicioDoVeiculo veiculoId={veiculo.id} />;
}
