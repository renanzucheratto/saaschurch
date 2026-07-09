# SPEC-FE-003 — Checkout público de evento (Payment Brick)

| | |
|---|---|
| **Repo** | `saaschurch` |
| **Fase** | F4 |
| **Depende de** | `SPEC-BE-003` (pagamento split) |
| **Scaffold** | `/new-module checkout-evento` + `/new-rtk-service pagamentos` |
| **Rota** | estende `app/(public)/externo/eventos/[eventoId]/page.tsx` — **a página já existe** |

---

## Contexto

O participante se inscreve num evento pela página pública. Se algum produto escolhido tem `exigePagamento`, ele avança para uma etapa de pagamento.

O checkout **não é uma rota nova**. É uma etapa nova do fluxo de inscrição que já existe em `app/(public)/externo/eventos/[eventoId]/`.

O dinheiro cai na conta Mercado Pago da igreja. O Payment Brick precisa ser inicializado com a **`publicKey` daquela igreja**, obtida em runtime.

> **A `publicKey` não vem de variável de ambiente.** Um `NEXT_PUBLIC_MP_PUBLIC_KEY` fixado no build mandaria os pagamentos de todas as igrejas para a conta da plataforma. Ela vem de `GET /pagamentos/checkout-config/:eventoId`.

## Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | Após a inscrição, se algum produto tem `exigePagamento = true`, avançar para a etapa de pagamento. |
| RF-02 | Buscar `checkout-config` e inicializar o `<Payment />` Brick com a `publicKey` da igreja. |
| RF-03 | Suportar cartão de crédito (com parcelas) e PIX. |
| RF-04 | PIX → exibir QR code + copia-e-cola + contador de expiração; fazer polling em `GET /pagamentos/:id` até status final. |
| RF-05 | Estados finais distintos: aprovado, recusado (com motivo), pendente. |
| RF-06 | `409 MP_ACCOUNT_INACTIVE` → mensagem "Esta igreja ainda não configurou pagamentos online", sem renderizar o Brick. |
| RF-07 | Página pública, sem token de auth, com reCAPTCHA v3 (`react-google-recaptcha-v3` já está no projeto). |

## Contrato consumido

```http
GET /pagamentos/checkout-config/:eventoId          # pública
200 { "publicKey": "APP_USR-...", "produtos": [ { "id": "...", "nome": "...", "valor": "150.00" } ] }
409 { "error": "MP_ACCOUNT_INACTIVE" }
403 { "error": "FEATURE_INDISPONIVEL", "feature": "pagamentosOnline" }
```

```http
POST /pagamentos                                   # pública + reCAPTCHA
{
  "eventoId": "...", "participanteId": "...", "produtoIds": ["..."],
  "token": "<card token do Brick>", "paymentMethodId": "master",
  "installments": 3,
  "payer": { "email": "...", "identification": { "type": "CPF", "number": "..." } },
  "recaptchaToken": "..."
}

201 { "pagamentoId": "...", "mpPaymentId": "123", "status": "PENDING", "statusDetail": "pending_contingency" }

# PIX
201 { "pagamentoId": "...", "status": "PENDING",
      "pix": { "qrCode": "00020126...", "qrCodeBase64": "iVBOR...", "expiraEm": "2026-07-09T18:30:00Z" } }

409 { "error": "MP_ACCOUNT_INACTIVE" }
422 { "error": "VALOR_DIVERGENTE" }
```

```http
GET /pagamentos/:id                                # pública, para o polling
200 { "status": "APPROVED", "statusDetail": "accredited", "aprovadoEm": "..." }
```

O valor é recalculado no servidor a partir do banco. O frontend exibe o valor, mas não o envia como fonte de verdade.

## Payment Brick — armadilhas

```bash
pnpm add @mercadopago/sdk-react
```

- O SDK toca `window` na inicialização. O componente que monta o Brick precisa de `'use client'` e deve ser importado com `dynamic(..., { ssr: false })`.
- `initMercadoPago(publicKey)` é **global e não recarrega** com uma chave diferente. Monte o Brick apenas **depois** de `publicKey` resolvida, e passe `key={publicKey}` no componente para forçar a remontagem se a chave mudar.
- O cartão é tokenizado no browser. O PAN nunca passa pela nossa API.
- O Brick é responsivo, mas precisa de um container com largura definida. Testar no mobile.

## Estrutura de arquivos

```
modules/checkout-evento/
├── index.tsx                          # só JSX + useCheckoutEvento()
├── styles.tsx
├── types.ts
├── hooks/
│   ├── use-checkout-evento.tsx        # orquestra etapas, mutation, estados
│   └── use-polling-pagamento.tsx      # polling do PIX, com cleanup
├── helpers/
│   ├── constants.ts                   # POLLING_INTERVAL_MS, PIX_EXPIRACAO_MIN
│   ├── traduzir-status-detail.ts      # cc_rejected_* → PT-BR
│   └── formatar-moeda.ts              # opera sobre string
└── components/
    ├── PaymentBrick/                  # 'use client' + dynamic ssr:false
    ├── PixQrCode/                     # QR + copia-e-cola + contador
    └── ResultadoPagamento/            # aprovado | recusado | pendente
```

```
config/redux/api/pagamentosApi.ts      # /new-rtk-service
```

Adicionar `'Pagamentos'` a `tagTypes` em `baseApi.ts`.

## Critérios de aceite

```gherkin
Cenário: Brick usa a chave da igreja
  Dado checkout-config retornando publicKey "APP_USR-igreja-A"
  Então initMercadoPago é chamado com essa chave
  E nunca com uma chave vinda de variável de ambiente

Cenário: Brick só monta após a chave resolver
  Dado que checkout-config ainda está carregando
  Então o Payment Brick não é montado
  E exibe skeleton

Cenário: Igreja sem conta MP não vê checkout
  Dado checkout-config retornando 409 MP_ACCOUNT_INACTIVE
  Então exibe "Esta igreja ainda não configurou pagamentos online"
  E o Payment Brick não é montado

Cenário: Evento sem produto pago pula a etapa
  Dado que nenhum produto do evento tem exigePagamento
  Então a inscrição conclui sem etapa de pagamento
  E checkout-config nem é chamado

Cenário: PIX exibe QR e faz polling
  Dado um pagamento PIX criado
  Então exibe qrCodeBase64 e o código copia-e-cola
  E faz polling de GET /pagamentos/:id a cada POLLING_INTERVAL_MS
  E para o polling ao atingir status final ou expiração
  E limpa o interval no unmount

Cenário: Polling não vaza interval
  Dado que o usuário sai da página durante o polling
  Então o interval é limpo no cleanup do effect

Cenário: PIX expirado para o polling
  Dado que expiraEm já passou
  Então o polling para
  E exibe estado de expiração com opção de gerar novo pagamento

Cenário: Cartão recusado mostra o motivo
  Dado status REJECTED com statusDetail "cc_rejected_insufficient_amount"
  Então exibe mensagem traduzida em PT-BR
  E nunca exibe o código bruto

Cenário: statusDetail desconhecido tem fallback
  Dado um statusDetail não mapeado
  Então exibe mensagem genérica de recusa, sem quebrar

Cenário: Duplo clique não cria dois pagamentos
  Quando o usuário clica "Pagar" duas vezes rapidamente
  Então apenas uma mutation é disparada
  E o botão está desabilitado durante isLoading

Cenário: reCAPTCHA é obrigatório
  Quando POST /pagamentos é montado
  Então recaptchaToken está presente no payload

Cenário: Valor exibido bate com o do servidor
  Dado produtos somando "150.00" no checkout-config
  Então a UI exibe "R$ 150,00"
  E o valor não é recalculado no cliente a partir de Number()
```

## Definição de pronto

- [ ] `pnpm add @mercadopago/sdk-react`
- [ ] Módulo `checkout-evento` com toda lógica em `hooks/use-checkout-evento.tsx`
- [ ] `index.tsx` sem `useState`/`useEffect`/query/corpo de handler
- [ ] `PaymentBrick` com `'use client'` + `dynamic(..., { ssr: false })` + `key={publicKey}`
- [ ] `helpers/traduzir-status-detail.ts` com mapa `statusDetail` → PT-BR e fallback
- [ ] `helpers/constants.ts` com `POLLING_INTERVAL_MS`, `PIX_EXPIRACAO_MIN`
- [ ] Polling com cleanup no unmount — sem leak de interval
- [ ] `config/redux/api/pagamentosApi.ts` via `/new-rtk-service`; tag `Pagamentos` em `baseApi.ts`
- [ ] Testado em sandbox do MP: aprovado, recusado, pendente, PIX
- [ ] Testado no mobile: Brick responsivo dentro do container
- [ ] `pnpm check-types` e `pnpm lint` verdes
