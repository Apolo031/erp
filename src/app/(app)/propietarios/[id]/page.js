import PropietarioForm from '@/features/propietarios/PropietarioForm';

export default function PropietarioPage({ params }) {
  return <PropietarioForm id={params.id} />;
}
