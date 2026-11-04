# MotorHub · Front-end

Interface web do MotorHub, feita com **React 18**, **Vite** e **React Router**. O layout é pensado primeiro para celular (mobile-first) e fica centralizado, com largura de celular, quando aberto no computador.

## Como rodar

Na **raiz do repositório**:

```bash
npm run install:all   # instala as dependências (raiz, back-end e front-end)
npm run seed          # (opcional) dados de exemplo
npm run dev           # API em http://localhost:3001 e site em http://localhost:5173
```

Abra **http://localhost:5173**. Em desenvolvimento, o Vite repassa as chamadas `/api` e `/uploads` para o back-end.

### Modo demonstração (uma porta só)

```bash
npm run build         # compila o site em frontend/dist
npm start             # o back-end serve a API e o site em http://localhost:3001
```

## Estrutura

```
frontend/
├── public/                    # logo do MotorHub
└── src/
    ├── main.jsx               # ponto de entrada
    ├── App.jsx                # rotas das telas
    ├── api/client.js          # chamadas à API (get, post, patch, delete, envio de arquivo)
    ├── hooks/useApi.js        # busca dados e controla carregando/erro
    ├── context/               # veículo atual, compartilhado entre as telas
    ├── components/            # barra inferior, layouts, selos, estados
    ├── pages/                 # uma pasta/arquivo por tela (T01 a T07)
    ├── styles/                # tema (cores da logo) e estilos globais
    ├── utils/formatar.js      # moeda, km, datas e textos de prazo
    └── test/                  # apoio aos testes (API simulada)
```

## Telas

| Tela | Rota | O que faz |
|---|---|---|
| T01 · Cadastro do veículo | `/cadastro` | Cadastra o carro (e edita, se já existir) |
| T02 · Início | `/` | Veículo, gasto do mês, próximos vencimentos e últimos serviços |
| T03 · Novo serviço | `/servico/novo` | Registro rápido, com chips de tipo e foto da nota opcional |
| T04 · Gastos | `/gastos` | Visão mensal e anual, comparativo, gráfico por mês e por categoria |
| T05 · Alertas | `/alertas` | Revisões por km ou data, com "Marcar como feito" |
| T06 · Documentos | `/documentos` | IPVA, licenciamento e seguro, com lembrete e "Marcar como pago" |
| T07 · Histórico | `/historico` | Resumo, linha do tempo, "Gerar PDF" e "Compartilhar link" |
| Relatório público | `/relatorio/:token` | Visão somente leitura para quem recebeu o link |

## Identidade visual

As cores ficam em `src/styles/tema.css`, tiradas da logo: preto `#0B0B0B`, vermelho `#E10600` e branco. Os status usam verde (em dia), amarelo (em breve) e vermelho (atenção e vencido).

## Testes

```bash
npm test              # na raiz roda os testes do back-end e do front-end
npm --prefix frontend test   # só os do front-end (48 testes)
```

As telas são testadas com uma API simulada (`src/test/api-falsa.js`), então os testes não dependem do back-end.
