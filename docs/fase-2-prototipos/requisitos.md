# Entendimento de Requisitos – MotorHub

**Projeto Integrador · Design Profissional · Fase 2 · 27/10/2026**

> 📄 Versão em PDF: [`requisitos.pdf`](requisitos.pdf) · Base: [`pesquisa-de-campo.md`](../fase-1-pesquisa/pesquisa-de-campo.md)

---

## 1. Visão geral

### Problema

Quem tem carro raramente sabe quanto gasta com ele. Notas e comprovantes ficam espalhados entre caixas, planilhas, fotos e papéis perdidos, e a manutenção costuma acontecer só depois que algo quebra. Na pesquisa de campo, **nenhum dos quatro entrevistados** soube dizer quanto gastou nos últimos 12 meses, e o caso mais grave resultou em câmbio e mecatrônica quebrados e 4 meses de carro parado.

### Público-alvo

Proprietários de carro, em especial de veículos usados, que cuidam da manutenção por conta própria, rodam entre 400 e 800 km por mês e usam principalmente o celular.

### Proposta de valor

O **MotorHub** é o prontuário digital do veículo: registra serviços em poucos toques, mostra quanto o carro custa, avisa o que está para vencer e entrega um histórico confiável na hora de vender. O valor está em **evitar prejuízo**, o que se conecta ao ROI pessoal e à taxa de abandono de 78% em 30 dias da pesquisa do professor.

---

## 2. Personas

As personas abaixo são **compostas a partir das quatro entrevistas** (E1 a E4). Os nomes são fictícios; as falas entre aspas são dos entrevistados.

### Persona 1 – Lucas, o Organizado (base: E1)

- **Perfil:** 18 a 25 anos, carro usado para passeio, cuida do carro sozinho.
- **Hoje:** guarda as notas numa caixa no carro e anota a troca de óleo numa planilha. Mesmo assim, não sabe de imediato quanto gastou no ano.
- **Quer:** ver os números organizados, com análise no computador, e uma lista de melhorias futuras para o carro.
- **Desiste se:** o preenchimento for complexo.
- **Pagamento:** aceita mensalidade (R$ 5 a R$ 10).

### Persona 2 – Marcos, o Reativo (base: E2 e E3)

- **Perfil:** 20 a 35 anos, carro usado ou herdado, às vezes dividido com a família.
- **Hoje:** só leva o carro ao mecânico quando dá problema. Perde notas, depende do adesivo no para-brisa e já esqueceu IPVA e licenciamento.
- **Dor central:** manutenção pulada gera prejuízo alto. *"No futuro poderiam custar muito dinheiro"* (E2).
- **Quer:** registrar sem esforço (foto da nota ou a oficina lançar) e evitar surpresas caras.
- **Desiste se:** o preço for absurdo.
- **Pagamento:** prefere plano anual ou pagamento único, porque manutenção não acontece todo mês.

### Persona 3 – Bruno, o Preventivo com Receio (base: E4)

- **Perfil:** 20 a 30 anos, roda muito (cerca de 800 km por mês), usa o carro para tudo.
- **Hoje:** tenta fazer a manutenção no prazo, mas já deixou passar uma troca de óleo e pagou mais caro. Deixa documentos para a última hora.
- **Dor central:** gastos inesperados e a quantidade de datas para lembrar. *"Se tivesse recebido um lembrete, provavelmente teria evitado esse gasto."*
- **Quer:** alertas, estimativa dos próximos gastos e histórico confiável para comprar e vender. Prefere foto da nota e apps simples, como o Nubank.
- **Desiste se:** o app for complicado, tiver muitos anúncios ou cobrar caro pelas funções principais.
- **Pagamento:** prefere versão gratuita; pagaria cerca de R$ 10 por mês por funções extras.

---

## 3. Jornada do usuário

Jornada de referência, com foco no usuário que mais sofre com o problema (Marcos e Bruno).

| Etapa | Ação do usuário | Dor ou risco | Oportunidade no MotorHub | Tela |
|---|---|---|---|---|
| **1. Começar** | Baixa o app e cadastra o carro | Desistir se o cadastro for longo | Cadastro curto, só com o essencial | T01 |
| **2. Registrar** | Registra o serviço logo após sair da oficina | Nota perdida; preguiça de preencher | Registro em poucos toques e foto da nota | T03 |
| **3. Acompanhar** | Abre o app para ver como o carro está | Não sabe o que vence nem quando | Tela inicial com resumo e próximos vencimentos | T02 |
| **4. Prevenir** | Recebe alerta de revisão ou de documento | Esquecer troca de óleo, IPVA ou licenciamento | Alertas por km e data; lembretes de documentos | T05, T06 |
| **5. Entender gastos** | Consulta quanto gastou no mês e no ano | Gastos inesperados; nenhum total à mão | Painel de gastos por categoria | T04 |
| **6. Vender** | Gera o histórico para mostrar ao comprador | Falta de prova de manutenção | Relatório exportável em PDF ou link | T07 |

---

## 4. Requisitos funcionais

**Prioridade:** MVP = entra na primeira versão funcional; Futuro = fica para versões posteriores.

| ID | Requisito | Prioridade | Evidência na pesquisa |
|---|---|---|---|
| RF01 | Cadastrar o veículo (marca, modelo, ano, placa e km atual) | MVP | Registros espalhados (E1 a E4) |
| RF02 | Registrar serviço com data, km, tipo de serviço, valor e oficina | MVP | Medo de preenchimento complexo (E1, E4) |
| RF03 | Anexar foto da nota fiscal ao serviço (opcional) | MVP | E2 e E4 preferem foto; E3 aceita |
| RF04 | Permitir registro manual, sem foto | MVP | E1 prefere digitar à mão |
| RF05 | Exibir painel de gastos mensal e anual, por categoria | MVP | Controle de gastos em 1º lugar (22 pontos) |
| RF06 | Alertar revisões por quilometragem e por data | MVP | Manutenção só corretiva (E2, E3, E4) |
| RF07 | Lembrar IPVA, licenciamento e seguro | MVP | Atraso e esquecimento (E3, E4) |
| RF08 | Exibir o histórico do veículo em linha do tempo | MVP | Histórico "passa confiança" (E1, E3, E4) |
| RF09 | Gerar relatório de histórico exportável (PDF ou link) para venda | MVP | Falta de histórico na compra e venda (E1, E3, E4) |
| RF10 | Oferecer plano gratuito com funções principais e plano pago | MVP | Resistência a preço alto (E2, E3, E4) |
| RF11 | Permitir que a oficina lance o serviço | Futuro | E2 e E3 aceitam esse modo |
| RF12 | Estimar próximos gastos e avisar peças com troca próxima | Futuro | Pedido do E4 |
| RF13 | Manter lista de desejos com custo estimado por item | Futuro | Pedido do E1 |
| RF14 | Comparar preços de oficinas | Futuro | Último lugar no ranking (7 pontos) |

---

## 5. Requisitos não funcionais

| ID | Requisito | Justificativa |
|---|---|---|
| RNF01 | **Mobile-first:** o design parte do celular | Todos os entrevistados usariam no celular |
| RNF02 | **Registro rápido:** registrar um serviço em poucos toques, com campos mínimos | Simplicidade decide a permanência (E1, E4) |
| RNF03 | **Interface simples e clara**, com a referência de apps como o Nubank | Citado pelo E4 |
| RNF04 | **Sem anúncios intrusivos** nas funções principais | Motivo de desistência do E4 |
| RNF05 | **Funcionar também no computador** para consultar e analisar dados | E1 analisaria os dados no computador |
| RNF06 | **Privacidade dos dados:** cada usuário acessa só os próprios registros | Boa prática e conformidade com a LGPD |
| RNF07 | **Execução local** completa, para a demonstração de 17/11 | Exigência do enunciado |

---

## 6. Regras de negócio

- **RN01.** Um alerta de revisão dispara pelo que ocorrer primeiro: a quilometragem ou a data configurada.
- **RN02.** Todo serviço registrado alimenta, ao mesmo tempo, o histórico, o painel de gastos e o cálculo do próximo alerta.
- **RN03.** A foto da nota é sempre opcional; nenhum registro deve ser bloqueado por falta dela.
- **RN04.** Os lembretes de IPVA, licenciamento e seguro seguem as datas informadas pelo usuário e podem ser pré-preenchidas com o calendário do estado.
- **RN05.** O relatório de histórico só inclui serviços registrados pelo próprio usuário do veículo.

### Modelo de cobrança a validar

- **Gratuito:** cadastro, registro de serviços, painel de gastos e alertas principais, sem anúncios intrusivos.
- **Plano pago anual:** funções extras. A opção mensal de cerca de R$ 10 fica como alternativa, já que E1 e E4 a aceitam e E2 e E3 preferem anual ou pagamento único.

---

## 7. Fora do escopo do MVP

- Lançamento do serviço pela oficina (RF11)
- Estimativa de próximos gastos e aviso de peças (RF12)
- Lista de desejos com custo estimado (RF13)
- Comparação de preços de oficinas (RF14)

---

## 8. Telas do protótipo

| ID | Tela | Requisitos atendidos |
|---|---|---|
| T01 | Cadastro do veículo | RF01 |
| T02 | Início (resumo, próximos vencimentos e últimos serviços) | RF08 |
| T03 | Registro rápido de serviço, com foto da nota | RF02, RF03, RF04 |
| T04 | Painel de gastos | RF05 |
| T05 | Alertas de revisão | RF06 |
| T06 | Lembretes de IPVA, licenciamento e seguro | RF07 |
| T07 | Relatório de histórico para venda | RF08, RF09 |

---

## 9. Rastreabilidade: da dor ao requisito e à tela

| Dor (matriz de dores) | Requisitos | Telas |
|---|---|---|
| Não sabe quanto gasta com o carro | RF05 | T04 |
| Manutenção só corretiva, com prejuízo | RF06 | T05 |
| Registros espalhados ou perdidos | RF01, RF02, RF03, RF08 | T01, T02, T03 |
| Esquecimento ou atraso de IPVA e licenciamento | RF07 | T06 |
| Falta de histórico na compra e venda | RF08, RF09 | T07 |
| Gastos inesperados | RF05, RF06 (RF12 no futuro) | T04, T05 |
| Medo de app complexo | RF02, RF04, RNF02, RNF03 | T03 |
| Rejeição a preço alto, mensalidade ou anúncios | RF10, RNF04 | Plano gratuito |
| Ideias de melhoria se perdem | RF13 (futuro) | Fora do MVP |
