# SPEC-FE-006 — Guard de plano e assinatura

| | |
|---|---|
| **Repo** | `saaschurch` |
| **Fase** | F1 |
| **Depende de** | `SPEC-BE-007` (feature gating) |
| **Scaffold** | **sem `/new-module`** — é infra em `lib/` + `components/` |

---

## Contexto

O backend bloqueia rotas por plano. O frontend precisa refletir isso **antes** do usuário clicar: ocultar o que ele não pode usar, e traduzir os erros tipados quando ele tentar mesmo assim.

> **A regra que sustenta o plano gratuito.** O guard pergunta `temFeature('pagamentosOnline')`, **nunca** `plano.codigo === 'PILOTO_FREE'`. Espelha a RN-02 do backend. Se o guard perguntar "é piloto?", cada plano novo vai exigir tocar em `if`s espalhados pela UI.

## Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | Hook `usePlano()` expondo `{ plano, temFeature(f), limiteAtingido(l), assinaturaAtiva, carregando }`. |
| RF-02 | Componente `<FeatureGate feature="pagamentosOnline">` que oculta ou desabilita a UI. |
| RF-03 | Banner global quando `Assinatura.status ∈ {PAUSED, CANCELLED}`. **Nunca** renderizado em plano gratuito. |
| RF-04 | Interceptar `403 FEATURE_INDISPONIVEL` / `403 LIMITE_ATINGIDO` / `402 ASSINATURA_INATIVA` e exibir a mensagem certa. |
| RF-05 | Sidebar oculta itens de features indisponíveis. |

## Contrato de erro consumido

Estes códigos vêm de `SPEC-BE-007`. Trate pelo **código**, nunca pela mensagem.

```http
403 { "error": "FEATURE_INDISPONIVEL", "feature": "pagamentosOnline" }
403 { "error": "LIMITE_ATINGIDO", "limite": "eventosAtivos", "max": 5, "atual": 5 }
402 { "error": "ASSINATURA_INATIVA", "status": "PAUSED" }
```

`402` (assinatura) e `403` (feature/limite) têm tratamento visual diferente: assinatura inativa é um problema de conta que o backoffice resolve; limite atingido é um convite a upgrade.

## Interface

`lib/hooks/use-plano.ts`:

```ts
export interface UsePlano {
  plano: Plano | undefined;
  temFeature: (feature: keyof PlanoFeatures) => boolean;
  limiteAtingido: (limite: 'eventosAtivos' | 'usuarios') => boolean;
  assinaturaAtiva: boolean;   // true quando cobrancaSaaS === false
  carregando: boolean;
}
```

Consome `useObterMeuPlanoQuery()` de `config/redux/api/planosApi.ts` ([SPEC-FE-002](./SPEC-FE-002-assinatura.md)).

`components/FeatureGate/`:

```tsx
<FeatureGate feature="pagamentosOnline">
  <Button>Cobrar por este evento</Button>
</FeatureGate>

<FeatureGate feature="exportacao" modo="desabilitar" tooltip="Disponível no plano Pro">
  <Button>Exportar</Button>
</FeatureGate>
```

`modo` default é `ocultar`. Durante `carregando`, renderiza skeleton — nunca o estado bloqueado, que causaria um flash de "você não pode".

## Semântica de `assinaturaAtiva`

```
cobrancaSaaS === false  → assinaturaAtiva = true   (plano gratuito: sempre ativo)
status === 'AUTHORIZED' → assinaturaAtiva = true
status ∈ {PENDING, PAUSED, CANCELLED} → assinaturaAtiva = false
```

O banner de assinatura inativa só aparece quando `cobrancaSaaS === true` **e** `assinaturaAtiva === false`. Um parceiro piloto jamais vê esse banner, mesmo que `GET /billing/assinaturas` retorne `status: null`.

## Semântica de `temFeature`

Chave ausente do JSON `features` é tratada como `false`, não como erro. Espelha o backend.

## Estrutura de arquivos

```
lib/hooks/use-plano.ts
lib/helpers/tratar-erro-plano.ts        # RTK error → { titulo, mensagem, acao }
components/FeatureGate/
├── index.tsx
├── styles.tsx
├── types.ts
└── hooks/use-feature-gate.tsx
components/BannerAssinatura/
├── index.tsx
├── styles.tsx
└── hooks/use-banner-assinatura.tsx
```

O `BannerAssinatura` é montado no layout `app/(authenticated)/layout.tsx`.

A `Sidebar` (`app/(authenticated)/components/Sidebar.tsx`) passa a consumir `temFeature` para condicionar itens.

## Critérios de aceite

```gherkin
Cenário: Plano gratuito nunca vê banner de assinatura
  Dado plano com cobrancaSaaS = false
  Então o banner de assinatura inativa jamais é renderizado
  Mesmo que GET /billing/assinaturas retorne status null

Cenário: assinaturaAtiva é true em plano gratuito
  Dado plano com cobrancaSaaS = false e nenhuma assinatura
  Então usePlano().assinaturaAtiva === true

Cenário: FeatureGate oculta UI de feature indisponível
  Dado features.pagamentosOnline = false
  Então o botão "Cobrar por este evento" não é renderizado

Cenário: FeatureGate em modo desabilitar mostra tooltip
  Dado modo="desabilitar" e a feature indisponível
  Então o filho é renderizado desabilitado
  E o tooltip explica por quê

Cenário: Feature ausente do JSON é false
  Dado plano.features sem a chave "exportacao"
  Então temFeature('exportacao') === false

Cenário: 403 tipado vira mensagem específica
  Dado uma mutation retornando 403 { error: "LIMITE_ATINGIDO", limite: "eventosAtivos", max: 5 }
  Então exibe "Você atingiu o limite de 5 eventos ativos do seu plano"
  E não exibe erro genérico

Cenário: 402 tem tratamento distinto de 403
  Dado uma mutation retornando 402 ASSINATURA_INATIVA
  Então a mensagem orienta a regularizar a assinatura
  E não sugere upgrade de plano

Cenário: Erro é tratado pelo código, não pela mensagem
  Dado um 403 cujo campo error é "FEATURE_INDISPONIVEL"
  Então o tratamento não depende do texto da mensagem do backend

Cenário: Guard não pisca durante o carregamento
  Dado que obterMeuPlano ainda está carregando
  Então o FeatureGate renderiza skeleton, não o estado bloqueado

Cenário: Sidebar oculta item de feature indisponível
  Dado features.projetos = false
  Então o item "Projetos" não aparece na Sidebar

Cenário: Erro não tipado tem fallback
  Dado um 500 sem campo error
  Então exibe mensagem genérica, sem quebrar
```

## Definição de pronto

- [ ] `lib/hooks/use-plano.ts`
- [ ] `components/FeatureGate/` com estrutura de módulo (`index.tsx` + `styles.tsx` + `hooks/`)
- [ ] `components/BannerAssinatura/` montado em `app/(authenticated)/layout.tsx`
- [ ] `lib/helpers/tratar-erro-plano.ts` com fallback para erro não tipado
- [ ] `Sidebar` consumindo `temFeature`
- [ ] Skeleton durante `carregando` — sem flash de estado bloqueado
- [ ] `grep -rn "PILOTO_FREE\|parceiroPiloto" lib/ components/` não retorna nada em lógica de decisão
- [ ] `pnpm check-types` e `pnpm lint` verdes
