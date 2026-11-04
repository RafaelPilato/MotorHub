import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { simularApi } from '../test/api-falsa';
import { useApi } from './useApi';

afterEach(() => vi.unstubAllGlobals());

describe('useApi', () => {
  it('carrega os dados e informa "carregando" até chegarem', async () => {
    simularApi({ '/api/x': { ok: 1 } });
    const { result } = renderHook(() => useApi('/api/x'));

    expect(result.current.carregando).toBe(true);
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual({ ok: 1 });
    expect(result.current.erro).toBeNull();
  });

  it('não busca nada com URL nula e já fica pronto', () => {
    const fetchFalso = simularApi({});
    const { result } = renderHook(() => useApi(null));

    expect(result.current.carregando).toBe(false);
    expect(result.current.dados).toBeNull();
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it('quando a URL aparece depois, já começa carregando (sem tela vazia no meio)', async () => {
    simularApi({ '/api/y': [1, 2] });
    const { result, rerender } = renderHook(({ url }) => useApi(url), { initialProps: { url: null } });

    rerender({ url: '/api/y' });
    expect(result.current.carregando).toBe(true); // regressão: antes vinha false com dados nulos
    expect(result.current.dados).toBeNull();

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.dados).toEqual([1, 2]);
  });

  it('devolve a mensagem de erro quando a API falha', async () => {
    simularApi({});
    const { result } = renderHook(() => useApi('/api/nao-existe'));

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.erro).toBe('Rota não encontrada');
    expect(result.current.dados).toBeNull();
  });

  it('ao recarregar, mantém os dados antigos até chegarem os novos', async () => {
    let versao = 1;
    simularApi({ '/api/z': () => ({ versao }) });
    const { result } = renderHook(() => useApi('/api/z'));
    await waitFor(() => expect(result.current.dados).toEqual({ versao: 1 }));

    versao = 2;
    act(() => result.current.recarregar());
    await waitFor(() => expect(result.current.dados).toEqual({ versao: 2 }));
  });
});
