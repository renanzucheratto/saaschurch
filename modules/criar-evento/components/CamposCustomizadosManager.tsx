"use client";

import { useState } from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
  Menu,
  MenuItem,
  ListSubheader,
  Chip,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import {
  Control,
  Controller,
  useController,
  useFieldArray,
  useWatch,
  FieldErrors,
} from "react-hook-form";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardWithTitle } from "@/components/card-with-title";
import { TipoCampoCustomizado, TIPOS_COM_OPCOES } from "@/types/evento.types";
import { OpcoesEditor } from "./OpcoesEditor";

// Rótulo curto de cada tipo, exibido como chip no topo do campo.
const LABEL_TIPO: Record<TipoCampoCustomizado, string> = {
  texto: "Texto",
  email: "E-mail",
  cpf: "CPF",
  rg: "RG",
  telefone: "Telefone",
  checkbox: "Múltipla escolha",
  radio: "Seleção única",
  select: "Lista",
  aceite_termo: "Aceite de termo",
};

const SUBHEADER_SX = {
  lineHeight: 2,
  fontSize: "0.68rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "text.secondary",
};

const TEXTO_TERMO_PADRAO =
  "Concordo com as condições contidas nesse formulário de inscrição da Igreja Formosa de Cristo.";

interface CamposCustomizadosManagerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>;
  // Quando true, campos já salvos (com id) não exibem o botão de remover — só podem ser ocultados.
  // Campos recém-adicionados (sem id) continuam removíveis.
  bloquearRemocaoSalvos?: boolean;
  // Quando false, nenhum campo pode ser removido (ex: na edição do evento). Default true.
  permitirRemocao?: boolean;
  // Quando true, campo oculto ganha aparência de bloqueado (borda tracejada, tudo em cinza).
  // Usado só na edição do evento, onde ocultar é a alternativa a excluir.
  destacarOcultos?: boolean;
}

interface SortableFieldProps {
  id: string;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  camposErrors: any;
  permitirRemocao: boolean;
  removerDesabilitado: boolean;
  destacarOcultos: boolean;
  isDragDisabled?: boolean;
  onRemove: () => void;
}

const SortableField = ({
  id,
  index,
  control,
  camposErrors,
  permitirRemocao,
  removerDesabilitado,
  destacarOcultos,
  isDragDisabled = false,
  onRemove,
}: SortableFieldProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: isDragDisabled });

  const tipo: TipoCampoCustomizado = useWatch({
    control,
    name: `campos_customizados.${index}.tipo`,
  });
  const isAceiteTermo = tipo === "aceite_termo";
  const temOpcoes = TIPOS_COM_OPCOES.includes(tipo);

  // Campo obrigatório não pode ser ocultado: o inscrito precisa conseguir responder.
  const { field: obrigatorioField } = useController({
    control,
    name: `campos_customizados.${index}.obrigatorio`,
  });
  const { field: ocultoField } = useController({
    control,
    name: `campos_customizados.${index}.oculto`,
  });
  const isObrigatorio = !!obrigatorioField.value;

  const alterarObrigatorio = (checked: boolean) => {
    obrigatorioField.onChange(checked);
    if (checked && ocultoField.value) ocultoField.onChange(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  // Campo oculto ganha aparência de bloqueado: borda tracejada e tudo em cinza.
  const isOculto = destacarOcultos && !isObrigatorio && !!ocultoField.value;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: isOculto ? "#F2F2F2" : "#FAFAFA",
        ...(isOculto && {
          borderStyle: "dashed",
          borderColor: "#BDBDBD",
          color: "#9E9E9E",
          "& .MuiTypography-root": { color: "#9E9E9E" },
          "& .MuiFormLabel-root": { color: "#9E9E9E" },
          "& .MuiInputBase-input": { color: "#8A8A8A", WebkitTextFillColor: "#8A8A8A" },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D6D6D6", borderStyle: "dashed" },
          "& .MuiChip-root": { color: "#757575", bgcolor: "#E4E4E4" },
          "& .MuiSvgIcon-root, & .iconify": { color: "#9E9E9E" },
        }),
      }}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <IconButton
          size="small"
          disabled={isDragDisabled}
          sx={{ p: 0.5, mt: 0.5, cursor: isDragDisabled ? "default" : "grab", touchAction: "none" }}
          {...attributes}
          {...listeners}
        >
          <IconifyIcon icon="material-symbols:drag-indicator" width={20} />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          {isAceiteTermo ? (
            <Controller
              name={`campos_customizados.${index}.textoTermo`}
              control={control}
              render={({ field: termoField }) => {
                return <TextField
                  {...termoField}
                  value={termoField.value ?? ""}
                  label="Texto do aceite de termo"
                  placeholder={TEXTO_TERMO_PADRAO}
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  error={!!camposErrors?.[index]?.textoTermo}
                  helperText={camposErrors?.[index]?.textoTermo?.message}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              }}
            />
          ) : (
            <>
              <Chip
                label={LABEL_TIPO[tipo] ?? tipo}
                size="small"
                sx={{
                  mb: 1,
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "primary.dark",
                  bgcolor: "#f2eefc",
                }}
              />

              <Controller
                name={`campos_customizados.${index}.label`}
                control={control}
                render={({ field: labelField }) => (
                  <TextField
                    {...labelField}
                    value={labelField.value ?? ""}
                    label={`Campo ${index + 1}`}
                    placeholder="Ex: Nome para o crachá"
                    size="small"
                    fullWidth
                    error={!!camposErrors?.[index]?.label}
                    helperText={camposErrors?.[index]?.label?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  />
                )}
              />

              {temOpcoes && (
                <OpcoesEditor
                  control={control}
                  index={index}
                  tipo={tipo}
                  erro={camposErrors?.[index]?.opcoes?.message}
                />
              )}

              <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={isObrigatorio}
                      onChange={(e) => alterarObrigatorio(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">Obrigatório</Typography>}
                />
                <Tooltip
                  title={isObrigatorio ? "Campo obrigatório não pode ser ocultado" : ""}
                  placement="top"
                >
                  <FormControlLabel
                    disabled={isObrigatorio}
                    control={
                      <Switch
                        size="small"
                        checked={!isObrigatorio && !!ocultoField.value}
                        onChange={(e) => ocultoField.onChange(e.target.checked)}
                      />
                    }
                    label={<Typography variant="body2">Ocultar</Typography>}
                  />
                </Tooltip>
              </Stack>
            </>
          )}
        </Box>

        {permitirRemocao && !removerDesabilitado && (
          <Tooltip title="Remover campo" placement="left">
            <span>
              <IconButton
                size="small"
                onClick={onRemove}
                sx={{ p: 0.5, mt: 0.5, color: "#999", "&:hover": { color: "#d32f2f" } }}
              >
                <IconifyIcon icon="material-symbols:delete-outline" width={20} />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Card>
  );
};

export const CamposCustomizadosManager = ({
  control,
  errors,
  bloquearRemocaoSalvos = false,
  permitirRemocao = true,
  destacarOcultos = false,
}: CamposCustomizadosManagerProps) => {
  const { fields, append, insert, remove, move } = useFieldArray({
    control,
    name: "campos_customizados",
    keyName: "_key",
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuAberto = Boolean(anchorEl);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const camposErrors = (errors?.campos_customizados as any) ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jaTemAceiteTermo = fields.some((f) => (f as any).tipo === "aceite_termo");

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f._key === active.id);
    const newIndex = fields.findIndex((f) => f._key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Aceite de termo sempre permanece na última posição.
    const isLastIndex = fields.length - 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((fields[oldIndex] as any).tipo === "aceite_termo") return;
    if (newIndex === isLastIndex) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((fields[isLastIndex] as any).tipo === "aceite_termo") return;
    }

    arrayMove(fields, oldIndex, newIndex);
    move(oldIndex, newIndex);
  };

  // O aceite de termo fica sempre no fim; os outros campos entram antes dele.
  const adicionarCampo = (tipo: TipoCampoCustomizado) => {
    setAnchorEl(null);

    if (tipo === "aceite_termo") {
      append({
        label: "",
        tipo,
        obrigatorio: true,
        oculto: false,
        textoTermo: TEXTO_TERMO_PADRAO,
      });
      return;
    }

    // Campo novo nasce obrigatório (e, pela regra, nunca oculto).
    const novoCampo = {
      label: "",
      tipo,
      obrigatorio: true,
      oculto: false,
      ...(TIPOS_COM_OPCOES.includes(tipo) ? { opcoes: ["", ""] } : {}),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const indexAceite = fields.findIndex((f) => (f as any).tipo === "aceite_termo");

    if (indexAceite > -1) insert(indexAceite, novoCampo);
    else append(novoCampo);
  };

  return (
    <CardWithTitle
      title={
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Campos do formulário
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Defina os campos que serão coletados no formulário de inscrição
          </Typography>
        </>
      }
      actions={
        <>
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconifyIcon icon="material-symbols:add" width={18} />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
          >
            Adicionar campo
          </Button>
          <Menu anchorEl={anchorEl} open={menuAberto} onClose={() => setAnchorEl(null)}>
            <ListSubheader sx={SUBHEADER_SX}>Dados do participante</ListSubheader>
            <MenuItem onClick={() => adicionarCampo("texto")}>Campo de texto</MenuItem>
            <MenuItem onClick={() => adicionarCampo("email")}>E-mail</MenuItem>
            <MenuItem onClick={() => adicionarCampo("cpf")}>CPF</MenuItem>
            <MenuItem onClick={() => adicionarCampo("rg")}>RG</MenuItem>
            <MenuItem onClick={() => adicionarCampo("telefone")}>Telefone</MenuItem>

            <ListSubheader sx={SUBHEADER_SX}>Perguntas com opções</ListSubheader>
            <MenuItem onClick={() => adicionarCampo("checkbox")}>Múltipla escolha</MenuItem>
            <MenuItem onClick={() => adicionarCampo("radio")}>Seleção única</MenuItem>
            <MenuItem onClick={() => adicionarCampo("select")}>Lista de opções</MenuItem>

            <ListSubheader sx={SUBHEADER_SX}>Especiais</ListSubheader>
            <Tooltip
              title={jaTemAceiteTermo ? "Só é permitido um aceite de termo por formulário" : ""}
              placement="left"
            >
              <span>
                <MenuItem onClick={() => adicionarCampo("aceite_termo")} disabled={jaTemAceiteTermo}>
                  Aceite de termo
                </MenuItem>
              </span>
            </Tooltip>
          </Menu>
        </>
      }
    >
      {fields.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f._key)}
            strategy={verticalListSortingStrategy}
          >
            <Stack spacing={2}>
              {fields.map((field, index) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const campoSalvo = !!(field as any).id;
                const removerDesabilitado = bloquearRemocaoSalvos && campoSalvo;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const isAceiteTermo = (field as any).tipo === "aceite_termo";

                return (
                  <SortableField
                    key={field._key}
                    id={field._key}
                    index={index}
                    control={control}
                    camposErrors={camposErrors}
                    permitirRemocao={permitirRemocao}
                    removerDesabilitado={removerDesabilitado}
                    destacarOcultos={destacarOcultos}
                    isDragDisabled={isAceiteTermo}
                    onRemove={() => remove(index)}
                  />
                );
              })}
            </Stack>
          </SortableContext>
        </DndContext>
      ) : (
        <Box sx={{ textAlign: "center", py: 4, color: "#999" }}>
          <IconifyIcon icon="material-symbols:list-alt-outline" width={40} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Nenhum campo adicionado. Adicione campos para o formulário de inscrição.
          </Typography>
        </Box>
      )}

      {fields.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Tooltip title="Adicionar campo" placement="top">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                width: 36,
                height: 36,
                color: "primary.main",
                border: "2px dashed",
                borderColor: "primary.light",
                "&:hover": {
                  color: "primary.dark",
                  borderColor: "primary.main",
                  borderStyle: "solid",
                  bgcolor: "#f2eefc",
                },
              }}
            >
              <IconifyIcon icon="material-symbols:add" width={20} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </CardWithTitle>
  );
};
