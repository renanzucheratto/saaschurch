"use client";

import { useRef, useState } from "react";
import { Button, CircularProgress, IconButton, Link, Stack, Typography } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { CardWithTitle } from "@/components/card-with-title";
import { getApiErrorMessage } from "@/config/helpers/get-api-error-message";
import {
  useRemoverAnexoProjetoMutation,
  useUploadAnexoProjetoMutation,
} from "@/config/redux/api/projetosApi";
import type { AnexoProjeto, TipoAnexo } from "@/types/projeto.types";
import { useProjetoDetalhesStyles } from "../styles";

interface Props {
  projetoId: string;
  anexos: AnexoProjeto[];
  tipo: TipoAnexo;
  titulo: string;
  descricao: string;
  ancora: string;
  podeGerenciar: boolean;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export const AnexosCard = ({
  projetoId,
  anexos,
  tipo,
  titulo,
  descricao,
  ancora,
  podeGerenciar,
  onError,
  onSuccess,
}: Props) => {
  const styles = useProjetoDetalhesStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadAnexo, { isLoading: isUploading }] = useUploadAnexoProjetoMutation();
  const [removerAnexo] = useRemoverAnexoProjetoMutation();
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const anexosFiltrados = anexos.filter((a) => a.tipo === tipo);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAnexo({ projetoId, tipo, arquivo: file }).unwrap();
      onSuccess("Anexo enviado com sucesso!");
    } catch (error) {
      onError(getApiErrorMessage(error, "Erro ao processar anexo"));
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
      onError(getApiErrorMessage(error, "Erro ao processar anexo"));
    } finally {
      setRemovendoId(null);
    }
  };

  return (
    <CardWithTitle
      id={ancora}
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
              sx={styles.acaoButton}
            >
              Anexar
            </Button>
          </>
        ) : undefined
      }
    >
      {anexosFiltrados.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          {podeGerenciar
            ? 'Nenhum anexo ainda. Use "Anexar" para enviar imagem ou PDF.'
            : "Nenhum anexo adicionado."}
        </Typography>
      ) : (
        <Stack spacing={1}>
          {anexosFiltrados.map((anexo) => (
            <Stack
              key={anexo.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={styles.anexoLinha}
            >
              <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                <IconifyIcon icon="material-symbols:description-outline" width={20} />
                <Link
                  href={anexo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={styles.anexoLink}
                >
                  {anexo.nome}
                </Link>
              </Stack>
              {podeGerenciar && (
                <IconButton
                  size="small"
                  disabled={removendoId === anexo.id}
                  onClick={() => handleRemove(anexo.id)}
                  sx={styles.removerAnexo}
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
};
