import { useState } from 'react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useVeiculo } from '../context/VeiculoContext';
import Campo from '../components/Campo';
import Estado from '../components/Estado';
import Interruptor from '../components/Interruptor';
import SeloStatus from '../components/SeloStatus';
import { SELO_DOCUMENTO, data, textoVencimento } from '../utils/formatar';

const TIPOS = ['IPVA', 'Licenciamento', 'Seguro'];

function CartaoDocumento({ doc, aoAtualizar }) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const selo = SELO_DOCUMENTO[doc.situacao];

  async function executar(acao) {
    setOcupado(true);
    setErro('');
    try {
      await acao();
      aoAtualizar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  const alterar = (campos) => executar(() => api.patch(`/api/documentos/${doc.id}`, campos));
  const excluir = () => {
    if (window.confirm(`Excluir o lembrete de ${doc.tipo}?`)) executar(() => api.delete(`/api/documentos/${doc.id}`));
  };

  return (
    <li className="cartao alerta">
      <div className="item__linha">
        <h2 className="item__titulo">{doc.tipo}</h2>
        <SeloStatus status={selo.status} rotulo={selo.rotulo} />
      </div>
      <p className="item__detalhe">
        Vencimento: {data(doc.vencimento)}
        {doc.situacao !== 'pago' && ` · ${textoVencimento({ origem: 'documento', dias_restantes: doc.dias_restantes })}`}
      </p>

      <div className="item__linha">
        <Interruptor
          rotulo="Lembrete"
          ligado={doc.lembrete_ativo}
          desabilitado={ocupado}
          aoMudar={(ligado) => alterar({ lembrete_ativo: ligado })}
        />
        <div className="linha__acoes">
          {doc.status === 'pendente' && (
            <button type="button" className="link" disabled={ocupado} onClick={() => alterar({ status: 'pago' })}>
              Marcar como pago
            </button>
          )}
          <button type="button" className="link link--perigo" disabled={ocupado} onClick={excluir}>
            Excluir
          </button>
        </div>
      </div>
      {erro && (
        <p className="campo__erro" role="alert">
          {erro}
        </p>
      )}
    </li>
  );
}

function FormularioLembrete({ veiculoId, aoSalvar, aoCancelar }) {
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [vencimento, setVencimento] = useState('');
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErros({});
    setEnviando(true);
    try {
      await api.post(`/api/veiculos/${veiculoId}/documentos`, { tipo, vencimento });
      aoSalvar();
    } catch (err) {
      setErros(err.campos || { vencimento: err.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="cartao formulario" onSubmit={enviar} noValidate>
      <Campo rotulo="Documento" erro={erros.tipo}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Campo>
      <Campo rotulo="Vencimento" erro={erros.vencimento}>
        <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
      </Campo>
      <div className="alerta__botoes">
        <button type="submit" className="botao" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar lembrete'}
        </button>
        <button type="button" className="botao botao--contorno" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

// T06 · Lembretes de IPVA, licenciamento e seguro.
export default function Documentos() {
  const { veiculo, carregando, erro, recarregar } = useVeiculo();
  const docs = useApi(veiculo ? `/api/veiculos/${veiculo.id}/documentos` : null);
  const [adicionando, setAdicionando] = useState(false);

  let conteudo;
  if (carregando) conteudo = <Estado tipo="carregando" />;
  else if (erro) conteudo = <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;
  else if (!veiculo) conteudo = <p className="vazio">Cadastre seu carro para criar lembretes.</p>;
  else if (docs.erro) conteudo = <Estado tipo="erro" mensagem={docs.erro} aoTentarNovamente={docs.recarregar} />;
  else if (!docs.dados) conteudo = <Estado tipo="carregando" />;
  else {
    conteudo = (
      <>
        {docs.dados.length === 0 ? (
          <p className="vazio">Nenhum lembrete cadastrado. Adicione o IPVA, o licenciamento ou o seguro.</p>
        ) : (
          <ul className="lista">
            {docs.dados.map((d) => (
              <CartaoDocumento key={d.id} doc={d} aoAtualizar={docs.recarregar} />
            ))}
          </ul>
        )}

        <div className="secao">
          {adicionando ? (
            <FormularioLembrete
              veiculoId={veiculo.id}
              aoCancelar={() => setAdicionando(false)}
              aoSalvar={() => {
                setAdicionando(false);
                docs.recarregar();
              }}
            />
          ) : (
            <button type="button" className="botao botao--bloco" onClick={() => setAdicionando(true)}>
              Adicionar lembrete
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="titulo-tela">Documentos do veículo</h1>
      {conteudo}
    </>
  );
}
