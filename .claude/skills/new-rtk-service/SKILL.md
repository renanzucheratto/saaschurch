---
name: new-rtk-service
description: >-
  Scaffold de um novo domínio RTK Query no saaschurch em
  config/redux/api/<dominio>Api.ts, injetando na baseApi compartilhada e
  preservando o hardening de segurança dela (Bearer, refresh 401, logout
  federado). Use quando o usuário pedir "novo serviço RTK", "novo endpoint de
  API", "criar service em config/redux/api", "domínio RTK Query", ou invocar
  /new-rtk-service. NÃO use para páginas de módulo (use /new-module).
---

# New RTK Service — scaffold de domínio RTK Query

Gera um domínio RTK Query que injeta na `baseApi` compartilhada.

Referência viva real: `config/redux/api/areasApi.ts` (domínio completo, com
tags por id) e `config/redux/api/dashboardApi.ts` (query simples). A base é
`config/redux/api/baseApi.ts`.

## Argumento

`/new-rtk-service <dominio>` — `dominio` em kebab-case ou camelCase.
Ex.: `/new-rtk-service pagamentos`, `/new-rtk-service payment-connect`.

Se faltar, pergunte o nome do domínio antes de criar.

## Fatos-chave da arquitetura

- **Um arquivo por domínio**, não um diretório: `config/redux/api/<dominio>Api.ts`.
  Não crie `<dominio>/index.ts` + `types.ts`.
- A base `baseApi` (`createApi`, `reducerPath: 'api'`) já tem
  `baseQueryWithReauth` com `Authorization: Bearer` a partir de
  `state.auth.accessToken`, refresh automático em **401** via `/auth/refresh`, e
  logout federado (`signOut` do `next-auth` + redirect para `/login`) quando o
  refresh falha. **NÃO reescreva nada disso.**
- Serviços novos chamam **`baseApi.injectEndpoints`** → auto-registram no store.
  **NÃO edite `config/redux/store.ts`** nem adicione reducer.
- Tag nova → adicione a string ao array `tagTypes` de
  `config/redux/api/baseApi.ts`. Não crie um `createApi` novo.
- `baseUrl` vem de `NEXT_PUBLIC_BASE_URL`. As URLs dos endpoints são relativas
  a ela (`/pagamentos`, `/planos/meu`).

## Regras

1. `query`/`mutation` tipados: `builder.query<Resposta, Args>` /
   `builder.mutation<Resposta, Args>`. Use `void` quando não houver argumento.
2. **A API responde com o objeto direto, sem envelope.** NÃO use
   `transformResponse` para desembrulhar `data` — não existe `ResponseViewModel`
   neste projeto.
3. `providesTags` em queries de leitura; `invalidatesTags` em mutations que
   alteram dados dessa tag.
4. Tipos do domínio: se forem usados só por este serviço, declare-os no próprio
   arquivo (como `dashboardApi.ts` faz). Se forem compartilhados com módulos,
   coloque em `types/<dominio>.types.ts` na raiz (como `types/area.types.ts`).
5. Valores monetários chegam da API como **string** (`Decimal` serializado).
   Tipe como `string`, nunca `number`.
6. `import type` para tipos.

## Passos

1. Se o domínio precisa de tag nova, adicione-a a `tagTypes` em
   `config/redux/api/baseApi.ts`:

   ```ts
   tagTypes: ['Eventos', 'Participantes', 'Users', 'Projetos', 'Areas', 'Me', 'Dashboard', 'Pagamentos'],
   ```

2. Crie `config/redux/api/<dominio>Api.ts`:

   ```ts
   import { baseApi } from './baseApi';

   export interface Pagamento {
     id: string;
     valor: string;           // Decimal serializado — string, nunca number
     applicationFee: string;
     status: 'PENDING' | 'APPROVED' | 'REJECTED';
   }

   export interface CriarPagamentoArgs {
     eventoId: string;
     participanteId: string;
     produtoIds: string[];
   }

   export const pagamentosApi = baseApi.injectEndpoints({
     endpoints: (builder) => ({
       listarPagamentosEvento: builder.query<Pagamento[], string>({
         query: (eventoId) => `/pagamentos/evento/${eventoId}`,
         providesTags: ['Pagamentos'],
       }),
       obterPagamento: builder.query<Pagamento, string>({
         query: (id) => `/pagamentos/${id}`,
         providesTags: (result, error, id) => [{ type: 'Pagamentos', id }],
       }),
       criarPagamento: builder.mutation<Pagamento, CriarPagamentoArgs>({
         query: (body) => ({ url: '/pagamentos', method: 'POST', body }),
         invalidatesTags: ['Pagamentos', 'Participantes'],
       }),
     }),
   });

   export const {
     useListarPagamentosEventoQuery,
     useObterPagamentoQuery,
     useCriarPagamentoMutation,
   } = pagamentosApi;
   ```

   - Nome do arquivo e da const: **camelCase + sufixo `Api`**
     (`payment-connect` → `paymentConnectApi.ts`, const `paymentConnectApi`).
   - `builder`, não `build` — segue o que já existe no projeto.

3. Query com polling (ex.: aguardar confirmação de PIX) usa
   `pollingInterval` no hook, não no endpoint:

   ```ts
   const { data } = useObterPagamentoQuery(id, {
     pollingInterval: 5000,
     skip: statusFinal,
   });
   ```

4. Consuma os hooks gerados dentro de um `hooks/use-<feature>.tsx` de módulo —
   **nunca** no `index.tsx` da página (regra do `.claude/CLAUDE.md`).

5. Rode `pnpm check-types` e `pnpm lint`. Reporte os arquivos criados +
   resultado.

## Tratamento de erro tipado

O backend devolve erros com um campo `error` estável. Trate pelo **código**,
nunca pela mensagem:

```ts
403 { "error": "FEATURE_INDISPONIVEL", "feature": "pagamentosOnline" }
403 { "error": "LIMITE_ATINGIDO", "limite": "eventosAtivos", "max": 5 }
402 { "error": "ASSINATURA_INATIVA", "status": "PAUSED" }
```

O erro do RTK Query chega como `FetchBaseQueryError`; o corpo está em
`error.data`.

## Checklist antes de encerrar

- [ ] Usa `baseApi.injectEndpoints` (NÃO novo `createApi`, NÃO editou `store.ts`)
- [ ] Arquivo único `config/redux/api/<dominio>Api.ts` (não um diretório)
- [ ] Base `baseApi.ts` intacta (Bearer / refresh 401 / logout federado preservados)
- [ ] Endpoints tipados; **sem** `transformResponse` (a API não usa envelope)
- [ ] Tag nova (se houver) adicionada a `tagTypes` de `baseApi.ts`
- [ ] Valores monetários tipados como `string`
- [ ] Hooks consumidos só dentro de `hooks/use-<feature>.tsx` de módulo
- [ ] `pnpm check-types` e `pnpm lint` verdes
