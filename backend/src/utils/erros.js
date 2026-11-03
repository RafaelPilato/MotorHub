// Erro com código HTTP. O tratador de erros do app.js transforma em resposta JSON.
class ErroHttp extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    this.campos = campos; // detalhes por campo, quando for erro de validação
  }
}

module.exports = { ErroHttp };
