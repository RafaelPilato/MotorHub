# MotorHub · Back-end

API do MotorHub em **Node.js + Express** com banco **SQLite** (`better-sqlite3`).

## Como rodar

Pré-requisito: Node.js 18.11 ou superior.

```bash
# na raiz do repositório
npm run install:all   # instala as dependências
npm run seed          # (opcional) popula o banco com dados de exemplo
npm run dev           # sobe a API em http://localhost:3001
```

Teste: abra `http://localhost:3001/api/saude`. A resposta esperada é:

```json
{ "status": "ok", "banco": "conectado", "veiculos": 1 }
```

Se o site já tiver sido compilado (`npm run build` na raiz), o back-end também serve a interface em `http://localhost:3001`.

O arquivo do banco é criado em `backend/data/motorhub.db` e não vai para o Git.

## Estrutura

```
backend/
├── src/
│   ├── server.js          # sobe o servidor
│   ├── app.js             # configuração do Express e rotas
│   └── db/
│       ├── database.js    # conexão com o SQLite
│       ├── schema.sql     # tabelas
│       └── seed.js        # dados de exemplo
├── uploads/               # fotos das notas fiscais (a partir da Parte 2)
└── data/                  # banco SQLite (gerado, ignorado pelo Git)
```

## Modelo de dados

| Tabela | Função | Tela |
|---|---|---|
| `veiculos` | Dados do carro (marca, modelo, ano, placa, km atual) | T01 |
| `servicos` | Serviços registrados, com valor, categoria e foto da nota | T03, T04, T07 |
| `planos_revisao` | Regras de alerta por km e por data | T05 |
| `documentos` | IPVA, licenciamento e seguro, com vencimento e lembrete | T06 |

Regra de negócio central (RN02): cada serviço registrado alimenta ao mesmo tempo o histórico, o painel de gastos e o cálculo do próximo alerta.

## API (Parte 2)

Erros seguem o formato `{ "erro": "mensagem", "campos": { "campo": "detalhe" } }`. Datas usam `AAAA-MM-DD`.

| Método | Rota | O que faz | Tela |
|---|---|---|---|
| GET | `/api/saude` | Confere API e banco | – |
| GET | `/api/opcoes` | Categorias e tipos sugeridos de serviço | T03 |
| GET | `/api/veiculos` | Lista os veículos | T02 |
| GET | `/api/veiculos/:id` | Detalha um veículo | T02 |
| POST | `/api/veiculos` | Cadastra veículo (`marca`, `modelo`, `ano`, `placa`, `km_atual`) | T01 |
| PUT | `/api/veiculos/:id` | Atualiza veículo | T01 |
| GET | `/api/veiculos/:id/servicos` | Lista serviços (filtros `?ano=`, `?categoria=`, `?limite=`) | T02, T07 |
| POST | `/api/veiculos/:id/servicos` | Registra serviço (JSON ou `multipart/form-data` com o campo `foto`) | T03 |
| GET | `/api/servicos/:id` | Detalha um serviço | T07 |
| DELETE | `/api/servicos/:id` | Exclui serviço e a foto | T07 |
| GET | `/uploads/<arquivo>` | Foto da nota fiscal | T03, T07 |

### Regras implementadas

- **Placa:** aceita ABC-1234 e ABC-1D23 (com ou sem hífen) e salva no formato `ABC-1D23`. Placa repetida retorna 409.
- **Serviço:** `data` é opcional (assume hoje) e não pode ser futura. `valor` aceita vírgula (`"220,50"`). Se a `categoria` não for enviada, é inferida pelo tipo (ex.: "Pneus" vira Peças).
- **Foto da nota:** opcional, só JPG, PNG ou WEBP, até 5 MB. Se o registro falhar, a foto é apagada.
- **RN02:** ao registrar ou excluir um serviço, a quilometragem do veículo (só sobe) e o "último serviço" dos planos de revisão são atualizados.

## API (Parte 3)

| Método | Rota | O que faz | Tela |
|---|---|---|---|
| GET | `/api/veiculos/:id/resumo` | Gasto do mês, próximos vencimentos e últimos 3 serviços | T02 |
| GET | `/api/veiculos/:id/gastos?ano=2026` | Painel anual: total, comparativo com o ano anterior, categorias e meses | T04 |
| GET | `/api/veiculos/:id/gastos?ano=2026&mes=10` | Painel mensal, comparado com o mês anterior | T04 |
| GET | `/api/veiculos/:id/alertas` | Alertas de revisão, dos mais urgentes aos menos | T05 |
| POST | `/api/veiculos/:id/alertas/:planoId/concluir` | "Marcar como feito": registra o serviço e reinicia a contagem (opcional: `valor`, `oficina`, `km`, `data`) | T05 |
| GET | `/api/veiculos/:id/documentos` | IPVA, licenciamento e seguro, com dias restantes e situação | T06 |
| POST | `/api/veiculos/:id/documentos` | "Adicionar lembrete" (`tipo`, `vencimento`, opcionais `status` e `lembrete_ativo`) | T06 |
| PATCH | `/api/documentos/:id` | Altera `vencimento`, `status` (`pendente` ou `pago`) ou `lembrete_ativo` | T06 |
| DELETE | `/api/documentos/:id` | Exclui o documento | T06 |
| GET | `/api/veiculos/:id/historico` | Resumo e linha do tempo completa do veículo | T07 |
| POST | `/api/veiculos/:id/relatorio/compartilhar` | Gera o link público do relatório (`token`) | T07 |
| GET | `/api/relatorio/:token` | Relatório público, para quem recebeu o link | T07 |
| GET | `/api/veiculos/:id/relatorio/pdf` | Baixa o relatório de histórico em PDF | T07 |
| GET | `/api/relatorio/:token/pdf` | PDF do relatório compartilhado | T07 |

### Regras implementadas

- **RN01 (alertas):** cada alerta tem um intervalo em km e outro em dias. O progresso é o maior dos dois, então dispara pelo que vier primeiro (`criterio` informa qual). Status: `ok` (abaixo de 60%), `em_breve` (60% ou mais), `atencao` (85% ou mais) e `vencido` (passou do km ou da data).
- **Alertas padrão:** todo veículo novo recebe 3 alertas (troca de óleo a cada 10.000 km ou 365 dias, filtro de ar a cada 15.000 km ou 730 dias, pastilhas de freio a cada 20.000 km ou 1.095 dias), contados a partir do cadastro. Ao registrar um serviço do mesmo tipo, a contagem reinicia.
- **Documentos:** `situacao` é `pago`, `atrasado` (pendente e vencido), `atencao` (pendente e vence em até 30 dias) ou `em_dia`.
- **Painel de gastos:** todas as 5 categorias aparecem, mesmo zeradas, ordenadas do maior para o menor gasto. `variacao_percentual` é `null` quando o período anterior não tem gastos.
- **Próximos vencimentos (tela inicial):** junta alertas e documentos pendentes, com os mais urgentes primeiro (máximo de 4).
- **PDF do relatório:** gerado na hora com `pdfkit` (cabeçalho com a marca, quadros-resumo, tabela de serviços do mais antigo ao mais recente, paginação automática e rodapé numerado).
- **Link do relatório:** o token é aleatório e difícil de adivinhar. Quem tem o link vê o histórico sem precisar de login.

## Testes

```bash
npm test    # 31 testes automáticos, com banco temporário
```
