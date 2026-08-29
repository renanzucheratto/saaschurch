'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useSimularTaxasQuery, useLazySimularTaxasQuery } from '@/config/redux/api/pagbankApi';

interface Props {
  /** Valor digitado no campo do produto, já mascarado (ex.: "R$ 50,00"). */
  valorMascarado?: string;
  /** Preenche o campo Valor do produto quando a calculadora sugere um preço. */
  onSugerirValor?: (valor: number) => void;
}

/** Converte "R$ 1.234,56" em 1234.56. */
function paraNumero(mascarado?: string): number {
  if (!mascarado) return 0;
  const limpo = String(mascarado).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Mostra quanto sobra para a instituição no preço digitado, e resolve o
 * inverso ("quero receber R$ X limpos") — sem isso o preço é escolhido no
 * escuro e a diferença só aparece no extrato bancário.
 */
export function CalculadoraTaxas({ valorMascarado, onSugerirValor }: Props) {
  const valor = useMemo(() => paraNumero(valorMascarado), [valorMascarado]);

  // Espera a digitação parar antes de consultar — o campo dispara a cada tecla.
  const [valorEstavel, setValorEstavel] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setValorEstavel(valor), 500);
    return () => clearTimeout(id);
  }, [valor]);

  const { data, isFetching } = useSimularTaxasQuery(
    { valor: valorEstavel },
    { skip: valorEstavel <= 0 },
  );

  const [abrirInverso, setAbrirInverso] = useState(false);
  const [alvo, setAlvo] = useState('');
  const [buscarInverso, { data: inverso, isFetching: calculandoInverso }] = useLazySimularTaxasQuery();

  if (valorEstavel <= 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        Informe o valor para ver quanto a instituição recebe.
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        borderRadius: 1.5,
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
        <Icon icon="material-symbols:calculate-outline" width={18} />
        <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: 0.4 }}>
          QUANTO A INSTITUIÇÃO RECEBE
        </Typography>
        {isFetching && <CircularProgress size={12} />}
      </Stack>

      {data && (
        <Stack spacing={0.4}>
          <Linha rotulo="Valor cobrado do participante" valor={moeda(data.bruto)} />

          {/*
            Taxas somadas num número só. A divisão entre a taxa do PagBank e a
            da plataforma é assunto interno do contrato — para quem precifica o
            produto, o que importa é quanto sai do valor.
          */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Taxas
              </Typography>
              {!data.taxaPagBankDisponivel && (
                <Tooltip title="Parte das taxas depende do contrato da conta e só fica disponível em produção. O líquido abaixo pode ficar um pouco menor.">
                  <Box sx={{ display: 'flex' }}>
                    <Icon icon="material-symbols:info-outline" width={14} />
                  </Box>
                </Tooltip>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              − {moeda(data.split + data.taxaPagBank)}
            </Typography>
          </Stack>

          <Divider sx={{ my: 0.5 }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight={700}>
              Líquido na conta
            </Typography>
            <Typography variant="body2" fontWeight={700} color="success.main">
              {moeda(data.liquido)}
              {!data.taxaPagBankDisponivel && ' *'}
            </Typography>
          </Stack>

          {!data.taxaPagBankDisponivel && (
            <Typography variant="caption" color="text.secondary">
              * algumas taxas só são calculadas em produção — o valor real pode ser um pouco menor.
            </Typography>
          )}

          {/*
            A instituição absorve o custo do parcelamento, então o líquido cai
            conforme o participante parcela. Um número único esconderia isso.
          */}
          {(data.porParcela?.length ?? 0) > 1 && (
            <Box sx={{ mt: 0.75 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
                Se o participante parcelar:
              </Typography>
              <Stack spacing={0.15}>
                {data.porParcela!.map((linha) => (
                  <Stack key={linha.parcelas} direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      em {linha.parcelas}x
                    </Typography>
                    <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {moeda(linha.liquido)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}

      <Button
        size="small"
        sx={{ mt: 1, px: 0 }}
        onClick={() => setAbrirInverso((v) => !v)}
        endIcon={
          <Icon
            icon={abrirInverso ? 'material-symbols:expand-less' : 'material-symbols:expand-more'}
            width={16}
          />
        }
      >
        Calcular pelo valor que quero receber
      </Button>

      <Collapse in={abrirInverso}>
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 1 }}>
          <TextField
            label="Quero receber"
            size="small"
            placeholder="0,00"
            value={alvo}
            onChange={(e) => setAlvo(e.target.value)}
            sx={{ maxWidth: 150 }}
          />
          <Button
            size="small"
            variant="outlined"
            disabled={calculandoInverso || paraNumero(alvo) <= 0}
            onClick={() => buscarInverso({ liquidoDesejado: paraNumero(alvo) })}
            sx={{ mt: 0.25 }}
          >
            {calculandoInverso ? <CircularProgress size={16} /> : 'Calcular'}
          </Button>
        </Stack>

        {inverso?.liquidoDesejado != null && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap">
            <Typography variant="caption">
              Para receber <strong>{moeda(inverso.liquidoDesejado)}</strong>, cobre{' '}
              <strong>{moeda(inverso.bruto)}</strong>
            </Typography>
            {onSugerirValor && (
              <Chip
                size="small"
                label="Usar este valor"
                onClick={() => onSugerirValor(inverso.bruto)}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        )}
      </Collapse>
    </Box>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="caption" color="text.secondary">
        {rotulo}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {valor}
      </Typography>
    </Stack>
  );
}
