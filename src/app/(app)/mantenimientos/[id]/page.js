import MantenimientoForm from '@/features/mantenimientos/MantenimientoForm';

export default function MantenimientoPage({ params }) {
  return <MantenimientoForm id={params.id} />;
}
