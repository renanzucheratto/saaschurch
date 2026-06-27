'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { AreaDetalhes } from '@/modules/areas/components/AreaDetalhes';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AreaDetalhe({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  return <AreaDetalhes areaId={id} onVoltar={() => router.push('/areas')} />;
}
