'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import PageHead from '@/components/ui/PageHead';
import DataTable from '@/components/ui/DataTable';

export default function PropietariosPage() {
  const { items, loading } = useCollection('propietarios', { orderByField: 'nombres', direction: 'asc' });
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((p) =>
      `${p.nombres} ${p.apellidos} ${p.cedula}`.toLowerCase().includes(term)
    );
  }, [items, search]);

  const columns = [
    { key: 'nombre', header: 'Propietario', render: (p) => <div className="cell-main">{p.nombres} {p.apellidos}</div> },
    { key: 'cedula', header: 'Documento' },
    { key: 'tipoTitular', header: 'Tipo' },
    { key: 'inmuebles', header: 'Inmuebles', render: (p) => p.inmuebles || 0 },
    { key: 'contacto', header: 'Contacto', render: (p) => p.celular || p.telefono || '—' },
  ];

  return (
    <section>
      <PageHead
        title="Propietarios"
        subtitle={`${items.length} propietarios registrados`}
        action={<button className="btn btn-primary" onClick={() => router.push('/propietarios/nuevo')}>+ Nuevo propietario</button>}
      />
      <div className="toolbar">
        <input className="search" placeholder="Buscar por nombre o documento..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span style={{ fontSize: '.78rem', color: 'var(--mute)' }}>Haz clic sobre una fila para editarla</span>
      </div>
      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} onRowClick={(row) => router.push(`/propietarios/${row.id}`)} />
      )}
    </section>
  );
}
