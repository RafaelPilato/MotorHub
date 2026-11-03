import { createContext, useContext, useMemo } from 'react';
import { useApi } from '../hooks/useApi';

// Guarda o veículo do usuário. O MVP trabalha com um carro: o primeiro cadastrado.
const VeiculoContext = createContext(null);

export function VeiculoProvider({ children }) {
  const { dados, carregando, erro, recarregar } = useApi('/api/veiculos');

  const valor = useMemo(
    () => ({ veiculo: dados?.[0] ?? null, carregando, erro, recarregar }),
    [dados, carregando, erro, recarregar]
  );
  return <VeiculoContext.Provider value={valor}>{children}</VeiculoContext.Provider>;
}

export function useVeiculo() {
  const contexto = useContext(VeiculoContext);
  if (!contexto) throw new Error('useVeiculo precisa estar dentro de <VeiculoProvider>');
  return contexto;
}
