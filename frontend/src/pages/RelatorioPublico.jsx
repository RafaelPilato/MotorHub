import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import Estado from '../components/Estado';
import LinhaDoTempo from '../components/LinhaDoTempo';
import Marca from '../components/Marca';
import ResumoVeiculo from '../components/ResumoVeiculo';
import { data } from '../utils/formatar';

// Página aberta por quem recebeu o link do relatório. Só leitura, sem login.
export default function RelatorioPublico() {
  const { token } = useParams();
  const { dados, erro, recarregar } = useApi(`/api/relatorio/${token}`);

  if (erro) return <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;
  if (!dados) return <Estado tipo="carregando" />;

  return (
    <>
      <header className="topo">
        <Marca />
        <span className="topo__slogan">Relatório de histórico</span>
      </header>

      <ResumoVeiculo veiculo={dados.veiculo} resumo={dados.resumo} />

      <a className="botao botao--bloco acoes-relatorio" href={`/api/relatorio/${token}/pdf`} download>
        Baixar PDF
      </a>

      <section className="secao">
        <h2 className="secao__titulo">Serviços realizados</h2>
        <LinhaDoTempo servicos={dados.linha_do_tempo} />
      </section>

      <p className="item__detalhe rodape-relatorio">Relatório gerado pelo MotorHub em {data(dados.gerado_em)}.</p>
    </>
  );
}
