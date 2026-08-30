"use client";

import { useRef, useState } from "react";
import {
  Typography,
  Stack,
  Button,
  IconButton,
  Link,
  CircularProgress,
} from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { CardWithTitle } from "@/components/card-with-title";
import {
  useUploadAnexoProjetoMutation,
  useRemoverAnexoProjetoMutation,
} from "@/config/redux/api/projetosApi";
import type { AnexoProjeto, TipoAnexo } from "@/types/projeto.types";

interface AnexosCardProps {
  projetoId: string;
  anexos: AnexoProjeto[];
  tipo: TipoAnexo;
  titulo: string;
  descricao: string;
  podeGerenciar: boolean;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function AnexosCard({
  projetoId,
  anexos,
  tipo,
  titulo,
  descricao,
  podeGerenciar,
  onError,
  onSuccess,
}: AnexosCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadAnexo, { isLoading: isUploading }] = useUploadAnexoProjetoMutation();
  const [removerAnexo] = useRemoverAnexoProjetoMutation();
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const anexosFiltrados = anexos.filter((a) => a.tipo === tipo);

  const getErrorMessage = (value: unknown): string => {
    if (typeof value === "object" && value !== null && "data" in value) {
      const data = (value as { data?: unknown }).data;
      if (typeof data === "object" && data !== null && "error" in data) {
        const errorValue = (data as { error?: unknown }).error;
        if (typeof errorValue === "string") return errorValue;
      }
    }
    return "Erro ao processar anexo";
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAnexo({ projetoId, tipo, arquivo: file }).unwrap();
      onSuccess("Anexo enviado com sucesso!");
    } catch (error) {
      onError(getErrorMessage(error));
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (anexoId: string) => {
    setRemovendoId(anexoId);
    try {
      await removerAnexo({ projetoId, anexoId }).unwrap();
      onSuccess("Anexo removido.");
    } catch (error) {
      onError(getErrorMessage(error));
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <CardWithTitle
      title={
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {descricao}
          </Typography>
        </>
      }
      actions={
        podeGerenciar ? (
          <>
            <input
              ref={inputRef}
              type="file"
              hidden
              onChange={handleFile}
              accept="image/*,application/pdf"
            />
            <Button
              variant="outlined"
              size="small"
              disabled={isUploading}
              startIcon={
                isUploading ? (
                  <CircularProgress size={16} />
                ) : (
                  <IconifyIcon icon="material-symbols:upload" width={18} />
                )
              }
              onClick={() => inputRef.current?.click()}
              sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 600 }}
            >
              Anexar
            </Button>
          </>
        ) : undefined
      }
    >
      {anexosFiltrados.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          Nenhum anexo adicionado.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {anexosFiltrados.map((anexo) => (
            <Stack
              key={anexo.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ p: 1, bgcolor: "#FAFAFA", borderRadius: 1.5 }}
            >
              <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                <IconifyIcon icon="material-symbols:description-outline" width={20} />
                <Link
                  href={anexo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    fontSize: 14,
                    color: "#5B5FED",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {anexo.nome}
                </Link>
              </Stack>
              {podeGerenciar && (
                <IconButton
                  size="small"
                  disabled={removendoId === anexo.id}
                  onClick={() => handleRemove(anexo.id)}
                  sx={{ color: "#999", "&:hover": { color: "#d32f2f" } }}
                >
                  {removendoId === anexo.id ? (
                    <CircularProgress size={16} />
                  ) : (
                    <IconifyIcon icon="material-symbols:delete-outline" width={18} />
                  )}
                </IconButton>
              )}
            </Stack>
          ))}
        </Stack>
      )}
    </CardWithTitle>
  );
}
