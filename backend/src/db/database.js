// Conexão única com o SQLite. O arquivo do banco é criado em backend/data/.
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const pastaDados = path.join(__dirname, '..', '..', 'data');
fs.mkdirSync(pastaDados, { recursive: true });

const arquivoBanco = process.env.DB_FILE || path.join(pastaDados, 'motorhub.db');

const db = new Database(arquivoBanco);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Cria as tabelas na primeira execução.
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

module.exports = db;
