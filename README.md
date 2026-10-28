<p align="center">
  <img src="assets/logo/Logo%20MotorHub.jpeg" alt="Logo MotorHub" width="280">
</p>

<h1 align="center">MotorHub</h1>
<p align="center"><strong>Seu carro sempre em dia</strong></p>

<p align="center">
  Prontuário digital do veículo: registro de revisões, controle de gastos, alertas de manutenção e histórico para revenda.
</p>

---

## Sobre o projeto

O **MotorHub** é uma empresa de tecnologia simulada, criada para o **Projeto Integrador** da disciplina **Design Profissional** (Universidade Positivo), sob orientação do **Prof. Me. Sedenilso Antonio Machado**.

O segmento escolhido foi o **Hub Digital de Manutenção e Histórico Veicular**, que aparece com **79% de nível de necessidade** na pesquisa do professor.

### O problema

Quem tem carro raramente sabe quanto gasta com ele. Os comprovantes ficam espalhados entre caixas, planilhas, fotos e papéis perdidos. A manutenção costuma acontecer só depois que algo quebra. Na hora de vender, falta um histórico que comprove os cuidados com o veículo.

### A solução

Um app focado no celular, com foco em simplicidade, que reúne em um só lugar:

- o registro rápido de serviços (data, km, serviço, valor e oficina), com foto da nota opcional;
- um painel de gastos mensal e anual, por categoria;
- alertas de revisão por quilometragem e data;
- lembretes de IPVA, licenciamento e seguro;
- um relatório de histórico exportável para a revenda.

---

## Equipe

| Integrante | Função | Responsabilidades |
|---|---|---|
| **Thiago Siduovski** | CEO / Product Owner (Líder) | Coordenação da equipe e do cronograma, prioridades do MVP, modelo de negócio e pitch final |
| **Rafael Pilato** | Tech Lead / Desenvolvedor Full-stack | Arquitetura, front-end, back-end, banco de dados, repositório e execução local |
| **Arthur Korzeniewski** | UI/UX Designer | Identidade visual, guia de estilo, personas, jornada do usuário e protótipos |
| **Rafael de Oliveira** | UX Researcher & QA | Pesquisa de campo, validação com usuários, testes do MVP e relatório final |

---

## Fases do projeto

| Fase | Entrega | Data | Status |
|---|---|---|---|
| **Fase 1** – Pesquisa de Campo | Apresentação dos achados da pesquisa primária | 20/10 | ✅ Concluída |
| **Fase 2** – Requisitos e Prototipagem (UI/UX) | Requisitos e protótipo visual das telas | 27/10 | ✅ Concluída |
| **Fase 3/4** – Desenvolvimento | Aula prática, integração e repositório | 03/11 | ⏳ Pendente |
| **Fase 3/4** – Desenvolvimento e MVP | MVP funcional, testes locais e documentação | 10/11 | ⏳ Pendente |
| **Apresentação Final** | Pitch, demonstração ao vivo, relatório em PDF e link do GitHub | 17/11 | ⏳ Pendente |

---

## Fase 1 – Principais achados da pesquisa

A pesquisa entrevistou quatro proprietários de carro com um roteiro de 20 perguntas abertas.

- **Ninguém sabe quanto gasta com o carro.** Nenhum entrevistado tinha o total dos últimos 12 meses.
- **A manutenção é corretiva, não preventiva.** Um dos casos resultou em câmbio e mecatrônica quebrados e 4 meses de carro parado na oficina.
- **O histórico vale dinheiro na revenda.** Ele "passa confiança e credibilidade" na compra e na venda.
- **A simplicidade decide se o usuário fica.** Preenchimento complexo é o principal motivo de abandono.
- **Controle de gastos foi a funcionalidade nº 1 no ranking geral**, e a primeira escolha de três dos quatro entrevistados. Os alertas de revisão vieram em 2º lugar.

📄 Relatório completo: [`docs/fase-1-pesquisa/`](docs/fase-1-pesquisa/)

---

## Fase 2 – Requisitos e protótipo

A partir da pesquisa, foram definidos:

- **3 personas**: o Organizado, o Reativo e o Preventivo com Receio;
- **a jornada do usuário**, do cadastro do carro ao relatório de venda;
- **14 requisitos funcionais** (10 no MVP e 4 para versões futuras) e **7 requisitos não funcionais**;
- **7 telas** do protótipo visual, em formato de celular.

| Tela | Descrição |
|---|---|
| **T01** | Cadastro do veículo |
| **T02** | Início (resumo, próximos vencimentos e últimos serviços) |
| **T03** | Registro rápido de serviço, com foto da nota |
| **T04** | Painel de gastos |
| **T05** | Alertas de revisão |
| **T06** | Lembretes de IPVA, licenciamento e seguro |
| **T07** | Relatório de histórico para venda |

📄 Documento de requisitos: [`docs/fase-2-prototipos/requisitos.md`](docs/fase-2-prototipos/requisitos.md)
🎨 Telas do protótipo: [`docs/fase-2-prototipos/`](docs/fase-2-prototipos/)

---

## Escopo do MVP

Prioridade definida a partir da pesquisa de campo:

- [ ] Cadastro do veículo e registro rápido de serviço
- [ ] Painel de gastos mensal e anual
- [ ] Alertas de revisão por km e data
- [ ] Lembretes de IPVA, licenciamento e seguro
- [ ] Relatório de histórico exportável para venda

Ficam para **versões futuras**: lançamento do serviço pela oficina, estimativa de próximos gastos, lista de desejos com custo estimado e comparação de preços entre oficinas.

**Modelo de negócio a validar:** plano gratuito com as funções principais, mais um plano pago anual. A opção mensal de cerca de R$ 10 fica como alternativa.

---

## Estrutura do repositório

```
motorhub/
├── README.md
├── assets/
│   └── logo/                  # logo e variações
├── docs/
│   ├── fase-1-pesquisa/       # pesquisa de campo (PDF e Markdown)
│   ├── fase-2-prototipos/     # requisitos e telas do protótipo
│   └── relatorio-final/       # relatório entregue em 17/11
├── frontend/
└── backend/
```

---

## Tecnologias

> A definir na Fase 3/4 (front-end, back-end e banco de dados).

---

## Como executar localmente

> As instruções de instalação e execução serão adicionadas junto com o desenvolvimento do MVP.

---

<p align="center">
  Projeto Integrador · Design Profissional · Universidade Positivo · 2026
</p>