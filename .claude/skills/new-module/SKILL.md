---
name: new-module
description: >-
  Scaffold de uma nova página de módulo de feature no saaschurch, seguindo as
  convenções obrigatórias do projeto (index.tsx só-JSX + hook use-<feature> com
  toda a lógica, styles.tsx colocado, wrapper fino no App Router no route group
  certo). Use quando o usuário pedir "novo módulo", "nova página de feature",
  "criar tela em modules", "scaffold de feature", ou invocar /new-module.
  NÃO use para editar módulos existentes (use /refactor-module) nem para criar
  serviços RTK Query (use /new-rtk-service).
---

# New Module — scaffold de página de módulo

Gera a árvore completa de uma página de feature respeitando as regras do
`.claude/CLAUDE.md`.

> **Não há módulo de referência no repositório.** Nenhum módulo existente segue
> o padrão: não há um único `styles.tsx`, os hooks usam camelCase
> (`hooks/useSignIn.ts`), e há `sx` inline por toda parte. Isso é dívida
> técnica, não exemplo. Use os templates deste arquivo como fonte da verdade e
> **não copie a forma de módulos existentes.**

## Argumento

`/new-module <feature>` — kebab-case.
Ex.: `/new-module instituicao-pagamentos`, `/new-module backoffice-planos`.

Aceite também `<area>/<pagina>` e converta para um único diretório kebab-case:
`/new-module instituicao/pagamentos` → `modules/instituicao-pagamentos/`, rota
`app/(authenticated)/instituicao/pagamentos/`.

Se o argumento faltar, pergunte antes de criar.

## Fatos da arquitetura

- **Não existe `src/`.** Módulos vivem em `modules/<feature>/` na raiz.
- **Não existe `[locale]`** nem route groups de padding. Os únicos são
  `(authenticated)` e `(public)`.
- Alias `@/*` aponta para a raiz do projeto.
- A estilização vive em `styles.tsx` (extensão `.tsx`, não `.ts`).
- Typecheck: `pnpm check-types`. Lint: `pnpm lint`.

## Regras invioláveis (do CLAUDE.md)

1. **`index.tsx` é presentacional**: só JSX + `useStyles()` + UMA chamada
   `use<Feature>()`. PROIBIDO `useState`, `useEffect`, `useMemo`, `useCallback`,
   hook de RTK Query, corpo de handler ou dado derivado dentro do `index.tsx`.
2. **Toda lógica** (RTK Query, memo, effect, state, handlers, wiring de form)
   vive em `hooks/use-<feature>.tsx` e é retornada de lá.
3. **Zero `sx={{ ... }}` ou `style={{ ... }}` literal** em qualquer componente.
   Tudo em `styles.tsx`.
4. Dirs de módulo/helper/hook em **kebab-case**; subcomponentes em
   **PascalCase-dir** com `index.tsx`.
5. Novo I/O de API usa **RTK Query** via `/new-rtk-service`.
6. `helpers/`: um arquivo por função, nome = função em kebab-case, arrow
   function exportada inline. `constants.ts` e `validation.ts` são os únicos com
   múltiplos exports.
7. Validação zod em `helpers/validation.ts`, exportando schema **e** `z.infer`.
8. Preferir `import type` e o alias `@/`.

## Passos

1. Derive os nomes a partir de `<feature>` (kebab-case):
   - `FeaturePascal` — `instituicao-pagamentos` → `InstituicaoPagamentos`
   - hook — arquivo `use-instituicao-pagamentos.tsx`, função `useInstituicaoPagamentos`

2. Crie a árvore em `modules/<feature>/`:

   ```
   index.tsx                    # 'use client' + JSX + const {...} = useFeature()
   styles.tsx                   # useStyles()
   types.ts                     # <FeaturePascal>Props + interfaces da view
   hooks/use-<feature>.tsx      # toda a lógica; exporta useFeature()
   helpers/constants.ts         # valores estáticos (opcional)
   helpers/validation.ts        # schema zod (só se a página tiver form)
   ```

   Só crie `components/` quando a página tiver subcomponentes reais — não
   scaffold vazio.

3. `index.tsx`:

   ```tsx
   'use client';

   import { Box, Typography } from '@mui/material';

   import { useInstituicaoPagamentos } from './hooks/use-instituicao-pagamentos';
   import { useStyles } from './styles';
   import type { InstituicaoPagamentosProps } from './types';

   export const InstituicaoPagamentos = ({}: InstituicaoPagamentosProps) => {
     const styles = useStyles();
     const { titulo, carregando } = useInstituicaoPagamentos();

     return (
       <Box sx={styles.container}>
         <Typography sx={styles.titulo}>{titulo}</Typography>
       </Box>
     );
   };
   ```

   `sx={styles.x}` referencia o objeto vindo de `useStyles()` — isso é permitido.
   O proibido é o literal `sx={{ ... }}` inline.

4. `hooks/use-<feature>.tsx` — toda a lógica. Importe os hooks gerados do RTK
   Query de `@/config/redux/api/<dominio>Api`. Retorne um objeto plano com
   estado + handlers (`useCallback` quando o handler for dependência ou prop de
   componente memoizado).

   ```tsx
   'use client';

   import { useCallback } from 'react';

   import { useObterMeuPlanoQuery } from '@/config/redux/api/planosApi';

   export const useInstituicaoPagamentos = () => {
     const { data, isLoading } = useObterMeuPlanoQuery();

     const handleConectar = useCallback(() => {
       // ...
     }, []);

     return {
       titulo: 'Pagamentos',
       plano: data?.plano,
       carregando: isLoading,
       handleConectar,
     };
   };
   ```

5. `styles.tsx` — hook que devolve os estilos. Consuma tokens do tema; não
   hardcode cor nem espaçamento que já exista em `config/theme/theme.ts`.

   ```tsx
   import { useTheme } from '@mui/material';
   import type { SxProps, Theme } from '@mui/material';

   export const useStyles = () => {
     const theme = useTheme();

     return {
       container: {
         display: 'flex',
         flexDirection: 'column',
         gap: 2,
       },
       titulo: {
         fontWeight: 700,
         color: theme.palette.text.primary,
       },
     } satisfies Record<string, SxProps<Theme>>;
   };
   ```

   Estilo que varia com prop/estado vira função:

   ```tsx
   badge: (ativo: boolean) => ({
     bgcolor: ativo ? theme.palette.success.main : theme.palette.grey[400],
   }),
   ```

   Ao usar funções de estilo, tipe o retorno do hook manualmente em vez do
   `satisfies Record<string, SxProps<Theme>>`, que só cobre objetos.

6. `types.ts`:

   ```ts
   export interface InstituicaoPagamentosProps {
     // props da página; vazio se não receber nenhuma
   }
   ```

7. **Wrapper do App Router** — fino, só importa o módulo. Route group:
   - Rota que exige login → `app/(authenticated)/...`
   - Rota pública → `app/(public)/...`

   O path espelha a URL:
   `app/(authenticated)/instituicao/pagamentos/page.tsx`

   ```tsx
   import { InstituicaoPagamentos } from '@/modules/instituicao-pagamentos';

   export default function InstituicaoPagamentosPage() {
     return <InstituicaoPagamentos />;
   }
   ```

   Se a página recebe `params`/`searchParams`, tipe-os no wrapper e repasse como
   props. No Next 16 eles são `Promise` — faça `await`:

   ```tsx
   export default async function EventoPage({
     params,
   }: {
     params: Promise<{ id: string }>;
   }) {
     const { id } = await params;
     return <EventoDetalhes eventoId={id} />;
   }
   ```

8. Se o módulo precisa de um endpoint que ainda não existe, **pare e rode
   `/new-rtk-service <dominio>` antes** — não escreva `fetch` nem `createApi`
   à mão.

9. Rode `pnpm check-types` e `pnpm lint`. Reporte a árvore criada + resultado.

## Checklist antes de encerrar

- [ ] `index.tsx` não contém query/memo/effect/state/handler-body
- [ ] Zero `sx={{ ... }}` ou `style={{ ... }}` literal — tudo em `styles.tsx`
- [ ] Hook retorna tudo que o `index.tsx` consome
- [ ] Dirs de módulo em kebab-case; subcomponentes em PascalCase-dir
- [ ] Wrapper em `app/` sem lógica, no route group correto
- [ ] `helpers/validation.ts` exporta schema zod **e** `z.infer` (se houver form)
- [ ] `import type` para tipos; alias `@/`
- [ ] `pnpm check-types` e `pnpm lint` verdes
