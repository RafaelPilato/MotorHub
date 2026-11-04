// Geração do PDF do relatório de histórico para venda (tela T07).
const PDFDocument = require('pdfkit');

const PRETO = '#0B0B0B';
const VERMELHO = '#E10600';
const CINZA = '#6B6B72';
const CINZA_CLARO = '#F2F2F4';

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moeda = (valor) => formatoMoeda.format(Number(valor) || 0).replace(/\u00a0/g, ' ');
const km = (valor) => `${Number(valor || 0).toLocaleString('pt-BR')} km`;
const dataBr = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '-');

// Colunas da tabela de serviços (largura útil da página A4: 495 pt).
const COLUNAS = [
  { titulo: 'Data', largura: 62 },
  { titulo: 'Km', largura: 62 },
  { titulo: 'Serviço', largura: 150 },
  { titulo: 'Oficina', largura: 120 },
  { titulo: 'Nota', largura: 38, alinhar: 'center' },
  { titulo: 'Valor', largura: 63, alinhar: 'right' },
];

function cabecalhoDaPagina(doc) {
  doc.rect(0, 0, doc.page.width, 84).fill(PRETO);
  doc
    .font('Helvetica-BoldOblique')
    .fontSize(26)
    .fillColor('#FFFFFF')
    .text('Motor', 50, 28, { continued: true })
    .fillColor(VERMELHO)
    .text('Hub');
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#B8B8BE')
    .text('SEU CARRO SEMPRE EM DIA', 50, 36, { width: 495, align: 'right', characterSpacing: 1 });
  doc.fillColor(PRETO);
}

function cabecalhoDaTabela(doc, y) {
  doc.rect(50, y, 495, 22).fill(PRETO);
  let x = 50;
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
  COLUNAS.forEach((c) => {
    doc.text(c.titulo, x + 6, y + 7, { width: c.largura - 12, align: c.alinhar || 'left', lineBreak: false });
    x += c.largura;
  });
  doc.fillColor(PRETO);
  return y + 22;
}

// Recebe o histórico (veiculo, resumo, linha_do_tempo) e devolve o documento PDF (stream).
function gerarRelatorioPdf({ veiculo, resumo, linha_do_tempo: servicos }, geradoEm = new Date()) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
    info: {
      Title: `Histórico de manutenção - ${veiculo.marca} ${veiculo.modelo} ${veiculo.placa}`,
      Author: 'MotorHub',
    },
  });

  cabecalhoDaPagina(doc);

  // Título e identificação do veículo
  doc.font('Helvetica-Bold').fontSize(20).fillColor(PRETO).text('Histórico de manutenção', 50, 108);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .text(`${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}`, 50, 138);
  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor(CINZA)
    .text(`Placa ${veiculo.placa}  ·  ${km(veiculo.km_atual)} rodados`, 50, 158);

  // Quadros-resumo
  const quadros = [
    ['Serviços registrados', String(resumo.total_servicos)],
    ['Total investido', moeda(resumo.total_investido)],
    ['Primeiro registro', dataBr(resumo.primeiro_registro)],
    ['Último serviço', dataBr(resumo.ultimo_servico)],
  ];
  const larguraQuadro = (495 - 3 * 10) / 4;
  quadros.forEach(([rotulo, valor], i) => {
    const x = 50 + i * (larguraQuadro + 10);
    doc.roundedRect(x, 188, larguraQuadro, 54, 8).fill(CINZA_CLARO);
    doc.font('Helvetica').fontSize(8).fillColor(CINZA).text(rotulo, x + 10, 198, { width: larguraQuadro - 20 });
    doc.font('Helvetica-Bold').fontSize(12).fillColor(PRETO).text(valor, x + 10, 214, { width: larguraQuadro - 20 });
  });

  // Tabela de serviços
  doc.font('Helvetica-Bold').fontSize(12).fillColor(PRETO).text('Serviços realizados', 50, 262);
  let y = cabecalhoDaTabela(doc, 282);
  const ALTURA_LINHA = 22;
  const LIMITE_PAGINA = doc.page.height - 70;

  if (servicos.length === 0) {
    doc.font('Helvetica').fontSize(10).fillColor(CINZA).text('Nenhum serviço registrado.', 56, y + 12);
  }

  // Do mais antigo para o mais recente, como um prontuário.
  [...servicos].reverse().forEach((s, i) => {
    if (y + ALTURA_LINHA > LIMITE_PAGINA) {
      doc.addPage();
      cabecalhoDaPagina(doc);
      y = cabecalhoDaTabela(doc, 110);
    }
    if (i % 2 === 0) doc.rect(50, y, 495, ALTURA_LINHA).fill(CINZA_CLARO);

    const celulas = [
      dataBr(s.data),
      km(s.km),
      s.tipo,
      s.oficina || '-',
      s.foto_url ? 'Sim' : '-',
      moeda(s.valor),
    ];
    let x = 50;
    doc.font('Helvetica').fontSize(9).fillColor(PRETO);
    COLUNAS.forEach((c, ci) => {
      doc.text(celulas[ci], x + 6, y + 7, {
        width: c.largura - 12,
        align: c.alinhar || 'left',
        lineBreak: false,
        ellipsis: true,
      });
      x += c.largura;
    });
    y += ALTURA_LINHA;
  });

  // Rodapé com data de geração e numeração em todas as páginas
  const paginas = doc.bufferedPageRange();
  for (let i = 0; i < paginas.count; i += 1) {
    doc.switchToPage(paginas.start + i);
    doc.page.margins.bottom = 0; // permite escrever no rodapé sem criar página nova
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(CINZA)
      .text(
        `Gerado pelo MotorHub em ${geradoEm.toLocaleDateString('pt-BR')}  ·  Página ${i + 1} de ${paginas.count}`,
        50,
        doc.page.height - 40,
        { width: 495, align: 'center', lineBreak: false }
      );
  }

  doc.end();
  return doc;
}

module.exports = { gerarRelatorioPdf };
