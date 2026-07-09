# SPEC-FE-002 — Módulo `instituicao/assinatura`

| | |
|---|---|
| **Repo** | `saaschurch` |
| **Fase** | F1 (plano) / F5 (seção de cobrança) |
| **Depende de** | `SPEC-BE-001` (planos), `SPEC-BE-004` (assinatura) |
| **Scaffold** | `/new-module instituicao/assinatura` + `/new-rtk-service assinatura` + `/new-rtk-service planos` |
| **Rota** | `app/(authenticated)/instituicao/assinatura/page.tsx` → `modules/instituicao-assinatura/` |

---

## Contexto

Tela onde a igreja vê o plano em que está: nome, fee de evento, limites, uso atual.

**Parceiros piloto estão em plano gratuito full.** Para eles, toda a seção de cobrança some — nada de "R$ 0,00/mês", nada de "próxima cobrança", nada de botão cancelar. A tela mostra um badge "Parceiro Piloto — Gratuito" e os limites (todos ilimitados).

Esta spec pode ser implementada na F1 sem a seção de cobrança (que depende de `SPEC-BE-004`, na F5). A parte gratuita — que é o que os pilotos precisam — não depende de Mercado Pago.

## Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | Exibir plano atual: nome, fee de evento, limites, uso atual (`x/y` eventos, `x/y` usuários). |
| RF-02 | **Plano gratuito:** exibir badge "Parceiro Piloto — Gratuito" e **ocultar** toda a seção de cobrança, valor, próxima cobrança e botão cancelar. Não mostrar "R$ 0,00/mês" — mostrar "Gratuito". |
| RF-03 | **Plano pago:** exibir status da assinatura, valor, próxima cobrança, botão cancelar (backoffice). |
| RF-04 | Assinatura `PENDING` → exibir CTA "Finalizar assinatura" apontando para o `initPoint`. |
| RF-05 | Vitrine de planos disponíveis, somente leitura. Trocar plano é ação de backoffice (RN-05), feita em [SPEC-FE-005](./SPEC-FE-005-backoffice-planos.md). |

## Contrato consumido

```http
GET /planos/meu
200 {
  "plano": {
    "codigo": "PILOTO_FREE",
    "nome": "Parceiro Piloto",
    "cobrancaSaaS": false,
    "feeEventoPercentual": "0.00",
    "features": { "pagamentosOnline": true, "relatorios": true },
    "limites": { "eventosAtivos": null, "usuarios": null }
  },
  "uso": { "eventosAtivos": 12, "usuarios": 40 },
  "assinatura": null,
  "parceiroPiloto": true
}

GET /billing/assinaturas
200 { "status": "AUTHORIZED", "valor": "99.00", "proximaCobranca": "2026-08-09", "plano": {...} }
200 { "status": null, "motivo": "PLANO_SEM_COBRANCA" }     # plano gratuito — NÃO é erro

GET /planos
200 { "planos": [ { "codigo": "...", "nome": "...", "valorMensal": "99.00", ... } ] }

PATCH /billing/assinaturas/:id/cancelar   # backoffice
```

`valorMensal` e `feeEventoPercentual` chegam como **string** (`Decimal` serializado). Nunca `Number()` antes de formatar.

## Regras de renderização

A decisão de mostrar ou não a seção de cobrança usa `plano.cobrancaSaaS`, **nunca** `plano.codigo === 'PILOTO_FREE'` nem `parceiroPiloto`. A flag `parceiroPiloto` serve só para o texto do badge.

| Condição | Renderiza |
|---|---|
| `cobrancaSaaS === false` | Badge "Gratuito". Sem seção de cobrança. Sem botão cancelar. |
| `cobrancaSaaS === true`, `assinatura.status === 'PENDING'` | CTA "Finalizar assinatura" → `initPoint`. |
| `cobrancaSaaS === true`, `assinatura.status === 'AUTHORIZED'` | Valor, próxima cobrança, botão cancelar (só backoffice). |
| `cobrancaSaaS === true`, `assinatura.status ∈ {PAUSED, CANCELLED}` | Alerta de assinatura inativa + CTA de regularização. |
| `limite === null` | "Ilimitado" — nunca "null", nunca "0". |

## Estrutura de arquivos

```
modules/instituicao-assinatura/
├── index.tsx                             # só JSX + useInstituicaoAssinatura()
├── styles.tsx
├── types.ts
├── hooks/use-instituicao-assinatura.tsx  # toda a lógica
├── helpers/
│   ├── constants.ts
│   ├── formatar-limite.ts                # null → "Ilimitado"
│   └── formatar-moeda.ts                 # opera sobre string, não Number
└── components/
    ├── PlanoBadge/                       # index.tsx + styles.tsx + hooks/
    ├── CartaoCobranca/                   # só renderizado se cobrancaSaaS
    └── VitrinePlanos/
```

```
app/(authenticated)/instituicao/assinatura/page.tsx   # wrapper fino
config/redux/api/planosApi.ts                         # /new-rtk-service
config/redux/api/assinaturaApi.ts                     # /new-rtk-service
```

Adicionar `'Plano'` e `'Assinatura'` a `tagTypes` em `baseApi.ts`.

`PlanoBadge` é reutilizado na `Navbar` — vale extraí-lo com API própria desde o início.

## Critérios de aceite

```gherkin
Cenário: Plano gratuito não mostra cobrança
  Dado plano com cobrancaSaaS = false
  Então a seção de cobrança não é renderizada
  E exibe o badge "Parceiro Piloto — Gratuito"
  E não exibe "R$ 0,00"
  E não exibe botão de cancelar assinatura

Cenário: Decisão de render usa cobrancaSaaS, não o código do plano
  Dado um plano de código "ESSENCIAL" com cobrancaSaaS = false
  Então a seção de cobrança também não é renderizada

Cenário: GET de assinatura nula não vira erro
  Dado GET /billing/assinaturas retornando status null
  Então a tela renderiza normalmente, sem estado de erro

Cenário: Assinatura pendente oferece finalizar
  Dado assinatura PENDING com initPoint
  Então exibe CTA "Finalizar assinatura" que navega para o initPoint

Cenário: Limite ilimitado é exibido como tal
  Dado limiteEventosAtivos = null
  Então exibe "Ilimitado", nunca "null" nem "0"

Cenário: Uso é exibido contra o limite
  Dado uso.eventosAtivos = 12 e limites.eventosAtivos = 20
  Então exibe "12 / 20"
  E dado limites.eventosAtivos = null, exibe "12 / Ilimitado"

Cenário: Valor decimal em string não perde precisão
  Dado valorMensal "99.90" vindo da API como string
  Então é formatado como "R$ 99,90"
  E o código nunca chama Number() sobre esse valor

Cenário: Fee é exibido mesmo em plano gratuito
  Dado plano gratuito com feeEventoPercentual "3.50"
  Então exibe "3,5% por transação de evento"

Cenário: Membro comum não vê ações de backoffice
  Dado userType "membro"
  Então botão de cancelar assinatura não é renderizado

Cenário: Carregando não pisca estado errado
  Dado que obterMeuPlano ainda está carregando
  Então exibe skeleton, não o estado de plano gratuito
```

## Definição de pronto

- [ ] Módulo scaffoldado com `/new-module`
- [ ] `planosApi.ts` + `assinaturaApi.ts` via `/new-rtk-service`
- [ ] Tags `Plano` e `Assinatura` adicionadas a `tagTypes` em `baseApi.ts`
- [ ] `PlanoBadge` reutilizável, consumido também pela `Navbar`
- [ ] `helpers/formatar-limite.ts` (`null → "Ilimitado"`)
- [ ] `helpers/formatar-moeda.ts` operando sobre string, sem `Number()`
- [ ] `index.tsx` sem lógica; zero `sx={{...}}` literal
- [ ] Estados de loading / erro / vazio cobertos
- [ ] `grep -rn "PILOTO_FREE" modules/` não retorna nada
- [ ] `pnpm check-types` e `pnpm lint` verdes
