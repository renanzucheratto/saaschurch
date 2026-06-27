'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AreasLista } from '@/modules/areas/components/AreasLista';

export default function AreasPage() {
  const router = useRouter();

  const handleSelectArea = (id: string) => {
    router.push(`/areas/${id}`);
  };

  return <AreasLista onSelectArea={handleSelectArea} />;
}
