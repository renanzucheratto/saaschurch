---
name: refactor-module
description: >-
  Refatora um módulo em src/modules/ que não segue o padrão obrigatório do
  projeto, reestruturando-o em index.tsx (só JSX) + hooks/use-<module> (toda
  lógica) + helpers/ (funções utilitárias, uma por arquivo em kebab-case
  batendo o nome da função, mais helpers/constants.ts e helpers/validation.ts
  fixos com schema zod + type infer) + styles.ts (hook com toda estilização,
  sem sx/style inline nos componentes) + components/ (subcomponentes que
  replicam a mesma estrutura recursivamente). Também aplica boas práticas de
  React/Next.js: useRef para estado sem mutação relevante, remove useEffect
  desnecessário, memoiza com useMemo/useCallback quando necessário, e consulta
  o MCP do Next.js para validar as práticas atuais do framework. Use quando o
  usuário pedir "refatorar módulo", "padronizar módulo", "esse módulo não
  está no padrão", "organizar módulo fora de padrão", ou invocar
  /refactor-module. NÃO use para criar módulos novos do zero (use
  /new-module) nem para apenas documentar (use /document-module).
---

# Refactor Module — padronização de módulo fora de padrão

Reestrutura um módulo/página existente pra convenção obrigatória do
`.claude/CLAUDE.md`, preservando 100% do comportamento (mesma UI, mesmos
dados, mesmos endpoints) — só move/organiza código, não muda regra de
negócio. Referência viva de estrutura-alvo: `src/modules/carteira-digital/pages/transferir/`.

## Argumento

`/refactor-module <feature>[/<page-ou-subdir>]`

- `/refactor-module cadastro` — módulo single-page ou legado monolítico inteiro.
- `/refactor-module carteira-digital/transferir` — só uma página de módulo multi-página.

Se faltar ou for ambíguo, pergunte antes de tocar em código.

## Estrutura-alvo (obrigatória)

```
<module>/
  index.tsx                    # só JSX + const {...} = use<Module>()
  styles.ts                    # hook useStyles() — TODA estilização (zero sx/style inline nos componentes)
  hooks/
    use-<module>.tsx           # toda lógica: state, effect, memo, handlers, queries
  helpers/
    constants.ts               # fixo: fallbacks, arrays fixos, valores estáticos do módulo
    validation.ts              # fixo: schema(s) zod do módulo + export do type infer
    <nome-funcao-kebab>.ts     # 1 arquivo por função utilitária, nome = função em kebab-case,
                                # arrow function exportada inline: `export const nomeFuncao = (...) => {...}`
  components/
    <Subcomponente>/           # cada subcomponente reusado só neste módulo repete ESTA MESMA estrutura
      index.tsx
      styles.ts
      hooks/use-<subcomponente>.tsx
      helpers/ (se necessário)
```

`components/` só existe se houver subcomponente reutilizado dentro do próprio
módulo. Cada subcomponente é, ele mesmo, um mini-módulo — mesma árvore,
recursivamente.

## Regras invioláveis

1. **`index.tsx` é presentacional puro**: só JSX + uma chamada a `use<Module>()`
   (ou ao hook do subcomponente). Nenhum `useState`/`useEffect`/`useMemo`/
   `useCallback`/corpo de handler/query direto nele.
2. **Zero CSS inline nos componentes**: nenhum `sx={{ ... }}` ou `style={{ ... }}`
   literal dentro de `index.tsx` ou de qualquer componente do módulo. Toda
   estilização vive em `styles.ts`, um hook (`useStyles()`) que retorna o
   objeto de estilos consumido pelo componente. Se um `sx` precisa de valor
   dinâmico (prop/estado), `styles.ts` recebe esse valor como argumento da
   função de estilo — a decisão de qual variante aplicar continua fora do
   componente.
3. **Helpers, um arquivo por função**: nome do arquivo = nome da função em
   kebab-case (ex. função `formatarValorMoeda` → arquivo
   `formatar-valor-moeda.ts`), arrow function exportada inline
   (`export const formatarValorMoeda = (...) => {...}`). Nunca agrupe
   múltiplas funções utilitárias não relacionadas no mesmo arquivo (fora de
   `constants.ts`/`validation.ts`, os únicos arquivos fixos com múltiplos
   valores).
4. **`helpers/constants.ts`**: só valores estáticos (fallbacks, arrays fixos,
   enums locais, defaults) — nunca lógica.
5. **`helpers/validation.ts`**: schema(s) zod do módulo + export do type via
   `z.infer`. Pode ser `export const <nome>Schema = z.object({...})` ou uma
   função que retorna o schema — os dois formatos são aceitos, mas sempre
   exporte o schema E o type inferido
   (`export type <Nome> = z.infer<typeof <nome>Schema>`).
6. **Toda lógica em `hooks/use-<module>.tsx`**: RTK Query/Axios, state,
   effect, memo, handlers — retornado como objeto plano pro `index.tsx`
   consumir.
7. **Subcomponentes em `components/` replicam a estrutura inteira** (index.tsx
   + styles.ts + hooks/ + helpers/ se precisar) — não são só um arquivo solto
   com lógica e estilo inline.
8. **Preferir `useRef` a `useState`** para valores que não precisam disparar
   re-render (contadores internos, flags de controle de fluxo, referências a
   timers/DOM, valor anterior pra comparação). Só use `useState` quando a
   mudança do valor precisa refletir na UI.
9. **Evitar `useEffect` desnecessário**: se o valor pode ser derivado durante
   o render (com `useMemo` quando o cálculo for caro) ou calculado direto no
   handler que dispara a mudança, não vira `useEffect`. Effect só pra
   sincronizar com sistema externo (subscription, DOM imperativo, API do
   browser) — nunca pra derivar state a partir de outro state/prop.
10. **Memoizar quando necessário**: `useMemo` pra cálculo custoso/objeto ou
    array que vira dependência de outro hook; `useCallback` pra handler
    passado como prop a componente memoizado ou usado como dependência de
    effect/memo. Não memoizar tudo por reflexo — só onde evita trabalho ou
    render desnecessário real.
11. **Boas práticas de Next.js**: antes de fechar o refactor, consulte o MCP
    do Next.js (`mcp__next-devtools__nextjs_docs` / `nextjs_index`) pra
    validar pontos como fronteira `'use client'`/Server Component, uso
    correto de `next/navigation`, data fetching, e outras práticas do
    framework relevantes ao módulo tocado — aplique só o que for aplicável
    sem contradizer as regras 1–10.
12. **Zero regressão de comportamento**: mesma UI final, mesmos dados, mesmas
    chamadas de API, mesma UX. É reorganização de código, não redesign.
13. **Não invente `types.ts`** fora do que já existir — tipos de view/props
    continuam onde já estão (`types.ts` se já existir na unidade) ou, se não
    existir, avalie se cabe criar seguindo o padrão de `/new-module` (props
    da página) sem misturar com `validation.ts`.

## Passos

1. **Ler o módulo/página inteiro** antes de mexer: `index.tsx`, todo
   `hooks/*`, `helpers/*`, `components/*`, `styles.ts`/estilos inline
   existentes, `types.ts` se houver. Monte um inventário: o que é JSX puro,
   o que é lógica (state/effect/memo/callback/query), o que é estilo inline
   (`sx`/`style`), o que é função utilitária solta, o que é valor
   estático/fallback, o que é validação zod.

2. **Extrair estilo** — todo `sx`/`style` literal encontrado migra pra
   `styles.ts` como entrada do objeto retornado por `useStyles()`. Valores
   dinâmicos (dependem de prop/state) recebem parâmetro na função de estilo.

3. **Extrair helpers** — cada função utilitária solta (dentro de `index.tsx`
   ou de um `hooks/*` que não seja state/effect) ganha arquivo próprio em
   `helpers/<nome-em-kebab>.ts`. Valores estáticos vão pra
   `helpers/constants.ts`. Todo schema zod (onde estiver hoje) migra/consolida
   em `helpers/validation.ts` com schema + `z.infer`.

4. **Extrair lógica pro hook** — tudo que for `useState`/`useEffect`/
   `useMemo`/`useCallback`/chamada de API/handler migra pra
   `hooks/use-<module>.tsx` (crie se não existir; se já existir, só
   reorganize). Aplique as regras 8–10 nesse passo: troque `useState` sem
   impacto em render por `useRef`, remova `useEffect` que só deriva state,
   adicione `useMemo`/`useCallback` onde o retorno do hook alimenta
   dependências ou é passado pra componente memoizado.

5. **Reduzir `index.tsx` ao mínimo**: JSX + `const { ... } = use<Module>()` +
   `const styles = useStyles()`. Nenhuma lógica sobrando.

6. **Repetir os passos 1–5 pra cada subcomponente em `components/`**, tratando
   cada um como módulo próprio (estrutura recursiva da regra 7).

7. **Checar boas práticas Next.js** via MCP (`mcp__next-devtools__nextjs_docs`/
   `nextjs_index`) pros pontos tocados no refactor (client/server boundary,
   navigation, data fetching) — ajuste só se não conflitar com as regras
   acima.

8. **Rodar `pnpm check-types`** e corrigir o que quebrar por causa do
   reposicionamento de código (não deve mudar tipo/comportamento, só local).

9. **Reportar** no chat: árvore final do módulo, lista do que foi movido pra
   onde (styles/helpers/hooks/components), quais `useState`→`useRef` e quais
   `useEffect` foram removidos, e resultado do `pnpm check-types`.

## Checklist antes de encerrar

- [ ] `index.tsx` (e de cada subcomponente) só tem JSX + chamada de hook —
      zero `useState`/`useEffect`/`useMemo`/handler-body direto
- [ ] Zero `sx=`/`style=` inline com valor literal — tudo em `styles.ts`
- [ ] Cada helper é 1 arquivo, nome kebab-case = nome da função, arrow
      function exportada inline
- [ ] `helpers/constants.ts` só tem valores estáticos
- [ ] `helpers/validation.ts` exporta schema zod + `z.infer` type
- [ ] Subcomponentes em `components/` replicam a estrutura completa (não são
      arquivo único com lógica/estilo inline)
- [ ] `useRef` usado onde a mutação não precisa de re-render
- [ ] Nenhum `useEffect` sobrevive só pra derivar state de outro state/prop
- [ ] Memoização (`useMemo`/`useCallback`) presente onde evita trabalho/render
      redundante — sem memoizar por reflexo
- [ ] MCP do Next.js consultado pra pontos de boas práticas do framework
      tocados no refactor
- [ ] Nenhuma regressão de comportamento/UI/endpoints
- [ ] `pnpm check-types` verde
- [ ] Resumo do que foi movido/removido reportado no chat
