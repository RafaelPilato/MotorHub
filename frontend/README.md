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

| Tela | Rota | Situação |
|---|---|---|
| T02 · Início | `/` | Pronta |
| T01 · Cadastro do veículo | `/cadastro` | Em construção |
| T03 · Novo serviço | `/servico/novo` | Em construção |
| T04 · Gastos | `/gastos` | Em construção |
| T05 · Alertas | `/alertas` | Em construção |
| T06 · Documentos | `/documentos` | Em construção |
| T07 · Histórico | `/historico` | Em construção |

## Identidade visual

As cores ficam em `src/styles/tema.css`, tiradas da logo: preto `#0B0B0B`, vermelho `#E10600` e branco. Os status usam verde (em dia), amarelo (em breve) e vermelho (atenção e vencido).

## Testes

```bash
npm test              # na raiz roda os testes do back-end e do front-end
npm --prefix frontend test   # só os do front-end (15 testes)
```

As telas são testadas com uma API simulada (`src/test/api-falsa.js`), então os testes não dependem do back-end.
