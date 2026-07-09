# saaschurch — regras de arquitetura frontend

SaaS de gestão de igrejas. Consome a API em `../saaschurch-api` (Express + Prisma).

Stack: **Next.js 16 (App Router) · React 19 · MUI 7 · RTK Query · next-auth · zod · react-hook-form · TypeScript strict**

Gerenciador de pacotes: **pnpm**.

---

## Estrutura do repositório

Não existe `src/`. Os diretórios de topo são o próprio código.

```
saaschurch/
├── app/                        # SÓ definição de rota. Zero lógica.
│   ├── (authenticated)/        # layout com Sidebar + Navbar
│   │   ├── page.tsx            # dashboard (rota /)
│   │   ├── eventos/ areas/ projetos/ usuarios/
│   │   └── components/         # Navbar, Sidebar, UserSync (do layout)
│   ├── (public)/
│   │   ├── login/ forgot-password/ reset-password/ set-password/
│   │   └── externo/            # páginas públicas de evento
│   ├── api/auth/[...nextauth]/
│   └── layout.tsx
├── modules/<feature>/          # conteúdo e lógica das páginas
├── components/                 # componentes globais (ex.: CanAccess)
├── config/
│   ├── redux/
│   │   ├── api/                # baseApi.ts + <dominio>Api.ts   ← RTK Query
│   │   ├── slices/authSlice.ts
│   │   ├── store.ts
│   │   └── provider.tsx
│   ├── theme/
│   │   ├── theme.ts
│   │   └── overrides/          # overrides globais de MUI
│   └── helpers/                # helpers globais
├── lib/
│   ├── hooks/                  # useAuth, usePermissions
│   └── permissions/
└── types/                      # tipos globais (area.types.ts, ...)
```

Alias: `@/*` → raiz do projeto. `@/modules/...`, `@/config/...`, `@/lib/...`, `@/types/...`.

Não há `[locale]`, não há i18n, não há route groups de padding. Textos em PT-BR direto no JSX.

---

## Regras invioláveis

### 1. `app/` é só rota

Toda página nova vive em `modules/<feature>/`. O arquivo em `app/` é um wrapper fino que importa o módulo e nada mais. Nenhum `useState`, nenhum handler, nenhuma query em `app/`.

```tsx
// app/(authenticated)/instituicao/pagamentos/page.tsx
import { InstituicaoPagamentos } from '@/modules/instituicao-pagamentos';

export default function InstituicaoPagamentosPage() {
  return <InstituicaoPagamentos />;
}
```

Se a página recebe `params`/`searchParams`, tipe-os no wrapper e repasse como props.

### 2. Estrutura de um módulo

```
modules/<feature>/
├── index.tsx                   # SÓ JSX + uma chamada use<Feature>()
├── styles.tsx                  # useStyles() — toda a estilização
├── types.ts                    # tipos e props do módulo
├── hooks/
│   └── use-<feature>.tsx       # TODA a lógica
├── helpers/
│   ├── constants.ts            # valores estáticos (único com múltiplos exports)
│   ├── validation.ts           # schema zod + z.infer (único com múltiplos exports)
│   └── <nome-da-funcao>.ts     # 1 arquivo por função utilitária
└── components/
    └── <Subcomponente>/        # replica esta mesma estrutura, recursivamente
```

`components/` só existe se houver subcomponente real. Não faça scaffold vazio.

### 3. `index.tsx` é presentacional puro

Só JSX + `const styles = useStyles()` + `const { ... } = use<Feature>()`.

**Proibido no `index.tsx`:** `useState`, `useEffect`, `useMemo`, `useCallback`, hooks de RTK Query, corpo de handler, dado derivado.

### 4. Toda lógica em `hooks/use-<feature>.tsx`

Queries, mutations, state, effects, memos, handlers, wiring de form. Retorna um objeto plano que o `index.tsx` consome.

### 5. Zero CSS inline

Nenhum `sx={{ ... }}` nem `style={{ ... }}` literal dentro de qualquer componente. Toda estilização vive em `styles.tsx`, num hook `useStyles()` que retorna o objeto de estilos.

Estilo que depende de prop/estado recebe o valor como argumento da função de estilo — a decisão de qual variante aplicar fica fora do componente.

Override global de componente MUI vai em `config/theme/overrides/`, não em `sx` espalhado.

### 6. Helpers: um arquivo por função

Nome do arquivo = nome da função em kebab-case. Arrow function exportada inline.

```ts
// helpers/formatar-limite.ts
export const formatarLimite = (limite: number | null) =>
  limite === null ? 'Ilimitado' : String(limite);
```

`constants.ts` e `validation.ts` são os dois únicos arquivos de `helpers/` com múltiplos exports. Helper reusado por mais de um módulo vai para `config/helpers/`.

### 7. Validação com zod

`helpers/validation.ts` exporta o schema **e** o tipo inferido. Sem Yup.

```ts
import { z } from 'zod';

export const trocarPlanoSchema = z.object({
  planoCodigo: z.string().min(1, 'Selecione um plano'),
  motivo: z.string().min(10, 'Descreva o motivo com pelo menos 10 caracteres'),
});

export type TrocarPlano = z.infer<typeof trocarPlanoSchema>;
```

### 8. API sempre via RTK Query

Domínio novo → `config/redux/api/<dominio>Api.ts`, usando `baseApi.injectEndpoints`.

**Nunca** crie um `createApi` novo. **Nunca** edite `config/redux/store.ts` para registrar um serviço — `injectEndpoints` auto-registra.

`baseApi` já faz: `Authorization: Bearer` a partir de `state.auth.accessToken`, refresh automático em **401** via `/auth/refresh`, e logout federado (`next-auth` `signOut` + redirect para `/login`) quando o refresh falha. Não reescreva isso.

A API responde com o objeto **direto**, sem envelope. Não use `transformResponse` para desembrulhar nada.

Tag nova → adicione a string ao array `tagTypes` de `config/redux/api/baseApi.ts`.

### 9. Nomenclatura

- Diretórios e arquivos de módulo, helper e hook: **kebab-case** (`use-checkout-evento.tsx`, `formatar-moeda.ts`).
- Diretórios de subcomponente: **PascalCase** com `index.tsx` dentro (`components/PlanoBadge/index.tsx`).
- Serviços RTK: **camelCase** + sufixo `Api` (`pagamentosApi.ts`) — segue o que já existe em `config/redux/api/`.
- Prefira `import type` para tipos e o alias `@/`.

### 10. React e Next.js

- `useRef` em vez de `useState` para valor que não precisa disparar re-render (flags de controle, timers, valor anterior).
- Sem `useEffect` para derivar state de outro state/prop — derive no render, ou com `useMemo` se o cálculo for caro. Effect só para sincronizar com sistema externo (subscription, DOM imperativo, API do browser).
- `useMemo`/`useCallback` onde evitam trabalho real ou alimentam dependência de outro hook. Não memoize por reflexo.
- `'use client'` no topo dos módulos que usam hooks. Wrappers em `app/` podem ser Server Components quando não precisam de interatividade.
- SDK que toca `window` na importação → `dynamic(..., { ssr: false })`.

---

## Comandos

```bash
pnpm dev            # next dev
pnpm check-types    # tsc --noEmit
pnpm lint           # eslint
pnpm build          # next build
```

Rode `pnpm check-types` antes de encerrar qualquer tarefa que toque em `.ts`/`.tsx`.

---

## Estado atual do código

**Os módulos existentes ainda não seguem estas regras.** Nenhum tem `styles.tsx`, os hooks usam camelCase (`hooks/useSignIn.ts`), há `schemas/` e `utils/` em vez de `helpers/`, e há `sx={{ ... }}` inline por toda parte. `app/(authenticated)/areas/page.tsx` tem lógica no wrapper.

Isso é dívida técnica conhecida, não referência. **Código novo segue este documento.** Para trazer um módulo antigo ao padrão, use `/refactor-module`.

Como não existe um módulo de referência no repo, as skills `/new-module` e `/new-rtk-service` carregam os templates completos inline.

---

## Skills

| Skill | Quando |
|---|---|
| `/new-module <feature>` | Página nova de feature |
| `/new-rtk-service <dominio>` | Domínio novo de API |
| `/refactor-module <feature>` | Trazer módulo existente ao padrão |

---

## Especificações em andamento

A camada de pagamentos (Mercado Pago) está especificada em `docs/specs/`. O planejamento completo — arquitetura, modelagem, contratos — vive em `../saaschurch-api/docs/PLANEJAMENTO-PAGAMENTOS.md`.
