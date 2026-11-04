import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';

// Busca dados de uma URL da API e controla "carregando" e "erro".
// Passe null para não buscar (útil enquanto falta algum dado, como o veículo).
//
// Detalhes importantes:
// - Guardamos de qual URL é cada resultado. Assim, na primeira renderização depois que a URL
//   muda, "carregando" já é verdadeiro (e não aparece uma tela vazia ou com dados de outra URL).
// - Ao recarregar a mesma URL, os dados antigos continuam disponíveis até chegarem os novos.
export function useApi(url) {
  const [estado, setEstado] = useState({ url: null, dados: null, carregando: false, erro: null });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!url) {
      setEstado({ url: null, dados: null, carregando: false, erro: null });
      return undefined;
    }
    let ativo = true;
    setEstado((e) => ({ ...e, url, carregando: true, erro: null }));
    api
      .get(url)
      .then((dados) => ativo && setEstado({ url, dados, carregando: false, erro: null }))
      .catch((e) => ativo && setEstado({ url, dados: null, carregando: false, erro: e.message }));
    return () => {
      ativo = false;
    };
  }, [url, tentativa]);

  const recarregar = useCallback(() => setTentativa((t) => t + 1), []);

  const mesmaUrl = estado.url === url;
  return {
    dados: estado.dados,
    carregando: Boolean(url) && (!mesmaUrl || estado.carregando),
    erro: mesmaUrl ? estado.erro : null,
    recarregar,
  };
}
