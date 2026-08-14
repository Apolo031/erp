import ArrendatarioForm from '@/features/arrendatarios/ArrendatarioForm';

export default function ArrendatarioPage({ params }) {
  return <ArrendatarioForm id={params.id} />;
}
