# Organizador de Convocação — Protótipo v1.0.0

> Ferramenta web desenvolvida em **Google Apps Script** para apoiar as comarcas do interior do Estado de Minas Gerais na geração automatizada e padronizada da lista de ordem de convocação de candidatos aprovados em editais de estágio e residência.

---

## Contexto

A **GEPER** (Gerência de Acompanhamento dos Programas de Estágio e Residência), em atuação conjunta com a **COSPERE** (Coordenadoria de Controle, Suporte e Pagamento de Estagiários e Residentes) e a **COAPER** (Coordenadoria de Admissão e Registros de Estagiários e Residentes), identificou um desafio recorrente nas comarcas do interior: a dificuldade de organizar corretamente a lista de candidatos aprovados conforme a ordem de convocação prevista em edital, especialmente diante da aplicação das reservas de vagas (cotas) e das múltiplas variáveis envolvidas.

Em resposta a essa demanda, formalizada via processo SEI **nº 0023724-88.2026.8.13.0000**, a **Unidade Avançada de Inovação em Laboratório — UAILAB** desenvolveu este protótipo como solução orientada, segura e padronizada para que as próprias comarcas possam gerar a ordem de convocação de forma autônoma.

---

## Objetivo

Permitir que os usuários das comarcas gerem, de forma automatizada, a lista de ordem de convocação de candidatos aprovados em editais de estágio, aplicando corretamente:

- A classificação geral dos candidatos (Ampla Concorrência — AC);
- As reservas de vagas para candidatos autodeclarados negros (Política de Negros — PN);
- As reservas de vagas para candidatos com deficiência (Pessoa com Deficiência — PcD);
- O padrão cíclico de distribuição definido pela administração central, configurável conforme as regras de cada edital.

---

## Benefícios

A adoção desta ferramenta representa uma mudança direta no fluxo de trabalho atual, no qual a maioria das comarcas podem enfrentar dificuldades para organizar corretamente a lista de convocação em razão da aplicação das reservas de vagas e das múltiplas variáveis envolvidas, gerando necessidade recorrente de intervenção da COSPERE para apoio e orientação. Os ganhos concretos em relação a esse padrão são:

- **Eliminação de erros na ordem de convocação:** as regras do edital são aplicadas automaticamente, removendo a dependência do conhecimento individual do servidor sobre um processo complexo e multivariável;
- **Autonomia das comarcas:** cada unidade gera a lista de forma independente, sem necessidade de contato com a COSPERE;
- **Redução de retrabalho:** elimina o ciclo de listas incorretas, correções e reenvios que hoje onera tanto as comarcas quanto a equipe central;
- **Celeridade no processo de admissão:** a geração imediata da lista correta acelera toda a cadeia subsequente de admissão dos estagiários;
- **Desoneração da COSPERE:** libera a equipe de atividades operacionais e repetitivas para atuação mais estratégica na gestão dos programas;
- **Padronização entre comarcas:** todas as unidades passam a seguir exatamente os mesmos critérios, independentemente do perfil ou experiência do servidor responsável;
- **Atualização centralizada do padrão:** quando as regras do edital mudam, o administrador ajusta a configuração uma única vez e todas as comarcas passam a operar com o novo padrão imediatamente.

---

## Arquitetura

A ferramenta é uma aplicação web hospedada integralmente no **Google Apps Script**, sem dependências externas de banco de dados ou back-end adicional.

### Estrutura de arquivos

```
Google Apps Script (Web App)
│
├── Código.gs
├── organizador-de-convocacao.html
├── admin.html
└── acesso-negado.html
```


### Descrição dos arquivos:

- **Código.gs:** roteamento, controle de acesso, persistência de configurações  
- **organizador-de-convocacao.html:** Interface pública (usuário das comarcas)  
- **admin.html:** Interface administrativa (somente para o proprietário do script)  
- **acesso-negado.html:** Página exibida quando usuário não autorizado tenta acessar o painel admin  


### Persistência de dados

As configurações de padrão de distribuição são armazenadas via `PropertiesService.getScriptProperties()` do Google Apps Script, garantindo que qualquer atualização feita pelo administrador seja imediatamente refletida para todos os usuários sem necessidade de redeploy.

---

## Perfis de Usuário

| Perfil | Acesso | Descrição |
|--------|--------|-----------|
| **Administrador** | `?page=admin` | Proprietário do script. Configura os blocos de distribuição padrão conforme regras do edital vigente. |
| **Usuário** | URL pública (padrão) | Servidores das comarcas. Realizam upload do CSV, conferem inconsistências, processam e exportam a lista de convocação. |

> **Importante:** O controle de acesso utiliza `Session.getActiveUser().getEmail()` e `Session.getEffectiveUser().getEmail()`. Esta verificação **funciona exclusivamente em contas institucionais** (Google Workspace corporativo/institucional). Em contas Google pessoais o e-mail pode retornar como `undefined` por restrições de segurança da plataforma. A ferramenta foi desenvolvida e homologada para uso exclusivo no **ambiente institucional do TJMG**.

---

## Fluxo de Uso

### Para o Administrador

1. Acessar a URL do script com o parâmetro `?page=admin`;
2. Configurar os **blocos de distribuição** conforme o padrão do edital vigente:
   - Definir o limite de posições de cada bloco;
   - Definir a sequência de tipos de vaga (AC, PN, PcD) dentro de cada bloco;
   - O último bloco sem limite definido é aplicado ciclicamente até o fim da lista;
3. Salvar a configuração — ela será carregada automaticamente por todos os usuários.

### Para o Usuário (Comarca)

```
[1] Upload do CSV → [2] Verificar Inconsistências → [3] Processar → [4] Visualizar e Exportar
```

1. **Upload:** Enviar o arquivo CSV com a lista de candidatos;
2. **Verificar Inconsistências:** Identificar e corrigir erros críticos antes do processamento;
3. **Processar:** A ferramenta aplica automaticamente os blocos de distribuição configurados e reclassifica os candidatos;
4. **Exportar:** Baixar o resultado em CSV ou imprimir a lista final de convocação.

---

## Formato do Arquivo CSV de Entrada

O arquivo deve estar no formato **CSV** (separador: vírgula ou ponto e vírgula) com codificação **UTF-8**, contendo obrigatoriamente as seguintes colunas:

| Coluna | Descrição |
|--------|-----------|
| `NOME` | Nome completo do candidato |
| `CLASSIFICACAO_GERAL` | Posição na lista de Ampla Concorrência |
| `CLASSIFICACAO_NEGRO` | Posição na lista de Política de Negros (PN). Vazio se não se aplica. |
| `CLASSIFICACAO_DEFICIENTE` | Posição na lista de Pessoas com Deficiência (PcD). Vazio se não se aplica. |

> Candidatos enquadrados simultaneamente como PN e PcD são processados conforme a necessidade de preenchimento das cotas previstas em edital.

---

## Regras de Negócio — Padrão de Distribuição

O padrão de fábrica (configurável pelo administrador) segue a sequência definida pela GEPER/COSPERE para os **20 primeiros candidatos**, organizada em dois blocos cíclicos:

### Bloco 1 — Posições 1 a 10

| Posição | Tipo |
|---------|------|
| 1ª e 2ª | AC |
| 3ª | PN |
| 4ª | AC |
| 5ª | PcD |
| 6ª | PN |
| 7ª e 8ª | AC |
| 9ª | PN |
| 10ª | AC |

### Bloco 2 — Posições 11 a 20 (padrão que se repete ciclicamente até o fim da lista)

| Posição | Tipo |
|---------|------|
| 11ª | AC |
| 12ª | PN |
| 13ª e 14ª | AC |
| 15ª | PcD |
| 16ª | PN |
| 17ª e 18ª | AC |
| 19ª | PN |
| 20ª | AC |

> **Regra de substituição:** Na ausência de candidatos disponíveis na categoria específica prevista para determinada posição, a vaga é preenchida pelo candidato com melhor classificação na Ampla Concorrência.

---

## Implantação (Deploy)

### Pré-requisitos

- Conta **institucional do TJMG** (Google Workspace);
- Acesso ao **Google Apps Script** (`script.google.com`);
- Permissão para publicar Web Apps na conta institucional.

### Passos

1. Acesse [script.google.com](https://script.google.com) com a conta institucional;
2. Crie um novo projeto e nomeie como **"Organizador de Convocação"**;
3. Adicione os seguintes arquivos ao projeto:
   - `Código.gs` — substituindo o arquivo `Código.gs` padrão;
   - `organizador-de-convocacao.html` — novo arquivo HTML;
   - `admin.html` — novo arquivo HTML;
   - `acesso-negado.html` — novo arquivo HTML;
4. Clique em **Implantar → Nova implantação**;
5. Configure:
   - **Tipo:** Aplicativo da Web;
   - **Executar como:** Eu (conta institucional do proprietário);
   - **Quem tem acesso:** Qualquer pessoa dentro de [domínio institucional do TJMG];
6. Autorize as permissões solicitadas;
7. Copie a **URL gerada** — esta é a URL pública para os usuários das comarcas;
8. A URL do painel administrativo é a mesma URL com `?page=admin` ao final.

---

## Controle de Acesso

| Rota | Permissão |
|------|-----------|
| URL pública | Qualquer usuário com conta institucional |
| `?page=admin` | Exclusivo para o proprietário do script (verificado via e-mail ativo vs. e-mail efetivo) |

Tentativas de acesso ao painel administrativo por usuários não proprietários são redirecionadas automaticamente para a página `acesso-negado.html`, que disponibiliza o botão de retorno à interface pública.

---

## Status do Projeto

> Este projeto está em **fase de homologação** junto às áreas demandantes (GEPER, COSPERE e COAPER). Não há módulos futuros planejados. Eventuais ajustes serão pontuais para adequação às regras de negócio identificadas durante a homologação.

---

## Referências

- Processo SEI: **0023724-88.2026.8.13.0000**
- Documento: Manifestação nº **25283161** — GEPER/COSPERE/COAPER, em 05/02/2026
- Unidade demandante: GEPER — Gerência de Acompanhamento dos Programas de Estágio e Residência
- Unidade desenvolvedora: UAILAB — Unidade Avançada de Inovação em Laboratório

---

## Observações

> Esta ferramenta é um **protótipo de uso interno**, desenvolvido exclusivamente para atender às demandas da **GEPER/COSPERE/COAPER** no âmbito do **Tribunal de Justiça do Estado de Minas Gerais — TJMG**.

---

*Desenvolvido pela UAILAB — Unidade Avançada de Inovação em Laboratório | TJMG*