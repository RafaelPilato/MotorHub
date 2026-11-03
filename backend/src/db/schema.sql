-- MotorHub · esquema do banco de dados (SQLite)
-- Executado automaticamente toda vez que o servidor sobe (CREATE TABLE IF NOT EXISTS).

-- Veículo (T01). O MVP trabalha com um carro, mas o esquema já aceita vários.
CREATE TABLE IF NOT EXISTS veiculos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  marca      TEXT    NOT NULL,
  modelo     TEXT    NOT NULL,
  ano        INTEGER NOT NULL,
  placa      TEXT    NOT NULL UNIQUE,
  km_atual   INTEGER NOT NULL DEFAULT 0 CHECK (km_atual >= 0),
  criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Serviço registrado (T03). Alimenta o histórico, o painel de gastos e os alertas.
CREATE TABLE IF NOT EXISTS servicos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  veiculo_id  INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  data        TEXT    NOT NULL,                       -- AAAA-MM-DD
  km          INTEGER NOT NULL CHECK (km >= 0),
  tipo        TEXT    NOT NULL,                       -- ex.: Troca de óleo, Pneus, Freios
  categoria   TEXT    NOT NULL
              CHECK (categoria IN ('Revisão','Peças','Reparos','Documentos','Outros')),
  valor       REAL    NOT NULL CHECK (valor >= 0),    -- em reais
  oficina     TEXT,
  foto_nota   TEXT,                                   -- caminho do arquivo (opcional)
  criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_servicos_veiculo_data ON servicos (veiculo_id, data);

-- Regras de alerta de revisão (T05). O alerta dispara pelo que vier primeiro: km ou data.
CREATE TABLE IF NOT EXISTS planos_revisao (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  veiculo_id      INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  nome            TEXT    NOT NULL,                   -- como aparece na tela
  tipo_servico    TEXT    NOT NULL,                   -- liga com servicos.tipo
  intervalo_km    INTEGER NOT NULL CHECK (intervalo_km > 0),
  intervalo_dias  INTEGER NOT NULL CHECK (intervalo_dias > 0),
  ultimo_km       INTEGER NOT NULL DEFAULT 0,
  ultima_data     TEXT    NOT NULL,                   -- AAAA-MM-DD
  UNIQUE (veiculo_id, tipo_servico)
);

-- Documentos do veículo (T06): IPVA, licenciamento e seguro.
CREATE TABLE IF NOT EXISTS documentos (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  veiculo_id      INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  tipo            TEXT    NOT NULL CHECK (tipo IN ('IPVA','Licenciamento','Seguro')),
  vencimento      TEXT    NOT NULL,                   -- AAAA-MM-DD
  status          TEXT    NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','pago')),
  lembrete_ativo  INTEGER NOT NULL DEFAULT 1 CHECK (lembrete_ativo IN (0,1))
);

-- Links de compartilhamento do relatório de histórico (T07, "Compartilhar link").
CREATE TABLE IF NOT EXISTS compartilhamentos (
  token       TEXT    PRIMARY KEY,
  veiculo_id  INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);
