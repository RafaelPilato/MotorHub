import { useState } from 'react';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useVeiculo } from '../context/VeiculoContext';
import Estado from '../components/Estado';
import LinhaDoTempo from '../components/LinhaDoTempo';
import ResumoVeiculo from '../components/ResumoVeiculo';

// Gera o link público do relatório e permite copiar ou enviar.
function Compartilhar({ veiculoId }) {
  const [link, setLink] = useState('');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);

  async function gerar() {
    setOcupado(true);
    setAviso('');
    try {
      const { caminho } = await api.post(`/api/veiculos/${veiculoId}/relatorio/compartilhar`);
      setLink(`${window.location.origin}${caminho}`);
    } catch (e) {
      setAviso(e.message);
    } finally {
      setOcupado(false);
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setAviso('Link copiado!');
    } catch {
      setAviso('Não foi possível copiar sozinho. Selecione o link e copie.');
    }
  }

  return (
    <div>
      {!link ? (
        <button type="button" className="botao botao--contorno botao--bloco" onClick={gerar} disabled={ocupado}>
          {ocupado ? 'Gerando link…' : 'Compartilhar link'}
        </button>
      ) : (
        <div className="cartao formulario">
          <p className="rotulo">Quem tiver este link poderá ver o histórico do veículo.</p>
          <input className="campo-link" readOnly value={link} aria-label="Link do relatório" onFocus={(e) => e.target.select()} />
          <button type="button" className="botao botao--bloco" onClick={copiar}>
            Copiar link
          </button>
        </div>
      )}
      {aviso && (
        <p className="item__detalhe" role="status">
          {aviso}
        </p>
      )}
    </div>
  );
}

// T07 · Relatório de histórico para venda.
export default function Historico() {
  const { veiculo, carregando, erro, recarregar } = useVeiculo();
  const historico = useApi(veiculo ? `/api/veiculos/${veiculo.id}/historico` : null);

  async function excluir(servico) {
    if (!window.confirm(`Excluir o serviço "${servico.tipo}"?`)) return;
    try {
      await api.delete(`/api/servicos/${servico.id}`);
      historico.recarregar();
    } catch (e) {
      window.alert(e.message);
    }
  }

  let conteudo;
  if (carregando) conteudo = <Estado tipo="carregando" />;
  else if (erro) conteudo = <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;
  else if (!veiculo) conteudo = <p className="vazio">Cadastre seu carro para montar o histórico.</p>;
  else if (historico.erro) conteudo = <Estado tipo="erro" mensagem={historico.erro} aoTentarNovamente={historico.recarregar} />;
  else if (!historico.dados) conteudo = <Estado tipo="carregando" />;
  else {
    const { veiculo: v, resumo, linha_do_tempo: servicos } = historico.dados;
    conteudo = (
      <>
        <ResumoVeiculo veiculo={v} resumo={resumo} />

        <div className="acoes-relatorio">
          <a className="botao botao--bloco" href={`/api/veiculos/${v.id}/relatorio/pdf`} download>
            Gerar PDF
          </a>
          <Compartilhar veiculoId={v.id} />
        </div>

        <section className="secao">
          <h2 className="secao__titulo">Linha do tempo</h2>
          <LinhaDoTempo servicos={servicos} aoExcluir={excluir} />
        </section>
      </>
    );
  }

  return (
    <>
      <h1 className="titulo-tela">Histórico do veículo</h1>
      {conteudo}
    </>
  );
}
