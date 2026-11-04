import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useVeiculo } from '../context/VeiculoContext';
import Campo from '../components/Campo';
import CabecalhoTela from '../components/CabecalhoTela';
import Estado from '../components/Estado';
import { hojeLocal } from '../utils/formatar';

const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024; // 5 MB, igual ao limite da API
const FORMATOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];

// T03 · Registro rápido de serviço, com foto da nota opcional.
function FormularioServico({ veiculo, tipos }) {
  const navigate = useNavigate();
  const { recarregar } = useVeiculo();
  const entradaFoto = useRef(null);

  const [tipo, setTipo] = useState(tipos[0] ?? 'Outro');
  const [tipoOutro, setTipoOutro] = useState('');
  const [dataServico, setDataServico] = useState(hojeLocal());
  const [kmServico, setKmServico] = useState(String(veiculo.km_atual));
  const [valor, setValor] = useState('');
  const [oficina, setOficina] = useState('');
  const [foto, setFoto] = useState(null);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Miniatura da foto escolhida (liberada da memória ao trocar ou sair).
  const previa = useMemo(() => (foto ? URL.createObjectURL(foto) : null), [foto]);
  useEffect(() => () => previa && URL.revokeObjectURL(previa), [previa]);

  function escolherFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (!FORMATOS_FOTO.includes(arquivo.type)) {
      setErros((er) => ({ ...er, foto: 'Use uma imagem JPG, PNG ou WEBP.' }));
    } else if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      setErros((er) => ({ ...er, foto: 'A foto deve ter no máximo 5 MB.' }));
    } else {
      setErros((er) => ({ ...er, foto: undefined }));
      setFoto(arquivo);
    }
    e.target.value = ''; // permite escolher o mesmo arquivo de novo
  }

  async function enviar(e) {
    e.preventDefault();
    setErros({});
    setErroGeral('');
    setEnviando(true);

    const dados = new FormData();
    dados.append('data', dataServico);
    dados.append('km', kmServico);
    dados.append('tipo', tipo === 'Outro' ? tipoOutro.trim() : tipo);
    dados.append('valor', valor);
    if (oficina.trim()) dados.append('oficina', oficina.trim());
    if (foto) dados.append('foto', foto);

    try {
      await api.postarFormulario(`/api/veiculos/${veiculo.id}/servicos`, dados);
      recarregar(); // o km do carro pode ter mudado
      navigate('/');
    } catch (err) {
      setErros(err.campos || {});
      setErroGeral(err.campos ? 'Confira os campos destacados.' : err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <CabecalhoTela titulo="Novo serviço" />
      <form className="formulario" onSubmit={enviar} noValidate>
        <div role="group" aria-labelledby="rotulo-tipo">
          <p id="rotulo-tipo" className="rotulo campo__titulo">
            Tipo de serviço
          </p>
          <div className="chips">
            {tipos.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tipo === t} onClick={() => setTipo(t)}>
                {t}
              </button>
            ))}
          </div>
          {erros.tipo && (
            <p className="campo__erro" role="alert">
              {erros.tipo}
            </p>
          )}
        </div>

        {tipo === 'Outro' && (
          <Campo rotulo="Qual serviço?">
            <input value={tipoOutro} onChange={(e) => setTipoOutro(e.target.value)} placeholder="Ex.: Lavagem" />
          </Campo>
        )}

        <Campo rotulo="Data" erro={erros.data}>
          <input type="date" value={dataServico} max={hojeLocal()} onChange={(e) => setDataServico(e.target.value)} />
        </Campo>
        <Campo rotulo="Km" erro={erros.km}>
          <input value={kmServico} onChange={(e) => setKmServico(e.target.value)} inputMode="numeric" />
        </Campo>
        <Campo rotulo="Valor (R$)" erro={erros.valor}>
          <input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" placeholder="220,00" />
        </Campo>
        <Campo rotulo="Oficina (opcional)">
          <input value={oficina} onChange={(e) => setOficina(e.target.value)} placeholder="Auto Center Silva" />
        </Campo>

        <input
          ref={entradaFoto}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={escolherFoto}
          hidden
          data-testid="entrada-foto"
        />
        {previa ? (
          <div className="foto-previa">
            <img src={previa} alt="Prévia da nota fiscal" />
            <button type="button" className="link link--perigo" onClick={() => setFoto(null)}>
              Remover foto
            </button>
          </div>
        ) : (
          <button type="button" className="botao botao--contorno botao--bloco" onClick={() => entradaFoto.current.click()}>
            Tirar foto da nota (opcional)
          </button>
        )}
        {erros.foto && (
          <p className="campo__erro" role="alert">
            {erros.foto}
          </p>
        )}

        {erroGeral && (
          <p className="formulario__erro" role="alert">
            {erroGeral}
          </p>
        )}
        <button type="submit" className="botao botao--bloco" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar serviço'}
        </button>
      </form>
    </>
  );
}

export default function NovoServico() {
  const { veiculo, carregando, erro, recarregar } = useVeiculo();
  const opcoes = useApi('/api/opcoes');

  if (carregando) return <Estado tipo="carregando" />;
  if (erro) return <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;
  if (opcoes.erro) return <Estado tipo="erro" mensagem={opcoes.erro} aoTentarNovamente={opcoes.recarregar} />;
  if (!opcoes.dados) return <Estado tipo="carregando" />;

  if (!veiculo) {
    return (
      <div className="estado">
        <h1 className="estado__titulo">Cadastre seu carro primeiro</h1>
        <p className="estado__texto">Para registrar um serviço, o MotorHub precisa saber qual é o seu carro.</p>
        <Link to="/cadastro" className="botao">
          Cadastrar meu carro
        </Link>
      </div>
    );
  }
  return <FormularioServico veiculo={veiculo} tipos={opcoes.dados.tipos_sugeridos} />;
}
