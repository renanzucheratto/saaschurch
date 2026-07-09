# SPEC-FE-001 — Módulo `instituicao/pagamentos` (conectar Mercado Pago)

| | |
|---|---|
| **Repo** | `saaschurch` |
| **Fase** | F3 |
| **Depende de** | `SPEC-BE-002` (OAuth) — em `saaschurch-api/docs/specs/SPEC-BE-002-oauth.md` |
| **Scaffold** | `/new-module instituicao/pagamentos` + `/new-rtk-service payment-connect` |
| **Rota** | `app/(authenticated)/instituicao/pagamentos/page.tsx` → `modules/instituicao-pagamentos/` |
| **Bloqueada por** | Decisão: formato de `/payment-connect/authorize` (ver [README](./README.md)) |

---

## Contexto

A igreja conecta a própria conta Mercado Pago via OAuth. Sem isso, não há pagamento de evento — o dinheiro não teria onde cair.

A tela mostra o status da conexão e oferece conectar / reconectar / desconectar.

## Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | Exibir status da conexão: `NAO_CONECTADO` \| `PENDING` \| `ACTIVE` \| `EXPIRED` \| `REVOKED`. |
| RF-02 | Botão "Conectar Mercado Pago" → obtém `authorizeUrl` do backend e navega para ela. |
| RF-03 | Ao voltar com `?connected=1`, exibir sucesso e invalidar a tag `PaymentConnect`. |
| RF-04 | Ao voltar com `?error=...`, exibir erro traduzido. |
| RF-05 | Botão "Desconectar" com diálogo de confirmação (ação destrutiva). |
| RF-06 | Visível apenas para `userType ∈ {backoffice, pastor}` — usar `usePermissions`. |

## Contrato consumido

```http
POST /payment-connect/authorize          # autenticado
200 { "authorizeUrl": "https://auth.mercadopago.com.br/authorization?..." }
409 { "error": "JA_CONECTADO" }

GET /payment-connect/status
200 { "status": "ACTIVE", "mpUserId": "123", "conectadoEm": "...", "expiresAt": "..." }
200 { "status": "NAO_CONECTADO" }

DELETE /payment-connect
204
```

`instituicaoId` é derivado de `req.user` no backend — o frontend **não** o envia.

Nenhuma resposta expõe tokens. Se algum dia expuser, é bug de backend.

## Navegação para o OAuth

O `authorizeUrl` aponta para o domínio do Mercado Pago. Navegue com `window.location.href`, **não** com `router.push` (é uma saída do app, não uma rota interna) e **não** com `fetch` (o MP responde HTML e o CORS quebraria).

> A alternativa `302` direto do backend não funciona bem: uma navegação de browser não carrega o header `Authorization`, o que forçaria mandar o token de auth em query param — vazando-o no histórico e nos logs de acesso. Por isso o `POST` retornando JSON.

## Estados da UI

| Status | Severidade | CTA | Mensagem |
|---|---|---|---|
| `NAO_CONECTADO` | `info` | "Conectar Mercado Pago" | Eventos pagos estão indisponíveis até conectar. |
| `PENDING` | `info` | "Continuar conexão" | Autorização iniciada, aguardando confirmação no Mercado Pago. |
| `ACTIVE` | `success` | "Desconectar" | Conectado. Exibir `mpUserId` e data da conexão. |
| `EXPIRED` | `warning` | "Reconectar" | O acesso expirou. Pagamentos de evento estão bloqueados. |
| `REVOKED` | `warning` | "Reconectar" | Acesso revogado no Mercado Pago. |

## Estrutura de arquivos

```
modules/instituicao-pagamentos/
├── index.tsx                              # só JSX + useInstituicaoPagamentos()
├── styles.tsx                             # useStyles()
├── types.ts
├── hooks/use-instituicao-pagamentos.tsx   # toda a lógica
├── helpers/
│   ├── constants.ts                       # mapa de status → { severidade, cta, mensagem }
│   └── traduzir-erro-oauth.ts             # INVALID_STATE → texto PT-BR
└── components/
    └── DialogoDesconectar/                # index.tsx + styles.tsx + hooks/
```

```
app/(authenticated)/instituicao/pagamentos/page.tsx   # wrapper fino
config/redux/api/paymentConnectApi.ts                 # /new-rtk-service
```

Adicionar `'PaymentConnect'` a `tagTypes` em `config/redux/api/baseApi.ts`.

## Critérios de aceite

```gherkin
Cenário: Conta não conectada
  Dado status NAO_CONECTADO
  Então exibe CTA "Conectar Mercado Pago"
  E exibe alerta de que eventos pagos estão indisponíveis

Cenário: Conectar navega para o Mercado Pago
  Quando clica em "Conectar Mercado Pago"
  Então a mutation iniciarConexao é disparada
  E o browser navega para o authorizeUrl retornado
  E a navegação usa window.location.href, não router.push

Cenário: Token expirado pede reautorização
  Dado status EXPIRED
  Então exibe alerta de severidade "warning"
  E o CTA vira "Reconectar"

Cenário: Retorno com sucesso atualiza a tela
  Dado que a URL tem ?connected=1
  Então exibe mensagem de sucesso
  E a tag PaymentConnect é invalidada
  E o query param é limpo da URL

Cenário: Retorno com erro exibe mensagem traduzida
  Dado que a URL tem ?error=INVALID_STATE
  Então exibe mensagem em PT-BR
  E nunca exibe o código bruto

Cenário: Desconectar exige confirmação
  Quando clica em "Desconectar"
  Então abre diálogo de confirmação
  E só chama a mutation após confirmação explícita
  E após sucesso a tag PaymentConnect é invalidada

Cenário: Duplo clique não dispara duas mutations
  Quando o usuário clica no CTA duas vezes rapidamente
  Então o botão está desabilitado durante isLoading

Cenário: Usuário sem permissão não vê a página
  Dado userType "membro"
  Então a rota redireciona ou exibe estado de acesso negado
  E o item não aparece na Sidebar

Cenário: Carregando não pisca estado errado
  Dado que obterStatusConexao ainda está carregando
  Então exibe skeleton, não o estado NAO_CONECTADO
```

## Definição de pronto

- [ ] Módulo scaffoldado com `/new-module`
- [ ] `config/redux/api/paymentConnectApi.ts` via `/new-rtk-service`
- [ ] `'PaymentConnect'` adicionada a `tagTypes` em `baseApi.ts`
- [ ] Item na `Sidebar` com guard de permissão
- [ ] `index.tsx` sem `useState`/`useEffect`/`useMemo`/query/corpo de handler
- [ ] Zero `sx={{...}}` literal — tudo em `styles.tsx`
- [ ] `helpers/traduzir-erro-oauth.ts` cobrindo `INVALID_STATE` e erros do MP
- [ ] Diálogo de desconexão avisa o que acontece com eventos ativos (ver decisão pendente no README)
- [ ] `pnpm check-types` e `pnpm lint` verdes
