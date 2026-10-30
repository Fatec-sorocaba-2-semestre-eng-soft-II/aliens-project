# 👽 Alien Management System (AMS)

**Sistema de Gerenciamento de Missões e Operações Alienígenas**

O Alien Management System (AMS) é um sistema desenvolvido para centralizar e organizar as operações do comando alienígena, permitindo o gerenciamento de missões, humanos, tripulantes, naves, pesquisas científicas, rotas e frotas.

O projeto tem como objetivo substituir os controles descentralizados realizados por documentos Word, planilhas Excel e registros físicos, proporcionando maior organização, rastreabilidade e controle das operações.

---

# 📑 Sumário

1. [Visão Geral](#-1-visão-geral)
2. [Contexto do Projeto](#-2-contexto-do-projeto)
3. [Problema Identificado](#-3-problema-identificado)
4. [Objetivos do Sistema](#-4-objetivos-do-sistema)
5. [Stakeholders](#-5-stakeholders)
6. [Atores do Sistema](#-6-atores-do-sistema)
7. [Processos do Negócio](#-7-processos-do-negócio)
8. [Módulos do Sistema](#-8-módulos-do-sistema)
9. [Requisitos Funcionais](#-9-requisitos-funcionais)
10. [Requisitos Não Funcionais](#-10-requisitos-não-funcionais)
11. [Regras de Negócio](#-11-regras-de-negócio)
12. [Restrições e Permissões](#-12-restrições-e-permissões)
13. [Integrações e Sistemas Externos](#-13-integrações-e-sistemas-externos)
14. [Entidades e Informações Gerenciadas](#-14-entidades-e-informações-gerenciadas)
15. [Casos de Uso](#-15-casos-de-uso)
16. [Backlog do Produto](#-16-backlog-do-produto)
17. [Definições Consolidadas do Discovery](#-17-definições-consolidadas-do-discovery)
18. [Pontos em Aberto](#-18-pontos-em-aberto)
19. [Documentação do Projeto](#-19-documentação-do-projeto)
20. [Equipe](#-20-equipe)
21. [Mapa Inicial do Discovery](#-21-mapa-inicial-do-discovery)

---

# 👾 1. Visão Geral

| Informação | Descrição |
|---|---|
| Nome do sistema | Alien Management System |
| Sigla | AMS |
| Domínio | Gerenciamento de operações alienígenas |
| Solicitante | CEO do comando dos aliens |
| Usuários | CEO, Comandante, Cientista e Piloto |
| Instituição | FATEC Sorocaba |
| Curso | Tecnologia em Análise e Desenvolvimento de Sistemas |
| Disciplina | Engenharia de Software II |

O AMS tem como propósito centralizar as informações operacionais do comando alienígena, oferecendo recursos para controlar as missões de abdução, seus participantes, os humanos envolvidos, as naves utilizadas e os relatórios gerados durante as operações.

# 🌌 2. Contexto do Projeto

Atualmente, o comando alienígena realiza o gerenciamento das operações utilizando diferentes ferramentas e documentos.

Os relatórios das missões são elaborados em documentos Word, enquanto os cadastros de humanos são mantidos em planilhas Excel.

Também existem cadernos físicos separados por mês e por equipe, sendo que cada equipe possui uma cor de identificação.

Esses cadernos contêm informações como:

- Local da abdução;
- Data da missão;
- Horário;
- Humano abduzido;
- Relatório geral da missão;
- Assinatura do comandante responsável.

A ausência de centralização dessas informações dificulta o acompanhamento das operações e a consulta aos registros históricos.

# 🚨 3. Problema Identificado

Os principais problemas identificados no processo atual são:

1. Falta de histórico de abduções.
2. Dificuldade para identificar quem realizou cada abdução.
3. Desorganização no agendamento das abduções.
4. Conflitos de horários entre missões.
5. Humanos que não são devolvidos no mesmo local.
6. Desorganização na escala de aliens.
7. Falta de cadastro estruturado de humanos.
8. Falta de controle sobre o status de manutenção das naves.

O AMS pretende solucionar esses problemas por meio da centralização dos registros e do gerenciamento integrado das operações.

# 🎯 4. Objetivos do Sistema

Os objetivos identificados são:

- Centralizar o gerenciamento das missões.
- Manter o histórico das abduções.
- Cadastrar e gerenciar humanos.
- Cadastrar e gerenciar tripulantes.
- Controlar as autorizações das missões.
- Organizar o agendamento das operações.
- Evitar conflitos de horários.
- Registrar os locais de abdução e devolução.
- Gerenciar naves e seus respectivos estados.
- Controlar a manutenção das naves.
- Gerenciar pesquisas científicas.
- Gerenciar rotas.
- Gerenciar frotas.
- Gerar relatórios operacionais e administrativos.
- Respeitar a hierarquia organizacional dos aliens.

# 👥 5. Stakeholders

| Stakeholder | Responsabilidade |
|---|---|
| CEO | Solicitante do sistema e responsável pela administração geral do comando |
| Comandantes | Responsáveis pela administração operacional das missões |
| Cientistas | Responsáveis pelas atividades e pesquisas científicas |
| Pilotos | Responsáveis pela operação das naves e gerenciamento de rotas |
| Tripulantes | Participantes das operações realizadas pelas naves |

# 🛸 6. Atores do Sistema

## 6.1 CEO

Responsável pelo controle administrativo geral do sistema.

Principais responsabilidades:

- Gerenciar comandantes.
- Cadastrar comandantes.
- Gerenciar frotas.
- Gerenciar naves.
- Remover naves.
- Remover comandantes.
- Criar missões.
- Consultar informações gerenciais.

## 6.2 Comandante

Responsável pelo gerenciamento operacional das missões.

Principais responsabilidades:

- Agendar missões.
- Gerenciar missões.
- Gerar relatórios de missão.
- Gerenciar status das missões.
- Cadastrar tripulantes.
- Cadastrar cientistas.
- Cadastrar pilotos.
- Cadastrar humanos.
- Gerenciar localização dos humanos.
- Cadastrar naves.
- Gerenciar o status da própria nave.

## 6.3 Cientista

Responsável pelas atividades científicas realizadas durante as missões.

Principais responsabilidades:

- Gerar relatórios de pesquisa.
- Consultar informações das pesquisas.
- Modificar o status da pesquisa.

## 6.4 Piloto

Responsável pela operação e gerenciamento das naves.

Principais responsabilidades:

- Gerar relatórios da nave.
- Modificar o status da própria nave.
- Gerenciar rotas.

---

# ⚙️ 7. Processos do Negócio

Os processos identificados no levantamento são organizados nas seguintes categorias.

## 7.1 Gestão de Humanos

- Cadastro de humanos.
- Registro de localização.
- Registro do local de abdução.
- Registro do local de devolução.
- Consulta de informações relacionadas às abduções.

## 7.2 Gestão de Missões

- Criação de missões.
- Autorização de missões.
- Agendamento de missões.
- Consulta de missões.
- Gerenciamento de participantes.
- Gerenciamento de status.
- Cancelamento de missões.
- Geração de relatórios.

## 7.3 Gestão de Tripulantes

- Cadastro de cientistas.
- Cadastro de pilotos.
- Cadastro de comandantes.
- Associação de participantes às missões.

## 7.4 Gestão de Naves

- Cadastro de naves.
- Consulta de status.
- Controle de manutenção.
- Geração de relatórios.
- Controle de disponibilidade.

## 7.5 Gestão de Pesquisas

- Geração de relatórios científicos.
- Atualização de status das pesquisas.

## 7.6 Gestão de Rotas

- Gerenciamento de rotas das naves.
- Registro das informações relacionadas às rotas.

## 7.7 Gestão de Frotas

- Cadastro e gerenciamento de frotas.
- Gerenciamento das naves pertencentes às frotas.
- Consulta do status geral das naves.

---

# 🧩 8. Módulos do Sistema

A organização funcional do AMS contempla os seguintes módulos:

| Módulo | Descrição |
|---|---|
| Módulo 1 — Gestão de Humanos | Cadastro, localização e histórico de humanos |
| Módulo 2 — Gestão de Missões | Criação, autorização, agendamento, acompanhamento e encerramento |
| Módulo 3 — Gestão de Tripulantes | Cadastro e gerenciamento dos integrantes das equipes |
| Módulo 4 — Gestão de Naves | Cadastro, disponibilidade, manutenção e relatórios |
| Módulo 5 — Gestão de Pesquisas | Gerenciamento de pesquisas científicas e relatórios |
| Módulo 6 — Gestão de Rotas | Gerenciamento das rotas das naves |
| Módulo 7 — Gestão de Frotas | Administração e acompanhamento das frotas |
| Módulo 8 — Relatórios | Geração e consulta dos relatórios operacionais |
| Módulo 9 — Segurança e Controle de Acesso | Respeito à hierarquia e às permissões dos usuários |
| Módulo 10 — Backup e Recuperação | Recuperação dos dados armazenados no sistema |

---

# 📋 9. Requisitos Funcionais

Os requisitos funcionais identificados no levantamento inicial são:

| ID | Requisito |
|---|---|
| RF-001 | Cadastrar humanos |
| RF-002 | Cadastrar tripulantes |
| RF-003 | Cadastrar comandantes |
| RF-004 | Cadastrar naves |
| RF-005 | Agendar missões |
| RF-006 | Consultar missões |
| RF-007 | Registrar participantes das missões |
| RF-008 | Registrar o responsável pela autorização da missão |
| RF-009 | Registrar o local de abdução e devolução |
| RF-010 | Gerenciar missões e seus status |
| RF-011 | Gerar relatórios de missões |
| RF-012 | Gerar relatórios de pesquisas |
| RF-013 | Gerenciar status das pesquisas |
| RF-014 | Gerenciar naves e seus status |
| RF-015 | Consultar status das naves |
| RF-016 | Gerar relatórios das naves |
| RF-017 | Gerenciar rotas |
| RF-018 | Gerenciar frotas |
| RF-019 | Gerenciar status de todas as naves da frota |

Os identificadores RF apresentados são referências organizacionais deste documento.

# 🔒 10. Requisitos Não Funcionais

| ID | Requisito | Descrição |
|---|---|---|
| RNF-001 | Desempenho | Resposta de até 5 segundos |
| RNF-002 | Responsividade | Sistema responsivo às naves e dispositivos |
| RNF-003 | Comunicação | Permitir comunicação entre naves |
| RNF-004 | Segurança | Possuir sistema de segurança, incluindo firewall |
| RNF-005 | Usabilidade | Interface intuitiva e fácil de utilizar |
| RNF-006 | Acessibilidade | Acessível a aliens com necessidades especiais |
| RNF-007 | Ética | Ser ético para todos os aliens |
| RNF-008 | Hierarquia | Respeitar a hierarquia organizacional |
| RNF-009 | Proteção de dados | Respeitar a LGPD intergalática |
| RNF-010 | Documentação | Possuir documentação do sistema |

# 📜 11. Regras de Negócio

As regras de negócio identificadas são:

| ID | Regra |
|---|---|
| RN-001 | Uma nave em manutenção não pode participar de uma missão. |
| RN-002 | Uma nave não pode participar de duas missões no mesmo horário. |
| RN-003 | Um humano não pode ser alvo de duas missões no mesmo horário. |
| RN-004 | Toda missão deve possuir um responsável/autorizador registrado. |
| RN-005 | O CEO é responsável pela criação das missões. |
| RN-006 | O comandante é responsável pelo agendamento das missões. |
| RN-007 | Uma missão agendada já foi autorizada. |
| RN-008 | O comandante ou o CEO pode cancelar uma missão, desde que apresente uma justificativa. |

**Observação:** RN-005 a RN-008 foram registradas nas conversas de Discovery do projeto. As regras RN-001 a RN-004 constam no documento original de levantamento.

# 🔐 12. Restrições e Permissões

## 12.1 CEO

- Possui controle administrativo geral.
- É o único que pode remover comandantes.
- É o único que pode remover naves.
- É o único que pode gerenciar frotas.

## 12.2 Comandante

- Gerencia missões.
- Gera relatórios de missões.
- Gerencia status de missões.
- Cadastra tripulantes.
- Cadastra humanos.
- Cadastra naves.
- Gerencia o status da própria nave.

## 12.3 Cientista

- Gera relatórios de pesquisa.
- Modifica o status da pesquisa.

## 12.4 Piloto

- Gera relatórios da própria nave.
- Modifica o status da própria nave.
- Gerencia rotas.

As permissões completas ainda dependem da definição de uma matriz de acesso detalhada.

# 🌐 13. Integrações e Sistemas Externos

## 13.1 ANDRÓLIEN

O levantamento inicial menciona o sistema ANDRÓLIEN, utilizado por outra raça alienígena na Galáxia de Andrômeda.

O documento também menciona que o comando usuário do AMS utiliza um sistema operacional semelhante ao Android.

Não existe confirmação documental de integração entre o AMS e o ANDRÓLIEN.

## 13.2 Comunicação entre Naves

A comunicação entre naves é mencionada como requisito não funcional.

Os detalhes dessa comunicação ainda precisam ser definidos.

---

# 🗂️ 14. Entidades e Informações Gerenciadas

As principais entidades identificadas são:

| Entidade | Informações conhecidas |
|---|---|
| Humano | Cadastro, localização e registros de abdução |
| Missão | Data, horário, local, humano, participantes, autorizador, status e relatório |
| Tripulante | Identificação e função |
| Comandante | Cadastro e gerenciamento de missões |
| Cientista | Cadastro e informações de pesquisa |
| Piloto | Cadastro e informações operacionais |
| Nave | Cadastro, condição, status e relatórios |
| Pesquisa | Relatórios e status |
| Rota | Informações e gerenciamento de rotas |
| Frota | Conjunto de naves e seus respectivos status |

Os atributos completos de cada entidade ainda precisam ser consolidados.

# 📊 15. Casos de Uso

O documento original apresenta um diagrama de casos de uso na página 6.

As funcionalidades representadas incluem:

- Cadastro de comandantes.
- Gerenciamento de frotas.
- Consulta de status das naves.
- Gerenciamento de missões.
- Geração de relatórios de missão.
- Cadastro de tripulantes.
- Cadastro de cientistas.
- Cadastro de pilotos.
- Cadastro de humanos.
- Cadastro de naves.
- Gerenciamento de naves.
- Geração de relatórios de pesquisa.
- Alteração de status de pesquisa.
- Geração de relatórios de naves.
- Gerenciamento de rotas.

---

# 📚 16. Backlog do Produto

O backlog do AMS foi organizado seguindo uma estrutura hierárquica de gestão de requisitos:

```text
EPIC
  └── FEATURE
        └── USER STORY
```

## 16.1 Identificadores

| Elemento | Padrão |
|---|---|
| Epic | EPIC-XXX |
| Feature | FEAT-XXX |
| User Story | US-XXX |

Os identificadores devem ser estáveis e preservados durante as revisões do backlog.

## 16.2 Estrutura das User Stories

Cada User Story deverá conter:

- ID;
- Título;
- Epic;
- Feature, quando aplicável;
- Objetivo;
- Ator;
- História de usuário;
- Descrição detalhada;
- Prioridade;
- Valor de negócio.

## 16.3 Priorização

Foi estabelecido o uso das classificações:

- **P — Pequeno**
- **M — Médio**
- **G — Grande**

Essas classificações foram utilizadas no processo de avaliação de prioridade das histórias.

## 16.4 Identificação do backlog

O histórico do projeto registra histórias até `US-028`, incluindo:

**US-028 — Restaurar dados a partir de backup**

O detalhamento integral das Epics, Features e User Stories deve ser mantido na documentação consolidada do backlog, preservando os IDs originais.

---

# 🧭 17. Definições Consolidadas do Discovery

As seguintes definições foram registradas durante as conversas de Discovery:

| Assunto | Definição registrada |
|---|---|
| Criação de missão | Responsabilidade do CEO |
| Agendamento | Responsabilidade do comandante |
| Autorização | Uma missão agendada já foi autorizada |
| Cancelamento | Pode ser realizado pelo comandante ou CEO |
| Justificativa | Cancelamentos devem apresentar justificativa |
| Revisão | Existe um fluxo que retorna o status para aguardando revisão do comandante |
| Consultas | Há contextos de consulta que consideram missões agendadas e encerradas |

Essas definições representam o conhecimento registrado no projeto. Os fluxos completos e as transições de status devem permanecer rastreáveis nos requisitos correspondentes.

---

# ❓ 18. Pontos em Aberto

As questões abaixo representam informações que ainda necessitam de esclarecimento ou detalhamento.

Os identificadores OPEN são estáveis nesta documentação e estão organizados por módulo.

## Módulo 1 — Humanos e Histórico de Abduções

- **OPEN-001:** Uma pessoa pode ser abduzida mais de uma vez?
- **OPEN-002:** Quais dados dos humanos precisam ser cadastrados?
- **OPEN-003:** Quais informações devem compor o histórico de abduções?
- **OPEN-004:** O local de devolução precisa ser obrigatoriamente o mesmo da abdução?
- **OPEN-005:** Quem pode cadastrar ou atualizar a localização de um humano?

## Módulo 2 — Missões, Autorização e Agendamento

- **OPEN-006:** Existe limite de duração para uma missão?
- **OPEN-007:** Quem pode autorizar uma missão?
- **OPEN-008:** Quais são as etapas entre criação e agendamento?
- **OPEN-009:** Quais justificativas são aceitas para cancelamento?
- **OPEN-010:** Quais são os status oficiais das missões?
- **OPEN-011:** Em quais situações a missão retorna para aguardando revisão do comandante?
- **OPEN-012:** Quais perfis podem consultar missões?
- **OPEN-013:** Quais condições caracterizam o encerramento de uma missão?

## Módulo 3 — Participantes, Tripulação e Hierarquia

- **OPEN-014:** Quais tipos de participantes podem ser associados às missões?
- **OPEN-015:** Como deve funcionar a escala de aliens?
- **OPEN-016:** Quais dados são obrigatórios para cadastrar cientistas e pilotos?
- **OPEN-017:** Quem pode cadastrar, alterar, inativar ou remover comandantes?
- **OPEN-018:** Qual é a matriz completa de permissões?
- **OPEN-019:** Como funciona a associação entre tripulantes e naves?

## Módulo 4 — Naves e Manutenção

- **OPEN-020:** Quais são os status oficiais de uma nave?
- **OPEN-021:** Quem pode iniciar, atualizar e encerrar uma manutenção?
- **OPEN-022:** Como tratar uma nave que entra em manutenção quando possui missão agendada?
- **OPEN-023:** Quais informações devem constar no relatório da nave?
- **OPEN-024:** O que significa a expressão própria nave?
- **OPEN-025:** Quais condições devem ser verificadas antes da remoção de uma nave?

## Módulo 5 — Pesquisa Científica

- **OPEN-026:** Quais informações devem compor um relatório de pesquisa?
- **OPEN-027:** Quais são os status possíveis de uma pesquisa?
- **OPEN-028:** Como as pesquisas se relacionam com missões, humanos e cientistas?
- **OPEN-029:** Quais perfis podem consultar os relatórios de pesquisa?

## Módulo 6 — Rotas e Logística

- **OPEN-030:** Quais informações compõem uma rota?
- **OPEN-031:** O piloto pode gerenciar somente rotas da própria nave?
- **OPEN-032:** Como registrar alterações de rota durante uma missão?
- **OPEN-033:** Como validar e registrar o local efetivo de devolução?

## Módulo 7 — Frotas e Gestão Administrativa

- **OPEN-034:** Como as naves são agrupadas em frotas?
- **OPEN-035:** Quais informações devem aparecer no status consolidado de uma frota?
- **OPEN-036:** Quais operações estão incluídas no gerenciamento exclusivo do CEO?
- **OPEN-037:** O que acontece com os registros vinculados a um comandante removido?

## Módulo 8 — Relatórios e Rastreabilidade

- **OPEN-038:** Qual é o modelo completo do relatório de missão?
- **OPEN-039:** A assinatura do comandante será mantida no sistema?
- **OPEN-040:** Quais alterações precisam registrar autoria, data e horário?
- **OPEN-041:** Quais relatórios precisam permitir consulta, filtros ou exportação?
- **OPEN-042:** Por quanto tempo os relatórios e históricos devem ser armazenados?

## Módulo 9 — Requisitos Não Funcionais, Segurança e Acessibilidade

- **OPEN-043:** Em quais condições deve ser garantido o tempo de resposta de até cinco segundos?
- **OPEN-044:** Quais dispositivos devem ser suportados?
- **OPEN-045:** Qual é a finalidade da comunicação entre naves?
- **OPEN-046:** Quais mecanismos de segurança serão necessários?
- **OPEN-047:** Quais critérios de acessibilidade devem ser atendidos?
- **OPEN-048:** Quais dados são protegidos pela LGPD intergalática?
- **OPEN-049:** Quais princípios definem a ética do sistema?
- **OPEN-050:** Quais documentos devem ser entregues e mantidos?

## Módulo 10 — Integrações e Ambiente Externo

- **OPEN-051:** Existe intenção de integrar o AMS ao ANDRÓLIEN?
- **OPEN-052:** Caso exista integração, quais dados devem ser enviados e recebidos?
- **OPEN-053:** A comunicação entre naves dependerá de um sistema externo?
- **OPEN-054:** Quais compatibilidades são esperadas em relação ao sistema operacional semelhante ao Android?

## Módulo 11 — Backup e Recuperação de Dados

- **OPEN-055:** Quais dados devem fazer parte dos backups?
- **OPEN-056:** Qual será a frequência e o período de retenção dos backups?
- **OPEN-057:** Quem poderá solicitar e executar uma restauração?
- **OPEN-058:** Como registrar as restaurações e tratar alterações realizadas após o backup?

---

# 📖 19. Documentação do Projeto

A documentação do AMS utiliza como fonte inicial o levantamento de requisitos realizado na disciplina Engenharia de Software II.

## Documento inicial

**Requisitos Alien-1.pdf**

Conteúdo:

- Identificação do projeto;
- levantamento de problemas;
- identificação dos usuários;
- descrição do processo atual;
- funcionalidades;
- regras de negócio;
- sistemas externos;
- restrições;
- requisitos funcionais;
- requisitos não funcionais;
- diagrama de casos de uso.

## Documentação complementar

O projeto também contempla os seguintes artefatos:

- Mapa Inicial do Discovery;
- Requisitos consolidados;
- Regras de negócio;
- Definição dos atores e permissões;
- Backlog do produto;
- Epics;
- Features;
- User Stories;
- Pontos em aberto do Discovery.

---

# 🎓 20. Equipe

Projeto desenvolvido por estudantes do curso de Tecnologia em Análise e Desenvolvimento de Sistemas da FATEC Sorocaba.

**Disciplina:** Engenharia de Software II

**Professor:** Glauco Todesco

**Integrantes:**

- Ágatha Cristina Marinho da Costa
- Ana Vitória Bernardes de Aguiar
- Alexandra Oliveira da Silva
- Júlia Ribeiro de Souza
- Larissa Vitória de Oliveira Maciel
- Sofia Oliveira da Silva
- Stella Maris Ferreira de Barros

**Local:** Sorocaba — SP

**Período do levantamento inicial:** Setembro de 2026

---

# 🗺️ 21. Mapa Inicial do Discovery

## MAPA INICIAL DO DISCOVERY

| Dimensão | Consolidação |
|---|---|
| Sistema | Alien Management System (AMS) |
| Contexto | Gerenciamento das operações de abdução do comando alienígena |
| Problema central | Informações descentralizadas e dificuldade de gerenciamento operacional |
| Solicitante | CEO |
| Atores | CEO, Comandante, Cientista e Piloto |
| Objetivos | Centralização, rastreabilidade, organização e controle |
| Processos | Missões, humanos, tripulação, naves, pesquisas, rotas e frotas |
| Regras principais | Controle de manutenção, conflitos de horários e registro de autorização |
| Restrições | Hierarquia e permissões específicas por perfil |
| Integrações | ANDRÓLIEN mencionado, sem integração confirmada |
| Requisitos de qualidade | Desempenho, segurança, acessibilidade, usabilidade e responsividade |
| Backlog | Estrutura Epic → Feature → User Story |
| Pontos em aberto | 58 questões organizadas em 11 módulos |

## Considerações finais

O Alien Management System representa uma proposta de centralização e organização das operações do comando alienígena.

A documentação apresentada consolida as informações identificadas nas fontes do projeto e nos registros de Discovery disponíveis, preservando as definições conhecidas e destacando os pontos que ainda precisam de confirmação.

O documento deverá evoluir conforme novos requisitos forem identificados, decisões forem registradas e as dúvidas em aberto forem esclarecidas.

---

**Alien Management System (AMS)**  
*Centralizando operações. Organizando missões. Mantendo o controle do universo alienígena.* 👽
