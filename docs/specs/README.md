# Specs — Camada de Pagamentos (frontend)

Specs de implementação do `saaschurch` (Next.js). O planejamento completo — arquitetura, modelagem de dados, contratos de API — vive no repositório da API: `saaschurch-api/docs/PLANEJAMENTO-PAGAMENTOS.md`.

As specs de backend estão em `saaschurch-api/docs/specs/`.

## Índice

| Spec | Fase | Depende de (backend) | Entrega |
|---|---|---|---|
| [SPEC-FE-002 — Módulo assinatura](./SPEC-FE-002-assinatura.md) | F1 | BE-001, BE-004 | Tela de plano atual, badge de parceiro piloto |
| [SPEC-FE-005 — Backoffice: gestão de planos](./SPEC-FE-005-backoffice-planos.md) | F1 | BE-001 | Atribuir/trocar plano de instituições |
| [SPEC-FE-006 — Guard de plano e assinatura](./SPEC-FE-006-guard-plano.md) | F1 | BE-007 | `usePlano()`, `<FeatureGate>`, erros tipados |
| [SPEC-FE-001 — Conectar Mercado Pago](./SPEC-FE-001-conectar-mercado-pago.md) | F3 | BE-002 | Onboarding OAuth da igreja |
| [SPEC-FE-003 — Checkout público de evento](./SPEC-FE-003-checkout-evento.md) | F4 | BE-003 | Payment Brick, cartão e PIX |
| [SPEC-FE-004 — Painel de pagamentos do evento](./SPEC-FE-004-painel-pagamentos.md) | F4 | BE-003 | Aba de pagamentos com totalizadores |

## Grafo de dependências

```
BE-001 (Planos) ────► FE-002 (Assinatura)
                └───► FE-005 (Backoffice planos)
BE-007 (Gating) ────► FE-006 (Guard)

BE-002 (OAuth) ─────► FE-001 (Conectar MP)

BE-003 (Split) ─────► FE-003 (Checkout)
                └───► FE-004 (Painel pagamentos)

BE-004 (Assinatura) ► FE-002 (seção de cobrança)
```

Frontend e backend de uma mesma fase podem correr em paralelo assim que o contrato da API estiver acordado. Os contratos estão nas specs de backend correspondentes.

---

## Skills — corrigidas ✅

As três skills em `.claude/skills/` foram copiadas do projeto **Portal Vixtra** e apontavam para caminhos que não existem aqui (`src/modules/<f>/pages/<p>/`, `src/redux/services/`, `src/app/[locale]/`, `ResponseViewModel<T>`, um MCP `next-devtools` não configurado). Rodá-las como estavam geraria arquivos no lugar errado.

Foram reescritas para os paths reais deste repo, e os templates que elas carregam foram verificados com `pnpm check-types`.

Junto disso:

- **`.claude/CLAUDE.md`** foi criado, consolidando o `.cursorrules` — as skills o citam como fonte das regras.
- **`pnpm check-types`** (`tsc --noEmit`) foi adicionado ao `package.json`. Antes não existia; agora é o comando de verificação no fim de cada skill.

**Não existe módulo de referência no repositório.** Nenhum módulo atual segue o padrão: não há um único `styles.tsx`, os hooks usam camelCase (`hooks/useSignIn.ts`), há `schemas/` e `utils/` em vez de `helpers/`, e há `sx` inline por toda parte. Por isso as skills carregam os templates completos inline, e mandam explicitamente **não copiar a forma dos módulos existentes**. Para trazer um módulo antigo ao padrão, use `/refactor-module`.

---

## Estrutura real do repositório

Stack: Next.js 16 (App Router) · React 19 · MUI 7 · RTK Query · next-auth · zod · react-hook-form

```
saaschurch/
├── app/
│   ├── (authenticated)/          # layout com Navbar + Sidebar
│   │   ├── page.tsx              # dashboard
│   │   ├── eventos/ areas/ projetos/ usuarios/
│   │   └── components/           # Navbar, Sidebar, UserSync
│   ├── (public)/
│   │   ├── login/ forgot-password/ reset-password/ set-password/
│   │   └── externo/eventos/[eventoId]/    ◄── checkout entra aqui
│   └── api/auth/[...nextauth]/
├── modules/                      # feature = módulo
│   ├── dashboard/ eventos/ areas/ projetos/ usuarios/ login/ ...
├── config/
│   ├── redux/
│   │   ├── api/                  # baseApi.ts + <dominio>Api.ts  ◄── RTK Query mora aqui
│   │   ├── slices/authSlice.ts
│   │   └── store.ts
│   ├── theme/overrides/
│   └── helpers/
└── lib/  hooks/  permissions/  useAuth.ts  usePermissions.ts
```

`config/redux/api/baseApi.ts` já implementa `baseQueryWithReauth` (Bearer + refresh em 401 + logout federado via `next-auth`). Serviços novos usam `baseApi.injectEndpoints`.

`tagTypes` atuais: `['Eventos', 'Participantes', 'Users', 'Projetos', 'Areas', 'Me', 'Dashboard']`.

## Skills obrigatórias

**Toda página nova de módulo → `/new-module`. Todo domínio novo de API → `/new-rtk-service`.** Não crie a árvore de arquivos à mão nem escreva um `createApi` novo.

```
/new-module instituicao/pagamentos
/new-rtk-service payment-connect
```

As regras completas estão em [`.claude/CLAUDE.md`](../../.claude/CLAUDE.md). Em resumo, e valendo como regra destas specs:

1. `index.tsx` é presentacional puro: só JSX + uma chamada `use<Modulo>()`. Nada de `useState`/`useEffect`/`useMemo`/query/corpo de handler nele.
2. Toda lógica vive em `hooks/use-<modulo>.tsx`, retornada como objeto plano.
3. Toda estilização em `styles.tsx` (hook `useStyles()`), zero `sx={{...}}` literal nos componentes.
4. `helpers/`: um arquivo por função, kebab-case = nome da função, arrow function exportada inline. `helpers/constants.ts` e `helpers/validation.ts` são os únicos com múltiplos exports.
5. `helpers/validation.ts` exporta o schema zod **e** o `z.infer`.
6. Serviço novo usa `baseApi.injectEndpoints` — **não** editar `store.ts`, **não** criar `createApi`.
7. Tag nova → adicionar a string em `tagTypes` de `baseApi.ts`.
8. Pasta em `app/` só define rota e importa o módulo. Zero lógica lá.

## Dependência nova

```bash
pnpm add @mercadopago/sdk-react
```

Nenhuma env nova. `NEXT_PUBLIC_BASE_URL` já existe e é usada por `baseApi.ts`.

## Serviços RTK a criar (`/new-rtk-service`)

Todos em `config/redux/api/`, injetando em `baseApi`. Tags novas a adicionar em `tagTypes`: `'Plano'`, `'Assinatura'`, `'PaymentConnect'`, `'Pagamentos'`.

| Arquivo | Endpoints | Tags |
|---|---|---|
| `planosApi.ts` | `listarPlanos` (Q), `obterMeuPlano` (Q), `atribuirPlano` (M) | provides `Plano`; invalidates `Plano`, `Assinatura` |
| `paymentConnectApi.ts` | `obterStatusConexao` (Q), `iniciarConexao` (M), `desconectarMercadoPago` (M) | provides/invalidates `PaymentConnect` |
| `assinaturaApi.ts` | `obterAssinatura` (Q), `criarAssinatura` (M), `cancelarAssinatura` (M) | provides/invalidates `Assinatura` |
| `pagamentosApi.ts` | `obterCheckoutConfig` (Q), `criarPagamento` (M), `obterPagamento` (Q), `listarPagamentosEvento` (Q) | provides `Pagamentos`; invalidates `Pagamentos`, `Participantes` |

## Invariantes que atravessam todas as specs

- **A `publicKey` do Payment Brick não vem de env.** Ela é a chave da igreja, obtida em runtime via `GET /pagamentos/checkout-config/:eventoId`. Colocar `NEXT_PUBLIC_MP_PUBLIC_KEY` no build mandaria os pagamentos de todas as igrejas para a conta da plataforma.
- **Dinheiro chega como string.** A API serializa `Decimal` como string para preservar precisão. Nunca `Number()` antes de formatar.
- **O guard pergunta pela feature, não pelo plano.** Zero `plano.codigo === 'PILOTO_FREE'` no frontend — espelha a RN-02 do backend.
- **Plano gratuito não é erro.** `GET /billing/assinaturas` retornando `status: null` é o estado normal de um parceiro piloto. A tela renderiza sem estado de erro, e nunca exibe "R$ 0,00".
- **Erros do backend são tipados.** `FEATURE_INDISPONIVEL`, `LIMITE_ATINGIDO`, `ASSINATURA_INATIVA`. Trate pelo código, nunca pela mensagem.

## Decisões pendentes que afetam o frontend

1. **`/payment-connect/authorize`: `302` ou `POST` retornando `{ authorizeUrl }`?** Recomendação: `POST`. → bloqueia `SPEC-FE-001` RF-02.
2. **Igreja desconecta o MP com evento ativo:** bloquear a desconexão, ou só os novos pagamentos? → afeta o texto do diálogo em `SPEC-FE-001` RF-05.
