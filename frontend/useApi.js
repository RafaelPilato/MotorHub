import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

// Busca dados de uma URL da API e controla "carregando" e "erro".
// Passe null para não buscar (útil enquanto falta algum dado).
export function useApi(url) {
  const [estado, setEstado] = useState({ dados: null, carregando: Boolean(url), erro: null });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!url) {
      setEstado({ dados: null, carregando: false, erro: null });
      return undefined;
    }
    let ativo = true;
    setEstado((e) => ({ ...e, carregando: true, erro: null }));
    api
      .get(url)
      .then((dados) => ativo && setEstado({ dados, carregando: false, erro: null }))
      .catch((e) => ativo && setEstado({ dados: null, carregando: false, erro: e.message }));
    return () => {
      ativo = false;
    };
  }, [url, tentativa]);

  const recarregar = useCallback(() => setTentativa((t) => t + 1), []);
  return { ...estado, recarregar };
}
