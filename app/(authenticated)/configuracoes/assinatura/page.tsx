import { notFound } from 'next/navigation';

/**
 * Mensalidade desativada: o produto ainda não cobra as instituições.
 *
 * A implementação continua no repositório (API de Assinaturas do PagBank em
 * `routes/assinaturas.ts` e o componente `AssinaturaMensalidade`), apenas sem
 * porta de entrada. Para reativar: devolver o componente aqui e descomentar o
 * item no Sidebar.
 */
export default function AssinaturaPage() {
  notFound();
}
