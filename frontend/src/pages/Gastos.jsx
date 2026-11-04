import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useVeiculo } from '../context/VeiculoContext';
import Estado from '../components/Estado';
import BarraProgresso from '../components/BarraProgresso';
import { moeda, nomeMes, percentual, textoVariacao } from '../utils/formatar';

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function Titulo() {
  return <h1 className="titulo-tela">Gastos</h1>;
}

// T04 · Painel de gastos: total, comparativo, gráfico por mês e gasto por categoria.
function PainelGastos({ veiculoId }) {
  const hoje = new Date();
  const [periodo, setPeriodo] = useState('anual');
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth() + 1);

  const url = `/api/veiculos/${veiculoId}/gastos?ano=${ano}${periodo === 'mensal' ? `&mes=${mes}` : ''}`;
  const { dados, carregando, erro, recarregar } = useApi(url);

  if (erro) return <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;
  if (!dados) return <Estado tipo="carregando" />;

  const mensal = periodo === 'mensal';
  const variacao = textoVariacao(dados.variacao_percentual, periodo);
  const maiorMes = Math.max(...dados.por_mes.map((m) => m.total), 1);
  const anos = dados.anos_disponiveis.includes(ano) ? dados.anos_disponiveis : [ano, ...dados.anos_disponiveis];

  return (
    <div style={{ opacity: carregando ? 0.6 : 1 }}>
      <div className="segmentado" role="group" aria-label="Período">
        {[
          ['mensal', 'Mensal'],
          ['anual', 'Anual'],
        ].map(([valor, rotulo]) => (
          <button key={valor} type="button" aria-pressed={periodo === valor} onClick={() => setPeriodo(valor)}>
            {rotulo}
          </button>
        ))}
      </div>

      <div className="filtros">
        {mensal && (
          <select aria-label="Mês" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {MESES_CURTOS.map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {nomeMes(i + 1)}
              </option>
            ))}
          </select>
        )}
        <select aria-label="Ano" value={ano} onChange={(e) => setAno(Number(e.target.value))}>
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <section className="cartao cartao--gasto" aria-label="Total do período">
        <p className="rotulo">{mensal ? `Total em ${nomeMes(mes)} de ${ano}` : `Total em ${ano}`}</p>
        <p className="valor-grande">{moeda(dados.total)}</p>
        <p className="item__detalhe">
          {dados.quantidade_servicos} {dados.quantidade_servicos === 1 ? 'serviço' : 'serviços'}
          {variacao ? ` · ${variacao}` : ''}
        </p>
      </section>

      <section className="secao" aria-label="Gastos por mês">
        <h2 className="secao__titulo">Mês a mês em {dados.ano}</h2>
        <div className="cartao">
          <div className="grafico" role="img" aria-label={`Gráfico de gastos por mês em ${dados.ano}`}>
            {dados.por_mes.map((m) => {
              const destaque = !mensal || m.mes === mes;
              return (
                <div key={m.mes} className="grafico__coluna" title={`${nomeMes(m.mes)}: ${moeda(m.total)}`}>
                  <div className="grafico__area">
                    <div
                      className={`grafico__barra${destaque ? '' : ' grafico__barra--apagada'}`}
                      style={{ height: `${(m.total / maiorMes) * 100}%` }}
                    />
                  </div>
                  <span className="grafico__mes">{MESES_CURTOS[m.mes - 1]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="secao" aria-label="Gastos por categoria">
        <h2 className="secao__titulo">Por categoria</h2>
        {dados.total === 0 ? (
          <p className="vazio">Nenhum gasto registrado neste período.</p>
        ) : (
          <ul className="lista">
            {dados.por_categoria.map((c) => (
              <li key={c.categoria} className="item item--coluna">
                <div className="item__linha">
                  <span className="item__titulo">{c.categoria}</span>
                  <span className="item__valor">{moeda(c.total)}</span>
                </div>
                <BarraProgresso valor={c.percentual} status="atencao" />
                <span className="item__detalhe">{percentual(c.percentual)} do total</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function Gastos() {
  const { veiculo, carregando, erro, recarregar } = useVeiculo();

  let conteudo;
  if (carregando) conteudo = <Estado tipo="carregando" />;
  else if (erro) conteudo = <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;
  else if (!veiculo) conteudo = <p className="vazio">Cadastre seu carro para ver os gastos.</p>;
  else conteudo = <PainelGastos veiculoId={veiculo.id} />;

  return (
    <>
      <Titulo />
      {conteudo}
    </>
  );
}
