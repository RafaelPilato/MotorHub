// Upload da foto da nota fiscal (campo "foto" em multipart/form-data).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { ErroHttp } = require('../utils/erros');

const PASTA_UPLOADS = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

const EXTENSOES = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.diskStorage({
    destination: PASTA_UPLOADS,
    filename: (req, file, cb) => {
      const nome = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXTENSOES[file.mimetype]}`;
      cb(null, nome);
    },
  }),
  limits: { fileSize: TAMANHO_MAXIMO, files: 1 },
  fileFilter: (req, file, cb) => {
    if (EXTENSOES[file.mimetype]) return cb(null, true);
    cb(new ErroHttp(400, 'Formato de imagem não aceito. Use JPG, PNG ou WEBP.'));
  },
});

// Middleware: processa a foto (se houver) e converte erros do multer em respostas 400.
function uploadFoto(req, res, next) {
  upload.single('foto')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') return next(new ErroHttp(400, 'A foto deve ter no máximo 5 MB.'));
    if (err instanceof multer.MulterError) return next(new ErroHttp(400, 'Não foi possível enviar a foto.'));
    return next(err);
  });
}

// Apaga uma foto do disco (ignora se o arquivo não existir).
function removerFoto(nomeArquivo) {
  if (!nomeArquivo) return;
  fs.unlink(path.join(PASTA_UPLOADS, path.basename(nomeArquivo)), () => {});
}

module.exports = { uploadFoto, removerFoto, PASTA_UPLOADS };
