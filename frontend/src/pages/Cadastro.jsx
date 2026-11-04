import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useVeiculo } from '../context/VeiculoContext';
import Campo from '../components/Campo';
import CabecalhoTela from '../components/CabecalhoTela';
import Estado from '../components/Estado';

// T01 · Cadastro do veículo. Se já existe um carro, a mesma tela serve para editar.
function FormularioVeiculo({ veiculo }) {
  const navigate = useNavigate();
  const { recarregar } = useVeiculo();
  const [form, setForm] = useState({
    marca: veiculo?.marca ?? '',
    modelo: veiculo?.modelo ?? '',
    ano: veiculo?.ano ?? '',
    placa: veiculo?.placa ?? '',
    km_atual: veiculo?.km_atual ?? '',
  });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setErros({});
    setErroGeral('');
    setEnviando(true);
    try {
      if (veiculo) await api.put(`/api/veiculos/${veiculo.id}`, form);
      else await api.post('/api/veiculos', form);
      recarregar();
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
      <CabecalhoTela
        titulo={veiculo ? 'Editar veículo' : 'Cadastre seu carro'}
        subtitulo="Leva menos de 1 minuto"
      />
      <form className="formulario" onSubmit={enviar} noValidate>
        <Campo rotulo="Marca" erro={erros.marca}>
          <input value={form.marca} onChange={alterar('marca')} placeholder="Chevrolet" autoComplete="off" />
        </Campo>
        <Campo rotulo="Modelo" erro={erros.modelo}>
          <input value={form.modelo} onChange={alterar('modelo')} placeholder="Onix" autoComplete="off" />
        </Campo>
        <Campo rotulo="Ano" erro={erros.ano}>
          <input value={form.ano} onChange={alterar('ano')} inputMode="numeric" placeholder="2018" maxLength={4} />
        </Campo>
        <Campo rotulo="Placa" erro={erros.placa}>
          <input
            value={form.placa}
            onChange={(e) => setForm((f) => ({ ...f, placa: e.target.value.toUpperCase() }))}
            placeholder="ABC-1D23"
            maxLength={8}
            autoComplete="off"
          />
        </Campo>
        <Campo rotulo="Km atual" erro={erros.km_atual}>
          <input value={form.km_atual} onChange={alterar('km_atual')} inputMode="numeric" placeholder="62340" />
        </Campo>

        {erroGeral && (
          <p className="formulario__erro" role="alert">
            {erroGeral}
          </p>
        )}
        <button type="submit" className="botao botao--bloco" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar veículo'}
        </button>
      </form>
    </>
  );
}

export default function Cadastro() {
  const { veiculo, carregando, erro, recarregar } = useVeiculo();
  if (carregando) return <Estado tipo="carregando" />;
  if (erro) return <Estado tipo="erro" mensagem={erro} aoTentarNovamente={recarregar} />;
  // "key" reinicia o formulário se o veículo mudar.
  return <FormularioVeiculo key={veiculo?.id ?? 'novo'} veiculo={veiculo} />;
}
