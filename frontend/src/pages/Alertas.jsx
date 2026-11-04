import { useState } from 'react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useVeiculo } from '../context/VeiculoContext';
import Estado from '../components/Estado';
import BarraProgresso from '../components/BarraProgresso';
import SeloStatus from '../components/SeloStatus';
import Campo from '../components/Campo';
import { data, km, textoVencimento } from '../utils/formatar';

// Um alerta de revisão, com o botão "Marcar como feito".
function CartaoAlerta({ alerta, veiculoId, aoAtualizar }) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function concluir() {
    setEnviando(true);
    setErro('');
    try {
      await api.post(`/api/veiculos/${veiculoId}/alertas/${alerta.id}/concluir`, valor ? { valor } : {});
      setAberto(false);
      setValor('');
      aoAtualizar();
    } catch (e) {
      setErro(e.campos?.valor || e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <li className="cartao alerta">
      <div className="item__linha">
        <h2 className="item__titulo">{alerta.nome}</h2>
        <SeloStatus status={alerta.status} />
      </div>
      <p className="item__detalhe">{textoVencimento({ ...alerta, origem: 'revisao' })}</p>
      <BarraProgresso valor={alerta.progresso} status={alerta.status} />
      <p className="item__detalhe">
        Última vez: {data(alerta.ultima_data)} · {km(alerta.ultimo_km)}
      </p>

      {aberto ? (
        <div className="alerta__confirmar">
          <Campo rotulo="Valor pago (opcional)" erro={erro}>
            <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" placeholder="0,00" />
          </Campo>
          <div className="alerta__botoes">
            <button type="button" className="botao" onClick={concluir} disabled={enviando}>
              {enviando ? 'Registrando…' : 'Confirmar'}
            </button>
            <button type="button" className="botao botao--contorno" onClick={() => setAberto(false)}>
              Cancelar
            </button>
          </div>
          <p className="item__detalhe">Será registrado hoje, no km atual do carro.</p>
        </div>
      ) : (
        <button type="button" className="botao botao--contorno botao--pequeno" onClick={() => setAberto(true)}>
          Marcar como feito
        </button>
      )}
    </li>
  );
}

// T05 · Alertas de revisão por km ou data.
export default function Alertas() {
  const { veiculo, carregando, erro, recarregar } = useVeiculo();
  const alertas = useApi(veiculo ? `/api/veiculos/${veiculo.id}/alertas` : null);

  let conteudo;
  if (carregando) conteudo = <Estado tipo="carregando" />;
  else if (erro) conteudo = <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;
  else if (!veiculo) conteudo = <p className="vazio">Cadastre seu carro para acompanhar as revisões.</p>;
  else if (alertas.erro) conteudo = <Estado tipo="erro" mensagem={alertas.erro} aoTentarNovamente={alertas.recarregar} />;
  else if (!alertas.dados) conteudo = <Estado tipo="carregando" />;
  else {
    conteudo = (
      <ul className="lista">
        {alertas.dados.map((a) => (
          <CartaoAlerta key={a.id} alerta={a} veiculoId={veiculo.id} aoAtualizar={alertas.recarregar} />
        ))}
      </ul>
    );
  }

  return (
    <>
      <h1 className="titulo-tela">Alertas de revisão</h1>
      <p className="estado__texto subtitulo">O alerta dispara pelo que vier primeiro: km ou data.</p>
      {conteudo}
    </>
  );
}
