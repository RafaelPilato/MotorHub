# Guia de execução do MotorHub

Passo a passo para rodar o sistema **localmente**, do zero.

## 1. Pré-requisitos

| Ferramenta | Versão | Como conferir |
|---|---|---|
| Node.js | 18.11 ou superior (recomendado: versão LTS, 20 ou 22) | `node -v` |
| npm | já vem com o Node | `npm -v` |
| Git | qualquer versão recente | `git --version` |

Não é preciso instalar banco de dados: o MotorHub usa **SQLite**, que é só um arquivo criado automaticamente.

## 2. Baixar o projeto

```bash
git clone <link-do-repositorio>
cd <pasta-do-repositorio>
```

## 3. Instalar as dependências

Na **raiz** do repositório (a pasta que contém `backend/`, `frontend/` e `package.json`):

```bash
npm run install:all
```

O comando instala as dependências da raiz, do back-end e do front-end. Na primeira vez leva alguns minutos.

## 4. Rodar o sistema

Há duas formas. Use a primeira para desenvolver e a segunda para a demonstração.

### Opção A: modo desenvolvimento (API e site separados)

```bash
npm run seed     # (opcional) cria um carro e serviços de exemplo
npm run dev      # sobe a API e o site juntos
```

Abra **http://localhost:5173**. A API fica em http://localhost:3001.

### Opção B: modo demonstração (uma porta só)

```bash
npm run seed     # (opcional) dados de exemplo
npm run build    # compila o site
npm start        # o back-end serve a API e o site
```

Abra **http://localhost:3001**.

Para parar o sistema, use `Ctrl + C` no terminal.

## 5. Dados de exemplo ou começar do zero

- **Com dados de exemplo:** `npm run seed` cria um Chevrolet Onix 2018 com 13 serviços, 3 alertas de revisão e 3 documentos. Rodar de novo apaga tudo e recria.
- **Do zero (sem carro cadastrado):** pare o sistema, apague a pasta `backend/data/` e suba de novo. O app abre na tela de boas-vindas.

## 6. Testes automáticos

```bash
npm test
```

Roda os testes do back-end (31) e do front-end (48). Os testes usam banco temporário e API simulada, então não alteram os seus dados.

## 7. Conferindo se está funcionando

1. Abra `http://localhost:3001/api/saude` (ou 5173 em modo desenvolvimento). Deve aparecer `{"status":"ok","banco":"conectado",...}`.
2. Abra o site. Sem dados, aparece "Bem-vindo ao MotorHub". Com o seed, aparece o cartão do Onix.
3. Registre um serviço pelo botão **+ Registrar serviço** e veja o valor aparecer em **Gastos**.

## 8. Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `EADDRINUSE` ao subir | A porta 3001 ou 5173 já está em uso | Feche o outro programa, ou rode com outra porta: `PORT=3002 npm start` (no Windows: `set PORT=3002 && npm start`) |
| Erro ao instalar `better-sqlite3` | Versão do Node muito antiga ou muito nova | Use a versão LTS do Node e rode `npm run install:all` de novo |
| `Cannot find module` | Comando rodado fora da raiz, ou instalação incompleta | Volte à raiz (`cd ..`) e rode `npm run install:all` |
| Tela branca no navegador e erro `/src/main.jsx` no terminal | Arquivos do `frontend/` copiados na pasta errada | Confira se existe `frontend/src/main.jsx` |
| "Não foi possível conectar ao servidor" no site | A API não está rodando | Rode `npm run dev` (ou `npm start`) na raiz |
| Site abre mas está desatualizado (modo B) | O build é antigo | Rode `npm run build` e reinicie o `npm start` |

## 9. Limitações do MVP

- **Sem login:** o MVP é de uso local e trabalha com um único usuário e um veículo (o primeiro cadastrado).
- **Link compartilhado:** funciona para quem acessa o mesmo servidor. Em um computador local, o link só abre nesse computador ou na mesma rede, usando o IP dele no lugar de `localhost`.
- **Lembretes:** os avisos aparecem dentro do app; ainda não há notificações no celular nem envio por e-mail.
- **Lançamento pela oficina, estimativa de próximos gastos, lista de desejos e comparação de preços** ficaram para versões futuras (veja `docs/fase-2-prototipos/requisitos.md`).
