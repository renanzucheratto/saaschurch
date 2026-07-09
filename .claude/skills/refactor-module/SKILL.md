---
name: refactor-module
description: >-
  Refatora um módulo em modules/ que não segue o padrão obrigatório do projeto,
  reestruturando-o em index.tsx (só JSX) + hooks/use-<module> (toda lógica) +
  helpers/ (funções utilitárias, uma por arquivo em kebab-case batendo o nome da
  função, mais helpers/constants.ts e helpers/validation.ts fixos com schema zod
  + type infer) + styles.tsx (hook com toda estilização, sem sx/style inline nos
  componentes) + components/ (subcomponentes que replicam a mesma estrutura
  recursivamente). Também aplica boas práticas de React/Next.js: useRef para
  estado sem mutação relevante, remove useEffect desnecessário, memoiza com
  useMemo/useCallback quando necessário. Use quando o usuário pedir "refatorar
  módulo", "padronizar módulo", "esse módulo não está no padrão", "organizar
  módulo fora de padrão", ou invocar /refactor-module. NÃO use para criar
  módulos novos do zero (use /new-module).
---

# Refactor Module — padronização de módulo fora de padrão

Reestrutura um módulo/página existente para a convenção obrigatória do
`.claude/CLAUDE.md`, preservando 100% do comportamento (mesma UI, mesmos dados,
mesmos endpoints) — só move/organiza código, não muda regra de negócio.

> **Nenhum módulo do repositório está no padrão hoje.** Não existe um único
> `styles.tsx`, os hooks usam camelCase (`hooks/useSignIn.ts`), há `schemas/` e
> `utils/` em vez de `helpers/`, e há `sx` inline por toda parte. Não há
> referência viva: a estrutura-alvo abaixo e os templates de `/new-module` são
> a fonte da verdade. **Não copie a forma de outro módulo** — provavelmente ele
> também está fora do padrão.

## Argumento

`/refactor-module <feature>`

- `/refactor-module login` — módulo inteiro.
- `/refactor-module evento-detalhes/components/GerenciarPagamento` — só um
  subcomponente de um módulo grande.

Se faltar ou for ambíguo, pergunte antes de tocar em código.

## Estrutura-alvo (obrigatória)

```
modules/<feature>/
  index.tsx                    # só JSX + const {...} = use<Feature>()
  styles.tsx                   # hook useStyles() — TODA estilização (zero sx/style inline)
  types.ts                     # props e tipos de view
  hooks/
    use-<feature>.tsx          # toda lógica: state, effect, memo, handlers, queries
  helpers/
    constants.ts               # fixo: fallbacks, arrays fixos, valores estáticos
    validation.ts              # fixo: schema(s) zod + export do type infer
    <nome-funcao-kebab>.ts     # 1 arquivo por função utilitária, nome = função em
                               # kebab-case, arrow function exportada inline
  components/
    <Subcomponente>/           # cada subcomponente repete ESTA MESMA estrutura
      index.tsx
      styles.tsx
      hooks/use-<subcomponente>.tsx
      helpers/ (se necessário)
```

`components/` só existe se houver subcomponente reutilizado dentro do próprio
módulo. Cada subcomponente é, ele mesmo, um mini-módulo — mesma árvore,
recursivamente.

## Renomeações comuns neste repo

| Encontrado hoje | Vira |
|---|---|
| `schemas/<x>.schema.ts` | `helpers/validation.ts` |
| `utils/validators.ts` | `helpers/<nome-da-funcao>.ts`, um por função |
| `hooks/useEventoForm.ts` | `hooks/use-evento-form.tsx` |
| `types/index.ts` | `types.ts` |
| `index.ts` só com re-exports | `index.tsx` com o componente, ou mantenha o barrel se o módulo tiver múltiplos entry points |
| `sx={{ ... }}` inline | entrada em `styles.tsx` |

Ao renomear, **atualize todos os imports** — inclusive os wrappers em `app/`.

## Regras invioláveis

1. **`index.tsx` é presentacional puro**: só JSX + `useStyles()` + uma chamada a
   `use<Feature>()`. Nenhum `useState`/`useEffect`/`useMemo`/`useCallback`/
   corpo de handler/query direto nele.
2. **Zero CSS inline nos componentes**: nenhum `sx={{ ... }}` ou
   `style={{ ... }}` literal. Toda estilização vive em `styles.tsx`, um hook
   (`useStyles()`) que retorna o objeto de estilos. `sx={styles.container}` é
   permitido — o literal é que não. Se um `sx` precisa de valor dinâmico
   (prop/estado), `styles.tsx` recebe esse valor como argumento da função de
   estilo; a decisão de qual variante aplicar continua fora do componente.
3. **Helpers, um arquivo por função**: nome do arquivo = nome da função em
   kebab-case (função `formatarValorMoeda` → arquivo `formatar-valor-moeda.ts`),
   arrow function exportada inline. Nunca agrupe múltiplas funções utilitárias
   não relacionadas no mesmo arquivo — fora de `constants.ts`/`validation.ts`,
   os únicos arquivos fixos com múltiplos exports. Helper usado por mais de um
   módulo vai para `config/helpers/`.
4. **`helpers/constants.ts`**: só valores estáticos (fallbacks, arrays fixos,
   enums locais, defaults) — nunca lógica.
5. **`helpers/validation.ts`**: schema(s) zod do módulo + export do type via
   `z.infer`. Sempre exporte o schema **e** o type inferido
   (`export type <Nome> = z.infer<typeof <nome>Schema>`).
6. **Toda lógica em `hooks/use-<feature>.tsx`**: RTK Query, state, effect, memo,
   handlers — retornado como objeto plano para o `index.tsx` consumir.
7. **Subcomponentes em `components/` replicam a estrutura inteira**
   (`index.tsx` + `styles.tsx` + `hooks/` + `helpers/` se precisar) — não são um
   arquivo solto com lógica e estilo inline.
8. **Preferir `useRef` a `useState`** para valores que não precisam disparar
   re-render (flags de controle de fluxo, referências a timers/DOM, valor
   anterior para comparação). `useState` só quando a mudança precisa refletir na
   UI.
9. **Evitar `useEffect` desnecessário**: se o valor pode ser derivado durante o
   render (com `useMemo` quando o cálculo for caro) ou calculado direto no
   handler que dispara a mudança, não vira `useEffect`. Effect só para
   sincronizar com sistema externo (subscription, DOM imperativo, API do
   browser) — nunca para derivar state a partir de outro state/prop.
10. **Memoizar quando necessário**: `useMemo` para cálculo custoso ou para
    objeto/array que vira dependência de outro hook; `useCallback` para handler
    passado como prop a componente memoizado ou usado como dependência de
    effect/memo. Não memoize por reflexo.
11. **Zero regressão de comportamento**: mesma UI final, mesmos dados, mesmas
    chamadas de API, mesma UX. É reorganização de código, não redesign.
12. **Não migre I/O legado para RTK Query no mesmo passo.** Se o módulo usa
    `fetch` direto (como `hooks/useSignIn.ts` faz), mover o `fetch` para o hook
    já é o escopo. Trocar por RTK Query é uma mudança de comportamento
    observável (cache, invalidação) — faça em PR separado, com o usuário ciente.

## Passos

1. **Ler o módulo inteiro** antes de mexer: `index.tsx`, todo `hooks/*`,
   `helpers/*`, `components/*`, `schemas/*`, `utils/*`, `types/*`, e os estilos
   inline. Monte um inventário: o que é JSX puro, o que é lógica
   (state/effect/memo/callback/query), o que é estilo inline (`sx`/`style`), o
   que é função utilitária solta, o que é valor estático, o que é validação zod.

2. **Achar os consumidores**: `grep -rn "modules/<feature>" app/ modules/` para
   saber quem importa o quê antes de renomear qualquer arquivo.

3. **Extrair estilo** — todo `sx`/`style` literal migra para `styles.tsx` como
   entrada do objeto retornado por `useStyles()`. Valores dinâmicos
   (dependem de prop/state) recebem parâmetro na função de estilo.

4. **Extrair helpers** — cada função utilitária solta ganha arquivo próprio em
   `helpers/<nome-em-kebab>.ts`. Valores estáticos vão para
   `helpers/constants.ts`. Todo schema zod migra/consolida em
   `helpers/validation.ts` com schema + `z.infer`.

5. **Extrair lógica para o hook** — tudo que for `useState`/`useEffect`/
   `useMemo`/`useCallback`/chamada de API/handler migra para
   `hooks/use-<feature>.tsx`. Aplique as regras 8–10 neste passo: troque
   `useState` sem impacto em render por `useRef`, remova `useEffect` que só
   deriva state, adicione `useMemo`/`useCallback` onde o retorno do hook
   alimenta dependências ou é passado para componente memoizado.

6. **Reduzir `index.tsx` ao mínimo**: JSX + `const styles = useStyles()` +
   `const { ... } = use<Feature>()`. Nenhuma lógica sobrando.

7. **Repetir os passos 1–6 para cada subcomponente em `components/`**, tratando
   cada um como módulo próprio (estrutura recursiva da regra 7).

8. **Limpar o wrapper em `app/`**: se ele tiver lógica (como
   `app/(authenticated)/areas/page.tsx`, que hoje monta um `useRouter` e um
   handler), mova essa lógica para o hook do módulo e deixe o wrapper só
   importando e renderizando.

9. **Rodar `pnpm check-types` e `pnpm lint`** e corrigir o que quebrar por causa
   do reposicionamento de código (não deve mudar tipo/comportamento, só local).

10. **Reportar** no chat: árvore final do módulo, lista do que foi movido para
    onde (styles/helpers/hooks/components), quais `useState` viraram `useRef`,
    quais `useEffect` foram removidos, e o resultado do typecheck e do lint.

## Checklist antes de encerrar

- [ ] `index.tsx` (e o de cada subcomponente) só tem JSX + chamada de hook —
      zero `useState`/`useEffect`/`useMemo`/handler-body direto
- [ ] Zero `sx=`/`style=` inline com valor literal — tudo em `styles.tsx`
- [ ] Cada helper é 1 arquivo, nome kebab-case = nome da função, arrow function
      exportada inline
- [ ] `helpers/constants.ts` só tem valores estáticos
- [ ] `helpers/validation.ts` exporta schema zod + `z.infer` type
- [ ] Subcomponentes em `components/` replicam a estrutura completa
- [ ] `useRef` usado onde a mutação não precisa de re-render
- [ ] Nenhum `useEffect` sobrevive só para derivar state de outro state/prop
- [ ] Memoização presente onde evita trabalho/render redundante — sem memoizar
      por reflexo
- [ ] Wrapper em `app/` sem lógica
- [ ] Imports atualizados em todos os consumidores (inclusive `app/`)
- [ ] Nenhuma regressão de comportamento/UI/endpoints
- [ ] `pnpm check-types` e `pnpm lint` verdes
- [ ] Resumo do que foi movido/removido reportado no chat
