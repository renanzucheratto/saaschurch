"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useAlterarStatusProjetoMutation } from "@/config/redux/api/projetosApi";
import type { StatusProjetoNome } from "@/types/projeto.types";

interface AlterarStatusModalProps {
  open: boolean;
  onClose: () => void;
  projetoId: string;
  novoStatus: StatusProjetoNome | null;
  titulo: string;
  descricao?: string;
  confirmColor?: "primary" | "error" | "success";
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function AlterarStatusModal({
  open,
  onClose,
  projetoId,
  novoStatus,
  titulo,
  descricao,
  confirmColor = "primary",
  onSuccess,
  onError,
}: AlterarStatusModalProps) {
  const [alterarStatus, { isLoading }] = useAlterarStatusProjetoMutation();
  const [justificativa, setJustificativa] = useState("");

  useEffect(() => {
    if (open) setJustificativa("");
  }, [open]);

  const getErrorMessage = (value: unknown): string => {
    if (typeof value === "object" && value !== null && "data" in value) {
      const data = (value as { data?: unknown }).data;
      if (typeof data === "object" && data !== null && "error" in data) {
        const errorValue = (data as { error?: unknown }).error;
        if (typeof errorValue === "string") return errorValue;
      }
    }
    return "Erro ao alterar status";
  };

  const handleConfirm = async () => {
    if (!novoStatus) return;
    try {
      await alterarStatus({
        projetoId,
        nome: novoStatus,
        justificativa: justificativa || null,
      }).unwrap();
      onSuccess("Status atualizado com sucesso!");
      onClose();
    } catch (error) {
      onError(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{titulo}</DialogTitle>
      <DialogContent>
        {descricao && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {descricao}
          </Typography>
        )}
        <TextField
          label="Justificativa (opcional)"
          fullWidth
          multiline
          minRows={3}
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          sx={{ mt: 1, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={handleConfirm}
          disabled={isLoading}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isLoading ? "Salvando..." : "Confirmar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
