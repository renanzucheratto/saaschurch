---
name: new-rtk-service
description: >-
  Scaffold de um novo domínio RTK Query no Portal Vixtra em
  src/redux/services/<domain>/ (index.ts com api.injectEndpoints + types.ts),
  preservando o hardening de segurança da base api.ts (prefixo Bearer, header
  portfolio/companytoken, reauth 401/403). Use quando o usuário pedir "novo
  serviço RTK", "novo endpoint de API", "criar service em redux/services",
  "domínio RTK Query", ou invocar /new-rtk-service. NÃO use para páginas de
  módulo (use /new-module) nem para Axios legacy.
---

# New RTK Service — scaffold de domínio RTK Query

Gera um domínio RTK Query que injeta na base `api` compartilhada. Referência
viva: `src/redux/services/troca-garantia/` e a base `src/redux/services/api.ts`.

## Argumento

`/new-rtk-service <domain>` — `domain` em kebab-case.
Ex.: `/new-rtk-service extrato`, `/new-rtk-service painel-cambio`.

Se faltar, pergunte o nome do domínio antes de criar.

## Fatos-chave da arquitetura

- A base `api` (`createApi`, `reducerPath: 'api'`) já tem `baseQueryWithReauth`
  com prefixo Bearer, header `portfolio`, `companytoken` e retry 401/403 +
  logout federado. **NÃO reescreva nada disso.**
- Serviços novos chamam **`api.injectEndpoints`** → auto-registram no store.
  **NÃO edite `redux/store.ts`** nem adicione reducer.
- Endpoints que precisam de tag nova → adicione a string em `tagTypes` de
  `src/redux/services/api.ts` (não crie novo `createApi`).

## Regras

1. `query`/`mutation` tipados: `build.query<Resposta, Args>` / `build.mutation<Resposta, Args>`.
2. Respostas da API vêm embrulhadas em `ResponseViewModel<T>` → use
   `transformResponse: (r: ResponseViewModel<T>) => r.data`.
3. `providesTags` em queries de leitura; `invalidatesTags` em mutations que
   alteram dados dessa tag.
4. Tipos em `types.ts` do domínio; `ResponseViewModel<T>` genérico incluso.
5. `import type` para tipos.

## Passos

1. Crie `src/redux/services/<domain>/types.ts`:

   ```ts
   export interface ResponseViewModel<T> {
     data: T;
     statusCode: number;
     message?: string;
   }

   // interfaces de request/response do domínio
   export interface Exemplo { id: number; nome: string; }
   ```

2. Crie `src/redux/services/<domain>/index.ts`:

   ```ts
   import api from '../api';
   import type { Exemplo, ResponseViewModel } from './types';

   export const <domainCamel>Endpoints = api.injectEndpoints({
     endpoints: (build) => ({
       get<Domain>: build.query<Exemplo, { id: number }>({
         query: ({ id }) => ({
           url: `/vx-.../${id}`,
           method: 'GET',
         }),
         providesTags: ['<TAG>'],
         transformResponse: (r: ResponseViewModel<Exemplo>) => r.data,
       }),
       create<Domain>: build.mutation<Exemplo, Partial<Exemplo>>({
         query: (body) => ({ url: '/vx-...', method: 'POST', body }),
         invalidatesTags: ['<TAG>'],
         transformResponse: (r: ResponseViewModel<Exemplo>) => r.data,
       }),
     }),
   });

   export const { useGet<Domain>Query, useCreate<Domain>Mutation } =
     <domainCamel>Endpoints;
   ```

   - `<domainCamel>` = domain em camelCase (`painel-cambio` → `painelCambio`).
   - `<Domain>` = PascalCase.

3. Se usar `providesTags`/`invalidatesTags` com tag nova, adicione a string ao
   array `tagTypes` em `src/redux/services/api.ts`.

4. Consuma via os hooks gerados dentro de um `hooks/use-<feature>.tsx` de módulo
   (nunca no `index.tsx` da página).

5. Rode `pnpm check-types`. Reporte arquivos criados + typecheck.

## Checklist antes de encerrar

- [ ] Usa `api.injectEndpoints` (NÃO novo `createApi`, NÃO editou store)
- [ ] Base `api.ts` intacta (Bearer/portfolio/reauth preservados)
- [ ] Endpoints tipados + `transformResponse` desembrulha `ResponseViewModel`
- [ ] Tag nova (se houver) adicionada a `tagTypes`
- [ ] `pnpm check-types` verde
