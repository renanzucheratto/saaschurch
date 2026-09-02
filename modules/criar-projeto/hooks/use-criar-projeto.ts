"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCadastrarProjetoMutation } from "@/config/redux/api/projetosApi";
import { getApiErrorMessage } from "@/config/helpers/get-api-error-message";
import { criarProjetoSchema, type CriarProjetoSchema } from "../schemas/criar-projeto.schema";
import { ETAPAS_CRIAR_PROJETO, ITEM_PROJETO_VAZIO } from "../helpers/constants";
import { calcularTotalItens } from "../helpers/calcular-total-itens";
import { montarPayload } from "../helpers/montar-payload";
import type { AlertState } from "../types";

export const useCriarProjeto = () => {
  const router = useRouter();
  const [cadastrarProjeto, { isLoading }] = useCadastrarProjetoMutation();

  const [etapaAtual, setEtapaAtual] = useState(0);
  const [etapasConcluidas, setEtapasConcluidas] = useState<number[]>([]);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    severity: "success",
  });

  const form = useForm<CriarProjetoSchema>({
    resolver: zodResolver(criarProjetoSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      descricao: "",
      ideias: "",
      data_inicio: "",
      data_fim: "",
      areaIds: [],
      itens: [{ ...ITEM_PROJETO_VAZIO }],
    },
  });

  const { control, handleSubmit, trigger, formState } = form;
  const itensArray = useFieldArray({ control, name: "itens" });

  const itens = useWatch({ control, name: "itens" });
  const total = useMemo(() => calcularTotalItens(itens), [itens]);

  const etapa = ETAPAS_CRIAR_PROJETO[etapaAtual];
  const ehUltimaEtapa = etapaAtual === ETAPAS_CRIAR_PROJETO.length - 1;

  const avancar = async () => {
    const valido = etapa.campos.length === 0 || (await trigger(etapa.campos));
    if (!valido) return;
    setEtapasConcluidas((atual) =>
      atual.includes(etapaAtual) ? atual : [...atual, etapaAtual],
    );
    setEtapaAtual((atual) => Math.min(atual + 1, ETAPAS_CRIAR_PROJETO.length - 1));
  };

  const voltar = () => setEtapaAtual((atual) => Math.max(atual - 1, 0));

  const irParaEtapa = (indice: number) => {
    if (indice <= etapaAtual || etapasConcluidas.includes(indice - 1)) {
      setEtapaAtual(indice);
    }
  };

  const etapaTemErro = (indice: number) =>
    ETAPAS_CRIAR_PROJETO[indice].campos.some(
      (campo) => !!formState.errors[campo as keyof CriarProjetoSchema],
    );

  const fecharAlert = () => setAlert((atual) => ({ ...atual, open: false }));

  const voltarParaListagem = () => router.push("/projetos");

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await cadastrarProjeto(montarPayload(data)).unwrap();
      setAlert({ open: true, message: "Projeto criado com sucesso!", severity: "success" });
      router.push(`/projetos/${result.id}`);
    } catch (error) {
      setAlert({
        open: true,
        message: getApiErrorMessage(error, "Erro ao criar projeto"),
        severity: "error",
      });
    }
  });

  return {
    form,
    itensArray,
    etapas: ETAPAS_CRIAR_PROJETO,
    etapa,
    etapaAtual,
    etapasConcluidas,
    ehUltimaEtapa,
    etapaTemErro,
    avancar,
    voltar,
    irParaEtapa,
    total,
    isLoading,
    isValid: formState.isValid,
    alert,
    fecharAlert,
    onSubmit,
    voltarParaListagem,
  };
};
