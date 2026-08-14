import InmuebleForm from '@/features/inmuebles/InmuebleForm';

export default function InmueblePage({ params }) {
  return <InmuebleForm id={params.id} />;
}
