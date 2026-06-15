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
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { Control, Controller, useFieldArray, useWatch, FieldErrors } from "react-hook-form";
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

const TEXTO_TERMO_PADRAO =
  "Concordo com as condições contidas nesse formulário de inscrição da Igreja Formosa de Cristo.";

interface CamposCustomizadosManagerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: FieldErrors<any>;
  // Quando true, campos já salvos (com id) não podem ser removidos, apenas ocultados.
  bloquearRemocaoSalvos?: boolean;
}

interface SortableFieldProps {
  id: string;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  camposErrors: any;
  removerDesabilitado: boolean;
  isDragDisabled?: boolean;
  onRemove: () => void;
}

const SortableField = ({
  id,
  index,
  control,
  camposErrors,
  isDragDisabled = false,
}: SortableFieldProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: isDragDisabled });

  const tipo = useWatch({ control, name: `campos_customizados.${index}.tipo` });
  const isAceiteTermo = tipo === "aceite_termo";

  if (isAceiteTermo) {
    console.log(control)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} variant="outlined" sx={{ p: 2, bgcolor: "#FAFAFA" }}>
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
                console.log('>>>', termoField)
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

              <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
                <Controller
                  name={`campos_customizados.${index}.obrigatorio`}
                  control={control}
                  render={({ field: f }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={!!f.value}
                          onChange={(e) => f.onChange(e.target.checked)}
                        />
                      }
                      label={<Typography variant="body2">Obrigatório</Typography>}
                    />
                  )}
                />
                <Controller
                  name={`campos_customizados.${index}.oculto`}
                  control={control}
                  render={({ field: f }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={!!f.value}
                          onChange={(e) => f.onChange(e.target.checked)}
                        />
                      }
                      label={<Typography variant="body2">Ocultar</Typography>}
                    />
                  )}
                />
              </Stack>
            </>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

export const CamposCustomizadosManager = ({
  control,
  errors,
  bloquearRemocaoSalvos = false,
}: CamposCustomizadosManagerProps) => {
  const { fields, append, remove, move } = useFieldArray({
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

  const adicionarTexto = () => {
    append({ label: "", tipo: "texto", obrigatorio: false, oculto: false });
    setAnchorEl(null);
  };

  const adicionarEmail = () => {
    append({ label: "", tipo: "email", obrigatorio: false, oculto: false });
    setAnchorEl(null);
  };

  const adicionarCPF = () => {
    append({ label: "", tipo: "cpf", obrigatorio: false, oculto: false });
    setAnchorEl(null);
  };

  const adicionarRG = () => {
    append({ label: "", tipo: "rg", obrigatorio: false, oculto: false });
    setAnchorEl(null);
  };

  const adicionarTelefone = () => {
    append({ label: "", tipo: "telefone", obrigatorio: false, oculto: false });
    setAnchorEl(null);
  };

  const adicionarAceiteTermo = () => {
    append({
      label: "",
      tipo: "aceite_termo",
      obrigatorio: true,
      oculto: false,
      textoTermo: TEXTO_TERMO_PADRAO,
    });
    setAnchorEl(null);
  };

  return (
    <Card variant="outlined" sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1A1A1A" }}>
            Campos do formulário
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Defina os campos que serão coletados no formulário de inscrição
          </Typography>
        </Box>
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
          <MenuItem onClick={adicionarTexto}>Campo de texto</MenuItem>
          <MenuItem onClick={adicionarEmail}>E-mail</MenuItem>
          <MenuItem onClick={adicionarCPF}>CPF</MenuItem>
          <MenuItem onClick={adicionarRG}>RG</MenuItem>
          <MenuItem onClick={adicionarTelefone}>Telefone</MenuItem>
          <Tooltip
            title={jaTemAceiteTermo ? "Só é permitido um aceite de termo por formulário" : ""}
            placement="left"
          >
            <span>
              <MenuItem onClick={adicionarAceiteTermo} disabled={jaTemAceiteTermo}>
                Aceite de termo
              </MenuItem>
            </span>
          </Tooltip>
        </Menu>
      </Stack>

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
                    removerDesabilitado={removerDesabilitado}
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
    </Card>
  );
};
