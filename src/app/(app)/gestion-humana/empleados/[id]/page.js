import EmpleadoForm from '@/features/empleados/EmpleadoForm';

export default function EmpleadoPage({ params }) {
  return <EmpleadoForm id={params.id} />;
}
