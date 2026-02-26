import { EventoForm } from '@/modules/evento-form';

interface EventoPageProps {
  params: {
    evento: string;
  };
}

export default function EventoPage({ params }: EventoPageProps) {
  return (
    <main>
      <EventoForm />
    </main>
  );
}
