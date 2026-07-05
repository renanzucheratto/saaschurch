---
name: new-module
description: >-
  Scaffold de uma nova página de módulo de feature no Portal Vixtra, seguindo as
  convenções obrigatórias do projeto (index.tsx só-JSX + hook use-<feature> com
  toda a lógica, styles.ts colocado, wrapper fino no App Router no route group
  certo). Use quando o usuário pedir "novo módulo", "nova página de feature",
  "criar tela em src/modules", "scaffold de feature", ou invocar /new-module.
  NÃO use para editar módulos existentes nem para criar serviços RTK Query
  (use /new-rtk-service).
---

# New Module — scaffold de página de módulo

Gera a árvore completa de uma página de feature respeitando as regras do
`.claude/CLAUDE.md`. Referência viva: `src/modules/carteira-digital/pages/transferir/`.

## Argumento

`/new-module <feature>/<page>` — ambos kebab-case.
Ex.: `/new-module carteira-digital/extrato`, `/new-module financiamento/simulacao`.

Se o argumento faltar ou não estiver em `feature/page`, pergunte antes de criar.

## Regras invioláveis (do CLAUDE.md)

1. **`index.tsx` é presentacional**: só JSX + UMA chamada `use<Page>()`. PROIBIDO
   `useQuery`, `useMemo`, `useEffect`, `useState`, corpo de handler ou dado
   derivado dentro do `index.tsx`.
2. **Toda lógica** (RTK Query/Axios, memo, effect, state, handlers, wiring de
   form) vive em `hooks/use-<page>.tsx` e é retornada de lá.
3. Dirs e subdirs em **kebab-case**; componentes internos em PascalCase-dir com `index.tsx`.
4. Novo I/O de API usa **RTK Query**, não Axios legacy.
5. `styles.ts` colocado, usa `useStyles()` + `satisfies SxThemeProps`, tokens de tema.
6. Preferir `import type` e aliases `@/`.
7. Validação zod em `helpers/validations.ts` (sem Yup).

## Passos

1. Derive nomes: `feature` (kebab), `page` (kebab), `PagePascal` = page em
   PascalCase + sufixo `Page` (ex. `extrato` → `ExtratoPage`), `useHook` =
   `use-<page>` / `use<PagePascal-sem-Page>` (ex. `useExtrato`).

2. Crie a árvore em `src/modules/<feature>/pages/<page>/`:

   ```
   index.tsx                 # 'use client' + JSX + const { ... } = useHook()
   hooks/use-<page>.tsx      # toda a lógica; exporta useHook()
   types.ts                  # <PagePascal>Props + interfaces da view
   styles.ts                 # useStyles() satisfies SxThemeProps
   helpers/validations.ts    # schema zod (só se a página tiver form)
   helpers/constants.ts      # breadcrumbs, listas estáticas (opcional)
   ```

   Só crie `components/` quando a página tiver subcomponentes reais — não
   scaffold vazio.

3. `index.tsx` — modelo mínimo:

   ```tsx
   'use client';

   import { Grid } from '@mui/material';

   import { useExtrato } from './hooks/use-extrato';
   import { useStyles } from './styles';
   import type { ExtratoPageProps } from './types';

   export const ExtratoPage = ({ /* props */ }: ExtratoPageProps) => {
     const styles = useStyles();
     const { /* estado e handlers do hook */ } = useExtrato();

     return <Grid container spacing={2}>{/* JSX */}</Grid>;
   };
   ```

4. `hooks/use-<page>.tsx` — toda lógica aqui. Importe hooks gerados do RTK
   Query de `@/redux/services/<feature>`. Retorne um objeto plano com estado +
   handlers `useCallback`.

5. `styles.ts` — copie a forma de `transferir/styles.ts`:
   `useTheme()` → retorna objeto `satisfies SxThemeProps` de `@/config/theme/types/types`.

6. **Wrapper do App Router** — fino, só importa a página. Coloque no route group
   certo sob `src/app/[locale]/`:
   - Rota privada → `(private)`. Padding legacy → `(padded)`; sem padding → `(no-pad)`.
   - Path espelha a URL: `src/app/[locale]/(private)/(padded)/<feature>/<page>/page.tsx`

   ```tsx
   import { ExtratoPage } from '@/modules/<feature>/pages/<page>';

   export default function Extrato() {
     return <ExtratoPage />;
   }
   ```

   Se a página recebe params/searchParams, tipe-os no wrapper e repasse como
   props (padrão de `transferir/[id]/page.tsx`).

7. Rode `pnpm check-types`. Reporte árvore criada + resultado do typecheck.

## Checklist antes de encerrar

- [ ] `index.tsx` não contém query/memo/effect/state/handler-body
- [ ] Hook retorna tudo que o `index.tsx` consome
- [ ] Dirs kebab-case; wrapper no route group correto
- [ ] `import type` para tipos; aliases `@/`
- [ ] `pnpm check-types` verde
