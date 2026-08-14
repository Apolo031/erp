import ContratoForm from '@/features/contratos/ContratoForm';

export default function ContratoPage({ params }) {
  return <ContratoForm id={params.id} />;
}
