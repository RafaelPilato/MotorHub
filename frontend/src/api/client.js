// Cliente da API do MotorHub. Todas as telas conversam com o back-end por aqui.

export class ErroApi extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    this.campos = campos; // erros por campo, quando a API devolve (validação)
  }
}

async function requisicao(url, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch {
    throw new ErroApi(0, 'Não foi possível conectar ao servidor. Verifique se a API está rodando.');
  }

  if (resposta.status === 204) return null;

  let corpo = null;
  try {
    corpo = await resposta.json();
  } catch {
    // resposta sem JSON
  }

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, corpo?.erro || 'Ocorreu um erro inesperado.', corpo?.campos);
  }
  return corpo;
}

const json = (metodo, corpo) => ({
  method: metodo,
  headers: { 'Content-Type': 'application/json' },
  body: corpo === undefined ? undefined : JSON.stringify(corpo),
});

export const api = {
  get: (url) => requisicao(url),
  post: (url, corpo) => requisicao(url, json('POST', corpo)),
  put: (url, corpo) => requisicao(url, json('PUT', corpo)),
  patch: (url, corpo) => requisicao(url, json('PATCH', corpo)),
  delete: (url) => requisicao(url, { method: 'DELETE' }),
  // Envio com arquivo (ex.: foto da nota fiscal). Recebe um FormData.
  postarFormulario: (url, formData) => requisicao(url, { method: 'POST', body: formData }),
};
