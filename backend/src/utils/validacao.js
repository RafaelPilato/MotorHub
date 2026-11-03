// Funções de apoio para validar e converter os dados que chegam da API.

// Aceita número ou texto numérico ("62340") e devolve um inteiro, ou null se for inválido.
function paraInteiro(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isInteger(n) ? n : null;
}

// Aceita número ou texto com vírgula ("220,00") e devolve o valor com 2 casas, ou null.
function paraValor(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = typeof valor === 'number' ? valor : Number(String(valor).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

// Confere se o texto é uma data real no formato AAAA-MM-DD.
function dataValida(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === texto;
}

// Data de hoje (AAAA-MM-DD) no fuso do computador, e não em UTC.
function hoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Soma (ou subtrai, com número negativo) dias a uma data AAAA-MM-DD.
function somarDias(iso, dias) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// Quantos dias existem de uma data até outra (positivo se "ate" é depois de "de").
function diasEntre(de, ate) {
  const ms = new Date(`${ate}T00:00:00Z`) - new Date(`${de}T00:00:00Z`);
  return Math.round(ms / 86400000);
}

// Placa antiga (ABC-1234) ou Mercosul (ABC1D23). Devolve no formato ABC-1D23, ou null.
function normalizarPlaca(texto) {
  if (typeof texto !== 'string') return null;
  const p = texto.toUpperCase().replace(/[\s-]/g, '');
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(p)) return null;
  return `${p.slice(0, 3)}-${p.slice(3)}`;
}

// Texto sem acento e em minúsculas, para comparar nomes de serviço.
function normalizarTexto(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Converte o :id da URL em inteiro positivo, ou null.
function idValido(texto) {
  const n = Number(texto);
  return Number.isInteger(n) && n > 0 ? n : null;
}

module.exports = {
  paraInteiro,
  paraValor,
  dataValida,
  hoje,
  somarDias,
  diasEntre,
  normalizarPlaca,
  normalizarTexto,
  idValido,
};
