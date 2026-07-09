# SPEC-FE-005 — Backoffice: gestão de planos

| | |
|---|---|
| **Repo** | `saaschurch` |
| **Fase** | F1 |
| **Depende de** | `SPEC-BE-001` (planos) |
| **Scaffold** | `/new-module backoffice/planos` |
| **Rota** | `app/(authenticated)/backoffice/planos/page.tsx` → `modules/backoffice-planos/` |

---

## Contexto

Trocar o plano de uma instituição é ação exclusiva de backoffice (RN-05 — não há self-service de upgrade nesta fase). É por aqui que um parceiro piloto é colocado no `PILOTO_FREE`, e é por aqui que ele sai dele quando o piloto acabar.

A tela lista instituições com plano atual, flag de parceiro piloto e status da assinatura.

## Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | Listar instituições com plano atual, flag `parceiroPiloto` e status da assinatura. |
| RF-02 | Trocar o plano de uma instituição (diálogo + campo `motivo` obrigatório). |
| RF-03 | Troca para plano pago → exibir o `initPoint` retornado, copiável, para enviar à igreja. |
| RF-04 | Troca de pago → gratuito → avisar que a assinatura ativa será cancelada (confirmação explícita). |
| RF-05 | Alternar a flag `parceiroPiloto`. |

## Contrato consumido

```http
GET /planos                                # lista planos ativos
200 { "planos": [ { "codigo": "PILOTO_FREE", "nome": "...", "cobrancaSaaS": false, ... } ] }

PATCH /planos/instituicao/:instituicaoId   # backoffice
{ "planoCodigo": "PRO", "motivo": "Fim do período piloto" }

200 { "plano": {...}, "assinaturaNecessaria": true, "initPoint": "https://..." }
403 { "error": "Acesso negado..." }
409 { "error": "PLANO_INATIVO" }
```

A listagem de instituições reusa o endpoint existente de `/instituicoes`, estendido para trazer `plano` e `parceiroPiloto`.

## Regras de UI

- A troca **para plano pago** não vigora na hora. O backend cria uma `Assinatura` `PENDING` e a instituição só migra quando o webhook confirmar a autorização (RN-07). A UI precisa dizer isso, não fingir que a troca já aconteceu.
- A troca **para plano gratuito** cancela a assinatura ativa no Mercado Pago (RN-08). Ação destrutiva → confirmação explícita, com o texto dizendo o que será cancelado.
- `motivo` é obrigatório e vai para a auditoria (`planoAtribuidoPor` / `planoAtribuidoEm`).
- A decisão de "vai precisar de assinatura?" usa `plano.cobrancaSaaS` do plano de destino, nunca o `codigo`.

## Estrutura de arquivos

```
modules/backoffice-planos/
├── index.tsx                       # só JSX + useBackofficePlanos()
├── styles.tsx
├── types.ts
├── hooks/use-backoffice-planos.tsx # query, mutation, estado do diálogo
├── helpers/
│   ├── constants.ts
│   └── validation.ts               # schema zod + z.infer
└── components/
    ├── DialogoTrocarPlano/         # index.tsx + styles.tsx + hooks/ + helpers/
    └── InitPointCopiavel/
```

```
app/(authenticated)/backoffice/planos/page.tsx   # wrapper fino + guard
config/redux/api/planosApi.ts                    # compartilhado com SPEC-FE-002
```

`helpers/validation.ts`:

```ts
export const trocarPlanoSchema = z.object({
  planoCodigo: z.string().min(1, 'Selecione um plano'),
  motivo: z.string().min(10, 'Descreva o motivo com pelo menos 10 caracteres'),
});

export type TrocarPlano = z.infer<typeof trocarPlanoSchema>;
```

## Critérios de aceite

```gherkin
Cenário: Troca para plano pago revela o initPoint
  Quando backoffice troca uma instituição para "PRO"
  Então a resposta traz initPoint
  E a UI exibe o link com botão de copiar
  E avisa que a troca só vigora após a igreja autorizar

Cenário: Downgrade para gratuito avisa sobre cancelamento
  Dado uma instituição com assinatura AUTHORIZED
  Quando backoffice troca para PILOTO_FREE
  Então exibe aviso de que a assinatura será cancelada
  E exige confirmação explícita antes de submeter

Cenário: Aviso de cancelamento usa cobrancaSaaS, não o código
  Dado um plano de destino "ESSENCIAL" com cobrancaSaaS = false
  Então o aviso de cancelamento também aparece

Cenário: Motivo é obrigatório
  Quando o campo motivo está vazio
  Então o submit é bloqueado com erro de validação zod

Cenário: Motivo curto é rejeitado
  Dado motivo com 5 caracteres
  Então exibe "Descreva o motivo com pelo menos 10 caracteres"

Cenário: Troca invalida as tags certas
  Quando a mutation atribuirPlano tem sucesso
  Então as tags Plano e Assinatura são invalidadas

Cenário: Plano inativo não aparece na lista
  Dado um Plano com ativo = false
  Então ele não é oferecido no seletor

Cenário: Rota é inacessível a não-backoffice
  Dado userType != "backoffice"
  Então a rota não renderiza o conteúdo
  E o item não aparece na Sidebar

Cenário: Parceiro piloto é visível na listagem
  Dado uma instituição com parceiroPiloto = true
  Então a linha exibe o badge de parceiro piloto
```

## Definição de pronto

- [ ] Módulo scaffoldado com `/new-module`
- [ ] `atribuirPlano` em `config/redux/api/planosApi.ts`, invalidando `Plano` e `Assinatura`
- [ ] `helpers/validation.ts` exportando o schema zod **e** o `z.infer`
- [ ] `index.tsx` sem lógica; zero `sx={{...}}` literal
- [ ] Guard de rota (`userType === 'backoffice'`) + item de Sidebar condicional
- [ ] Diálogo de downgrade com confirmação explícita
- [ ] `initPoint` copiável com feedback de cópia
- [ ] `grep -rn "PILOTO_FREE" modules/backoffice-planos/` não retorna nada em lógica de decisão
- [ ] `pnpm check-types` e `pnpm lint` verdes
