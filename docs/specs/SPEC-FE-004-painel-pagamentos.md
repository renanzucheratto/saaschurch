# SPEC-FE-004 — Painel de pagamentos do evento

| | |
|---|---|
| **Repo** | `saaschurch` |
| **Fase** | F4 |
| **Depende de** | `SPEC-BE-003` (pagamento split) |
| **Scaffold** | estende `modules/evento-detalhes/` — **não é módulo novo**, é uma aba nova |
| **Rota** | `app/(authenticated)/eventos/[id]/page.tsx` (já existe) |

---

## Contexto

A igreja precisa ver quanto entrou por evento, quanto a plataforma reteve de fee, e quanto sobrou líquido.

Não use `/new-module` aqui. A aba é um subcomponente de `modules/evento-detalhes/`, e segue a estrutura recursiva de módulo (`index.tsx` + `styles.tsx` + `hooks/` + `helpers/`).

## Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | Aba "Pagamentos" com `DataGrid` (`@mui/x-data-grid`, já no projeto): participante, produto, valor, fee, líquido, método, status, data. |
| RF-02 | Totalizadores: bruto, fee retido, líquido da igreja. |
| RF-03 | Filtro por status; badge colorido por status. |
| RF-04 | Exibir o **fee do snapshot** (`Pagamento.applicationFee`), nunca recalcular a partir do plano atual. |
| RF-05 | Aba só visível quando o evento tem produtos com `exigePagamento`. |

## Contrato consumido

```http
GET /pagamentos/evento/:eventoId                   # autenticado
200 {
  "pagamentos": [
    {
      "id": "...",
      "participante": { "nome": "..." },
      "produto": { "nome": "..." },
      "valor": "150.00",
      "applicationFee": "5.25",
      "feePercentualAplicado": "3.50",
      "metodoPagamento": "credit_card",
      "status": "APPROVED",
      "aprovadoEm": "2026-07-09T14:00:00Z"
    }
  ],
  "totais": { "bruto": "1500.00", "fee": "52.50", "liquido": "1447.50" }
}
```

Todos os valores são **string** (`Decimal` serializado). Nunca `Number()` antes de formatar.

## Por que o fee é histórico

`Pagamento.applicationFee` e `Pagamento.feePercentualAplicado` são snapshots gravados na criação do pagamento. Se a igreja mudar de plano depois, os pagamentos antigos preservam o fee cobrado à época.

A UI exibe **o valor gravado no pagamento**, nunca `valor × plano.feeEventoPercentual`. Recalcular a partir do plano atual mostraria um número que não bate com o extrato do Mercado Pago.

## Totalizadores

Apenas pagamentos com `status === 'APPROVED'` entram nos totalizadores. Pendentes e recusados aparecem na grid, mas não somam.

```
bruto   = Σ valor          (APPROVED)
fee     = Σ applicationFee (APPROVED)
liquido = bruto - fee
```

Os totais vêm calculados do backend. O frontend não os recalcula — só formata.

## Mapa de status

| Status | Cor | Rótulo |
|---|---|---|
| `PENDING` | `default` | Aguardando |
| `IN_PROCESS` | `info` | Processando |
| `APPROVED` | `success` | Aprovado |
| `REJECTED` | `error` | Recusado |
| `REFUNDED` | `warning` | Estornado |
| `CANCELLED` | `default` | Cancelado |

## Estrutura de arquivos

```
modules/evento-detalhes/components/PagamentosTab/
├── index.tsx                       # só JSX + usePagamentosTab()
├── styles.tsx
├── types.ts
├── hooks/use-pagamentos-tab.tsx    # query, filtro, colunas do DataGrid
└── helpers/
    ├── constants.ts                # mapa de status → { cor, rotulo }
    ├── formatar-moeda.ts           # opera sobre string, não Number
    └── montar-colunas.ts           # GridColDef[]
```

`listarPagamentosEvento` entra em `config/redux/api/pagamentosApi.ts` — o mesmo serviço de [SPEC-FE-003](./SPEC-FE-003-checkout-evento.md).

## Critérios de aceite

```gherkin
Cenário: Aba oculta em evento sem produto pago
  Dado um evento sem nenhum produto com exigePagamento
  Então a aba "Pagamentos" não é renderizada
  E listarPagamentosEvento não é chamado

Cenário: Fee exibido é o histórico
  Dado um Pagamento com feePercentualAplicado = "3.50" e applicationFee = "5.25"
  E o plano atual da instituição com feeEventoPercentual = "5.00"
  Então a grid exibe R$ 5,25, não R$ 7,50

Cenário: Totalizadores só contam aprovados
  Dado 3 pagamentos APPROVED e 2 PENDING
  Então os totalizadores somam apenas os 3 aprovados
  E os 5 aparecem na grid

Cenário: Totais vêm do backend
  Então o frontend exibe totais.bruto, totais.fee e totais.liquido
  E não os recalcula somando as linhas

Cenário: Valores em Decimal string não viram float
  Dado valor "1234.56" vindo da API como string
  Então é formatado como "R$ 1.234,56"
  E o código nunca chama Number() sobre esse valor

Cenário: Filtro por status
  Quando o usuário filtra por "Aprovado"
  Então a grid exibe só os APPROVED
  E os totalizadores não mudam (continuam sobre todos os aprovados)

Cenário: Status recusado mostra badge de erro
  Dado um pagamento REJECTED
  Então o badge é vermelho com rótulo "Recusado"

Cenário: Evento sem pagamentos
  Dado que o evento tem produtos pagos mas nenhum pagamento
  Então exibe estado vazio, não erro
  E os totalizadores exibem R$ 0,00

Cenário: Carregando exibe skeleton
  Dado que listarPagamentosEvento está carregando
  Então exibe skeleton no lugar da grid
```

## Definição de pronto

- [ ] `modules/evento-detalhes/components/PagamentosTab/` com estrutura recursiva de módulo
- [ ] `index.tsx` sem `useState`/`useEffect`/`useMemo`/query/corpo de handler
- [ ] Zero `sx={{...}}` literal — tudo em `styles.tsx`
- [ ] `listarPagamentosEvento` em `config/redux/api/pagamentosApi.ts`
- [ ] `helpers/formatar-moeda.ts` operando sobre string, sem `Number()`
- [ ] `helpers/montar-colunas.ts` retornando `GridColDef[]`
- [ ] Aba condicionada a produtos com `exigePagamento`
- [ ] Estados de loading / vazio cobertos
- [ ] `pnpm check-types` e `pnpm lint` verdes
