'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { QRCodeSVG } from 'qrcode.react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
  useCriarPedidoCheckoutMutation,
  useLazyChavePublicaCheckoutQuery,
  useLazyStatusPedidoCheckoutQuery,
  useResumoCheckoutQuery,
  type MetodoPagamento,
  type PedidoCheckoutResponse,
} from '@/config/redux/api/checkoutApi';
import { BORDER_RADIUS } from '@/config/utils/contants';

declare global {
  interface Window {
    PagSeguro?: {
      setUp: (params: { env: 'SANDBOX' | 'PROD' }) => void;
      encryptCard: (params: {
        publicKey: string;
        holder: string;
        number: string;
        expMonth: string;
        expYear: string;
        securityCode: string;
      }) => { encryptedCard?: string; hasErrors: boolean; errors?: Array<{ message?: string }> };
    };
  }
}

/**
 * O SDK do PagBank inicia em PROD e só troca de ambiente por `setUp`. A
 * cifragem do cartão é RSA pura e não depende disso, mas o 3DS e os serviços
 * auxiliares apontam para hosts diferentes por ambiente.
 */
const PAGBANK_ENV: 'SANDBOX' | 'PROD' =
  process.env.NEXT_PUBLIC_PAGBANK_ENV === 'production' ? 'PROD' : 'SANDBOX';

interface Props {
  participanteId: string;
  produtoId: string;
}

/** Status em que a tela deve continuar consultando o pagamento. */
const STATUS_AGUARDANDO: PedidoCheckoutResponse['status'][] = ['WAITING', 'IN_ANALYSIS', 'AUTHORIZED'];

function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function PagamentoCheckout({ participanteId, produtoId }: Props) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [criarPedido, { isLoading: criando }] = useCriarPedidoCheckoutMutation();
  const [buscarChavePublica] = useLazyChavePublicaCheckoutQuery();
  const [buscarStatus] = useLazyStatusPedidoCheckoutQuery();
  const { data: resumo } = useResumoCheckoutQuery({ participanteId, produtoId });

  const [metodo, setMetodo] = useState<MetodoPagamento>('PIX');
  const [pagamento, setPagamento] = useState<PedidoCheckoutResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [scriptCartaoPronto, setScriptCartaoPronto] = useState(false);

  const [cartao, setCartao] = useState({
    numero: '',
    nome: '',
    mes: '',
    ano: '',
    cvv: '',
    parcelas: '1',
  });

  // O PagBank exige e-mail e CPF em todo pedido, mas nem todo evento coleta
  // esses campos na inscrição. Quando a API responde que faltam, pedimos aqui
  // — é o momento em que a pessoa está presente e disposta a informar.
  const [faltando, setFaltando] = useState<Array<'email' | 'cpf'> | null>(null);
  const [contato, setContato] = useState({ email: '', cpf: '' });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Enquanto o pagamento não chega num status terminal, consulta de novo —
  // não há redirect de volta do PagBank avisando que o Pix foi pago.
  useEffect(() => {
    if (!pagamento || !STATUS_AGUARDANDO.includes(pagamento.status)) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    const intervaloMs = pagamento.metodoPagamento === 'BOLETO' ? 15000 : 5000;

    pollRef.current = setInterval(async () => {
      try {
        const atualizado = await buscarStatus(pagamento.pagamentoId).unwrap();
        setPagamento(atualizado);
      } catch {
        // Falha de rede pontual no polling não é motivo para parar de tentar.
      }
    }, intervaloMs);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagamento?.status, pagamento?.pagamentoId]);

  const gerarPedido = async (dadosCartao?: { encrypted: string; securityCode: string; parcelas: number }) => {
    setErro(null);

    if (!executeRecaptcha) {
      setErro('reCAPTCHA não está disponível. Tente novamente em instantes.');
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha('checkout_pedido');

      const resultado = await criarPedido({
        participanteId,
        produtoId,
        recaptchaToken,
        metodoPagamento: metodo,
        cartao: dadosCartao,
        ...(contato.email || contato.cpf ? { contato } : {}),
      }).unwrap();

      setPagamento(resultado);
    } catch (error) {
      const dados = (error as {
        data?: {
          error?: string;
          detalhes?: Array<{ codigo?: string; campo?: string }>;
          faltando?: Array<'email' | 'cpf'>;
        };
      })?.data;

      // Faltam dados obrigatórios: mostra o formulário em vez de um erro seco.
      if (dados?.faltando?.length) {
        setFaltando(dados.faltando);
        setErro(dados.error ?? null);
        return;
      }

      // O PagBank devolve o motivo da recusa por campo. Mostrar só "não foi
      // possível" faz a pessoa tentar o mesmo cartão de novo sem saber o quê
      // corrigir — e nós sem pista nenhuma no suporte.
      const motivos = dados?.detalhes?.map((d) => d.codigo).filter(Boolean).join(' · ');

      setErro(
        [dados?.error ?? 'Não foi possível gerar a cobrança.', motivos]
          .filter(Boolean)
          .join(' '),
      );
    }
  };

  const handlePagarComCartao = async () => {
    setErro(null);

    if (!window.PagSeguro) {
      setErro('Ainda carregando o módulo de pagamento. Tente novamente em instantes.');
      return;
    }

    try {
      const { publicKey } = await buscarChavePublica({ produtoId }).unwrap();

      const resultado = window.PagSeguro.encryptCard({
        publicKey,
        holder: cartao.nome,
        number: cartao.numero.replace(/\D/g, ''),
        expMonth: cartao.mes,
        expYear: cartao.ano,
        securityCode: cartao.cvv,
      });

      if (resultado.hasErrors || !resultado.encryptedCard) {
        setErro(resultado.errors?.[0]?.message || 'Dados do cartão inválidos.');
        return;
      }

      await gerarPedido({
        encrypted: resultado.encryptedCard,
        securityCode: cartao.cvv,
        parcelas: Number(cartao.parcelas) || 1,
      });
    } catch (error) {
      const detalhe =
        (error as { data?: { error?: string } })?.data?.error ?? 'Não foi possível processar o cartão.';
      setErro(detalhe);
    }
  };

  const carregando = criando;

  if (pagamento) {
    return <ResultadoPagamento pagamento={pagamento} />;
  }

  if (faltando) {
    const precisaEmail = faltando.includes('email');
    const precisaCpf = faltando.includes('cpf');
    const preenchido = (!precisaEmail || contato.email.trim()) && (!precisaCpf || contato.cpf.trim());

    return (
      <Card variant="outlined" sx={{ borderRadius: BORDER_RADIUS, maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={600}>
                Falta um passo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {precisaEmail && precisaCpf
                  ? 'Precisamos do seu e-mail e CPF para emitir a cobrança.'
                  : precisaEmail
                    ? 'Precisamos do seu e-mail para emitir a cobrança.'
                    : 'Precisamos do seu CPF para emitir a cobrança.'}
              </Typography>
            </Stack>

            {erro && <Alert severity="error">{erro}</Alert>}

            {precisaEmail && (
              <TextField
                label="E-mail"
                type="email"
                size="small"
                autoComplete="email"
                value={contato.email}
                onChange={(e) => setContato((c) => ({ ...c, email: e.target.value }))}
              />
            )}

            {precisaCpf && (
              <TextField
                label="CPF"
                size="small"
                inputMode="numeric"
                autoComplete="off"
                value={contato.cpf}
                onChange={(e) => setContato((c) => ({ ...c, cpf: e.target.value }))}
              />
            )}

            <Button
              variant="contained"
              size="large"
              disabled={!preenchido || criando}
              onClick={() => {
                // Volta para a escolha de forma de pagamento; os dados seguem
                // no estado e vão junto na próxima tentativa.
                setFaltando(null);
                setErro(null);
              }}
            >
              Continuar
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: BORDER_RADIUS, maxWidth: 480, width: '100%' }}>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Stack spacing={0.25}>
            <Typography variant="h6" fontWeight={600}>
              Como você quer pagar?
            </Typography>
            {resumo && (
              <Typography variant="body2" color="text.secondary">
                {resumo.produtoNome} · <strong>{moeda(resumo.valor)}</strong>
              </Typography>
            )}
          </Stack>

          <ToggleButtonGroup
            exclusive
            fullWidth
            value={metodo}
            onChange={(_e, valor) => valor && setMetodo(valor)}
            size="small"
          >
            <ToggleButton value="PIX">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Icon icon="material-symbols:pix" width={18} />
                <span>Pix</span>
              </Stack>
            </ToggleButton>
            <ToggleButton value="CREDIT_CARD">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Icon icon="material-symbols:credit-card-outline" width={18} />
                <span>Cartão</span>
              </Stack>
            </ToggleButton>
            <ToggleButton value="BOLETO">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Icon icon="material-symbols:barcode" width={18} />
                <span>Boleto</span>
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>

          <Divider />

          {erro && <Alert severity="error">{erro}</Alert>}

          {metodo === 'PIX' && (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Um QR Code Pix será gerado. O pagamento costuma ser confirmado em segundos.
              </Typography>
              <Button variant="contained" size="large" disabled={carregando} onClick={() => gerarPedido()}>
                {carregando ? <CircularProgress size={20} color="inherit" /> : 'Gerar QR Code Pix'}
              </Button>
            </Stack>
          )}

          {metodo === 'BOLETO' && (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                O boleto vence em 3 dias. A confirmação do pagamento pode levar até 2 dias úteis
                após o pagamento.
              </Typography>
              <Button variant="contained" size="large" disabled={carregando} onClick={() => gerarPedido()}>
                {carregando ? <CircularProgress size={20} color="inherit" /> : 'Gerar boleto'}
              </Button>
            </Stack>
          )}

          {metodo === 'CREDIT_CARD' && (
            <Stack spacing={1.5}>
              <Script
                src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js"
                strategy="afterInteractive"
                onLoad={() => {
                  window.PagSeguro?.setUp({ env: PAGBANK_ENV });
                  setScriptCartaoPronto(true);
                }}
              />

              <TextField
                label="Nome impresso no cartão"
                size="small"
                value={cartao.nome}
                onChange={(e) => setCartao((c) => ({ ...c, nome: e.target.value }))}
              />
              <TextField
                label="Número do cartão"
                size="small"
                inputMode="numeric"
                value={cartao.numero}
                onChange={(e) => setCartao((c) => ({ ...c, numero: e.target.value }))}
              />
              <Stack direction="row" spacing={1}>
                <TextField
                  label="Mês"
                  size="small"
                  placeholder="MM"
                  value={cartao.mes}
                  onChange={(e) => setCartao((c) => ({ ...c, mes: e.target.value }))}
                  sx={{ width: 90 }}
                />
                <TextField
                  label="Ano"
                  size="small"
                  placeholder="AAAA"
                  value={cartao.ano}
                  onChange={(e) => setCartao((c) => ({ ...c, ano: e.target.value }))}
                  sx={{ width: 110 }}
                />
                <TextField
                  label="CVV"
                  size="small"
                  value={cartao.cvv}
                  onChange={(e) => setCartao((c) => ({ ...c, cvv: e.target.value }))}
                  sx={{ width: 90 }}
                />
                <TextField
                  select
                  label="Parcelas"
                  size="small"
                  value={cartao.parcelas}
                  onChange={(e) => setCartao((c) => ({ ...c, parcelas: e.target.value }))}
                  sx={{ flex: 1 }}
                >
                  {/*
                    O PagBank recusa parcela abaixo de um valor mínimo, então
                    oferecer 12x num produto barato garante erro. A API devolve
                    quantas vezes realmente cabem.
                  */}
                  {Array.from({ length: resumo?.maxParcelas ?? 1 }, (_, i) => i + 1).map((n) => (
                    <MenuItem key={n} value={String(n)}>
                      {n}x{resumo ? ` de ${moeda(resumo.valor / n)}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Button
                variant="contained"
                size="large"
                disabled={carregando || !scriptCartaoPronto}
                onClick={handlePagarComCartao}
              >
                {carregando ? <CircularProgress size={20} color="inherit" /> : 'Pagar com cartão'}
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ResultadoPagamento({ pagamento }: { pagamento: PedidoCheckoutResponse }) {
  if (pagamento.status === 'PAID') {
    return (
      <ResultadoCard
        icone="material-symbols:check-circle-outline"
        cor="success.main"
        titulo="Pagamento aprovado"
        descricao="Sua inscrição está confirmada. Pode fechar esta página."
      />
    );
  }

  if (pagamento.status === 'DECLINED') {
    return (
      <ResultadoCard
        icone="material-symbols:cancel-outline"
        cor="error.main"
        titulo="Pagamento recusado"
        descricao="O cartão foi recusado. Procure a organização do evento para tentar de outra forma."
      />
    );
  }

  if (pagamento.metodoPagamento === 'PIX' && pagamento.qrCodeTexto) {
    return (
      <Card variant="outlined" sx={{ borderRadius: BORDER_RADIUS, maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography variant="h6" fontWeight={600}>
              Escaneie o QR Code Pix
            </Typography>

            {/*
              O QR é desenhado aqui a partir do payload copia-e-cola. Os links
              de imagem que o PagBank devolve (QRCODE.PNG / QRCODE.BASE64)
              apontam para a API autenticada — o browser não tem o token e a
              imagem quebra.
            */}
            <Box sx={{ bgcolor: '#fff', p: 2, borderRadius: 1, lineHeight: 0 }}>
              <QRCodeSVG value={pagamento.qrCodeTexto} size={220} level="M" />
            </Box>

            <Stack spacing={0.5} sx={{ width: '100%' }}>
              <Typography variant="caption" color="text.secondary">
                Ou copie o código Pix:
              </Typography>
              <TextField
                value={pagamento.qrCodeTexto}
                fullWidth
                size="small"
                multiline
                maxRows={3}
                InputProps={{ readOnly: true }}
                onFocus={(e) => e.target.select()}
              />
              <Button
                size="small"
                startIcon={<Icon icon="material-symbols:content-copy-outline" width={16} />}
                onClick={() => navigator.clipboard?.writeText(pagamento.qrCodeTexto!)}
              >
                Copiar código
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Aguardando confirmação do pagamento...
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (pagamento.metodoPagamento === 'BOLETO' && pagamento.boletoUrl) {
    return (
      <Card variant="outlined" sx={{ borderRadius: BORDER_RADIUS, maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography variant="h6" fontWeight={600}>
              Boleto gerado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Valor: {moeda(pagamento.valor)}
              {pagamento.expiraEm && ` · vencimento ${new Date(pagamento.expiraEm).toLocaleDateString('pt-BR')}`}
            </Typography>
            <Button
              variant="contained"
              href={pagamento.boletoUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Icon icon="material-symbols:receipt-long-outline" width={18} />}
            >
              Abrir boleto
            </Button>
            <Typography variant="caption" color="text.secondary">
              A confirmação do pagamento pode levar até 2 dias úteis.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // IN_ANALYSIS / AUTHORIZED (cartão em análise, sem QR/boleto)
  return (
    <ResultadoCard
      icone="material-symbols:hourglass-top-outline"
      cor="warning.main"
      titulo="Pagamento em processamento"
      descricao="Estamos confirmando seu pagamento. Isso pode levar alguns instantes."
    />
  );
}

function ResultadoCard({
  icone,
  cor,
  titulo,
  descricao,
}: {
  icone: string;
  cor: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: BORDER_RADIUS, maxWidth: 480, width: '100%' }}>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Icon icon={icone} width={64} />
          <Typography variant="h5" fontWeight={600} sx={{ color: cor }}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {descricao}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
