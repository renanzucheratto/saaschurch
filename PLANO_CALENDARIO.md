# Plano — Feature Calendário

## Contexto

Igreja precisa de área de Calendário. Mostra automaticamente eventos criados em Eventos (read-only, sem criação via calendário) + permite criar "Ocorrências" próprias (recorrentes, multi-dia, com área responsável colorida). Views mês/semana.

**Decisões já validadas com usuário:**
- Eventos (feature existente) fica intocado — sem recorrência, sem área. Nova entidade separada `OcorrenciaCalendario` carrega essa lógica.
- Date/hora: dois `DateTimePicker` (De/Até) do `@mui/x-date-pickers` community — não usar `-pro` (pago).

---

## 1. Backend — Prisma (`saaschurch-api/prisma/schema.prisma`)

### 1.1 `Area.cor` (campo novo, nullable)
```prisma
model Area {
  id             String      @id @default(uuid())
  nome           String
  cor            String?     // hex "#RRGGBB", null = usa cor fallback
  instituicaoId  String
  ...
  ocorrencias    OcorrenciaArea[]   // relação inversa nova
}
```

### 1.2 `OcorrenciaCalendario`
```prisma
model OcorrenciaCalendario {
  id                String    @id @default(uuid())
  titulo            String
  nota              String?
  dataInicio        DateTime
  dataFim           DateTime
  horaInicioDefault String    // "HH:mm"
  horaFimDefault    String
  instituicaoId     String
  userId            String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  updatedByEmail    String?

  instituicao       Instituicao @relation(fields: [instituicaoId], references: [id], onDelete: Cascade)
  user              Users?      @relation(fields: [userId], references: [id])
  areas             OcorrenciaArea[]
  excecoes          OcorrenciaHorarioExcecao[]

  @@index([instituicaoId])
  @@index([dataInicio, dataFim])
  @@map("ocorrencias_calendario")
}
```

### 1.3 `OcorrenciaArea` (pivot N:N)
```prisma
model OcorrenciaArea {
  id            String   @id @default(uuid())
  ocorrenciaId  String
  areaId        String
  createdAt     DateTime @default(now())

  ocorrencia    OcorrenciaCalendario @relation(fields: [ocorrenciaId], references: [id], onDelete: Cascade)
  area          Area                 @relation(fields: [areaId], references: [id], onDelete: Cascade)

  @@unique([ocorrenciaId, areaId])
  @@index([areaId])
  @@map("ocorrencias_areas")
}
```

### 1.4 `OcorrenciaHorarioExcecao` (horário específico por dia)
```prisma
model OcorrenciaHorarioExcecao {
  id            String   @id @default(uuid())
  ocorrenciaId  String
  data          DateTime // só o dia, deve estar dentro de [dataInicio, dataFim]
  horaInicio    String
  horaFim       String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  ocorrencia    OcorrenciaCalendario @relation(fields: [ocorrenciaId], references: [id], onDelete: Cascade)

  @@unique([ocorrenciaId, data])
  @@index([ocorrenciaId])
  @@map("ocorrencias_horario_excecoes")
}
```
Hora como string `"HH:mm"` (não DateTime) — evita ambiguidade timezone ao combinar com `data`.

### 1.5 Migração
`npx prisma db push` + `npx prisma generate`. **Nunca `migrate dev`** (banco produção com drift — ver memória `prisma-db-push-workflow`). `Area.cor` existente vira `NULL` → frontend trata com fallback cinza `#9E9E9E`.

---

## 2. Backend — Rotas REST

### `src/routes/areas.ts` (estender)
- `formatArea()`: incluir `cor`.
- `POST`/`PUT`: aceitar `cor` opcional, validar regex `/^#[0-9A-Fa-f]{6}$/`.

### `src/routes/ocorrenciasCalendario.ts` (novo, montar em `/ocorrencias-calendario`)
Padrão do projeto: sem zod no backend, validação manual, `authenticateUser` + checagem `req.user!.userType` em `['lider','backoffice']` (igual `areas.ts`).

- `GET /` — lista da instituição, `include areas.area + excecoes`. Query opcional `?from=&to=`.
- `GET /:id` — detalhe.
- `POST /` — body `{ titulo, nota?, dataInicio, dataFim, horaInicioDefault, horaFimDefault, areaIds[], excecoes?[{data,horaInicio,horaFim}] }`. Validar: título não vazio; `dataFim >= dataInicio`; horários `HH:mm`; cada exceção dentro do range. Criar em `$transaction` (ocorrência + createMany áreas + createMany exceções).
- `PUT /:id` — mesma validação; dentro de transação: `deleteMany` áreas/exceções antigas + recriar (mais simples que diff).
- `DELETE /:id` — cascade cuida do resto.

`eventos.ts` **não é alterado** — merge de Eventos no calendário acontece só no frontend via `useListarEventosQuery` já existente.

---

## 3. Frontend — RTK Query

### `config/redux/api/areasApi.ts` + `types/area.types.ts`
- `Area.cor: string | null`.
- `criarArea`/`atualizarArea`: aceitar `cor?: string | null`.

### `config/redux/api/ocorrenciasCalendarioApi.ts` (novo)
Mesmo padrão de `areasApi.ts`. Endpoints: `listarOcorrencias`, `buscarOcorrencia`, `criarOcorrencia`, `atualizarOcorrencia`, `removerOcorrencia`. Tag nova `'OcorrenciasCalendario'` em `baseApi.ts`.

Types principais:
```ts
export interface OcorrenciaCalendario {
  id: string; titulo: string; nota: string | null;
  dataInicio: string; dataFim: string;
  horaInicioDefault: string; horaFimDefault: string;
  areas: { id: string; nome: string; cor: string | null }[];
  excecoes: { id?: string; data: string; horaInicio: string; horaFim: string }[];
  createdAt: string; updatedAt: string;
}
```

---

## 4. Dependências novas (frontend)

- `@mui/x-date-pickers` (community, não `-pro`) + `date-fns` (adapter `AdapterDateFns`, locale `ptBR`). `date-fns` escolhido sobre `dayjs`: tree-shakeable, sem plugins extras pra comparação de datas, e `eachDayOfInterval` é exatamente a primitiva pra expandir a ocorrência dia a dia.
- `react-big-calendar` (MIT) — views mês/semana prontas, render customizado por evento, evita reimplementar layout de bloco multi-dia cruzando semanas. Localizer `dateFnsLocalizer` (mesmo date-fns).
  - Alternativas descartadas: `@fullcalendar/react` (plugins avançados pagos, API mais pesada); hand-rolled grid (reimplementa layout que a lib já resolve, alto risco de bugs de borda).

`LocalizationProvider` escopado dentro de `modules/calendario/index.tsx` (não no layout raiz).

---

## 5. Frontend — módulo `modules/calendario` (convenção moderna: index só JSX + hook + styles + helpers)

```
modules/calendario/
  index.tsx
  hooks/use-calendario.ts
  styles.ts
  helpers/
    constants.ts                         # views, COR_NEUTRA_EVENTO, COR_FALLBACK_AREA, REGEX_HORA
    validation.ts                        # zod: ocorrenciaSchema (client-side)
    expandir-ocorrencia-em-dias.ts       # dia a dia: resolve horário default vs exceção
    mapear-eventos-para-calendario.ts     # Eventos -> formato comum (read-only)
    mapear-ocorrencias-para-calendario.ts # Ocorrencias -> formato comum (usa expandir-*)
    resolver-cor-ocorrencia.ts            # areas[] -> { corPrincipal, corsExtras }
  components/
    CalendarioHeader.tsx      # view switcher + navegação + botão "Nova ocorrência"
    CalendarioGrid.tsx        # wrapper react-big-calendar
    EventoBloco.tsx           # Evento: read-only, cor neutra fixa, sem click-handler
    OcorrenciaBloco.tsx       # Ocorrencia: cor da área, clicável -> editar
    OcorrenciaDialog.tsx      # form criar/editar
    AreaMultiSelect.tsx       # Autocomplete multi + swatch de cor por área
    ExcecoesHorarioForm.tsx   # useFieldArray: data + horaInicio + horaFim por exceção
```

**Regra de cor multi-área** (`resolver-cor-ocorrencia.ts`): 1 área = cor sólida. 2+ áreas = cor da primeira + dots pequenos das demais no canto do bloco (mais legível que gradiente em blocos finos de month view).

**Expansão de recorrência** (`expandir-ocorrencia-em-dias.ts`): `eachDayOfInterval(dataInicio, dataFim)`, para cada dia busca exceção por `isSameDay`; sem exceção usa horário default. Cada dia vira um evento pontual separado no `react-big-calendar` (todos carregando o mesmo `ocorrenciaId` — clicar em qualquer um abre a edição da ocorrência inteira).

**Regra de interação**: `EventoBloco` (Eventos) sem `onClick`, sem cursor pointer, `onSelectEvent` ignora se `tipo === 'evento'`. Clique em slot vazio sempre abre criação de Ocorrência (Eventos não bloqueiam).

**Form da Ocorrência** (`OcorrenciaDialog.tsx`):
1. `título` — TextField obrigatório.
2. `de`/`até` — dois `DateTimePicker`, `minDateTime={de}` no de "até".
3. `nota` — TextField multiline opcional.
4. `áreas responsáveis` — Autocomplete multi sobre `useListarAreasQuery`, swatch de cor por opção.
5. Seção "Horários por dia" (só aparece se range > 1 dia): lista de exceções via `useFieldArray`, cada linha com DatePicker restrito a `[de,até]` + horaInicio + horaFim.

Validação zod: `título` obrigatório; `até >= de`; cada exceção dentro do range; hora fim > hora início.

---

## 6. Áreas — UI cor

### `modules/areas/components/AreasLista.tsx` (dialog criação)
`<input type="color">` nativo ao lado do TextField nome (zero dependência nova, sem lib de color-picker instalada hoje). Incluir `cor` no payload de `criarArea`.

### `modules/areas/components/AreaDetalhes.tsx` (edição)
Mesmo padrão: `<input type="color">` no modo edição, inicializado de `area.cor`. Exibir swatch (círculo) mesmo fora do modo edição, como referência visual.

---

## 7. Sidebar + rota

### `app/(authenticated)/components/Sidebar.tsx`
Inserir logo após `criar-evento`, mesma seção EVENTOS, mesmo `allowedRoles: ["lider","backoffice"]`:
```ts
{ id: "calendario", label: "Calendário", icon: <IconifyIcon icon="material-symbols:calendar-month-outline" width={20} />, href: "/calendario", allowedRoles: ["lider", "backoffice"] },
```

### `app/(authenticated)/calendario/page.tsx` (novo, espelha `eventos/criar/page.tsx`)
```tsx
"use client";
import CalendarioModule from "@/modules/calendario";
export default function CalendarioPage() {
  return <CalendarioModule />;
}
```

---

## 8. Verificação end-to-end

1. `prisma db push` + `generate`; instalar `@mui/x-date-pickers`, `date-fns`, `react-big-calendar`.
2. Criar área com cor em `/areas` → confirmar `cor` retorna na API e persiste após reload.
3. Criar ocorrência simples (1 dia, 1 área) em `/calendario` → bloco aparece na view mês com cor exata da área.
4. Ocorrência multi-dia (dia 1 a 7, default 09:00-10:00) + exceção dia 5 (14:00-15:00) → view semana do dia 5 mostra horário de exceção, demais dias mostram default.
5. Adicionar 2ª área à ocorrência → bloco mostra cor da 1ª área + dot da 2ª.
6. Mudar cor de uma área já usada (sem tocar na ocorrência) → calendário reflete nova cor automaticamente (prova que cor não foi congelada na criação).
7. Evento (de `/eventos`) aparece no calendário com cor neutra fixa, clique não faz nada; slot vazio sobre um Evento ainda abre criação de Ocorrência normalmente.
8. Validação: `até < de` bloqueia salvar; exceção com data fora do range bloqueia.
9. Deletar ocorrência → some do calendário, cascade remove áreas/exceções (checar Prisma Studio).
10. Usuário `membro` não vê "Calendário" no sidebar; POST/PUT/DELETE direto em `/ocorrencias-calendario` retorna 403.

---

## Resumo de arquivos

**Backend**
- `prisma/schema.prisma` — `Area.cor` + 3 models novos
- `src/routes/areas.ts` — suporte `cor`
- `src/routes/ocorrenciasCalendario.ts` — novo
- registro de rota em `src/index.ts`

**Frontend**
- `package.json` — `@mui/x-date-pickers`, `date-fns`, `react-big-calendar`
- `config/redux/api/areasApi.ts`, `types/area.types.ts` — campo `cor`
- `config/redux/api/ocorrenciasCalendarioApi.ts` — novo
- `config/redux/api/baseApi.ts` — tag `OcorrenciasCalendario`
- `modules/calendario/**` — módulo novo completo
- `modules/areas/components/AreasLista.tsx`, `AreaDetalhes.tsx` — input cor
- `app/(authenticated)/components/Sidebar.tsx` — entry nova
- `app/(authenticated)/calendario/page.tsx` — novo wrapper
