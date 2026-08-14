'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import PageHead from '@/components/ui/PageHead';
import DataTable from '@/components/ui/DataTable';
import Pill from '@/components/ui/Pill';

export default function InmueblesPage() {
  const { items, loading } = useCollection('inmuebles', { orderByField: 'direccion', direction: 'asc' });
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((i) =>
      `${i.codigo} ${i.direccion} ${i.barrio}`.toLowerCase().includes(term)
    );
  }, [items, search]);

  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'direccion', header: 'Inmueble', render: (i) => <div className="cell-main">{i.direccion}</div> },
    { key: 'tipoLabel', header: 'Tipo' },
    { key: 'ciudad', header: 'Ciudad / barrio', render: (i) => [i.ciudad, i.barrio].filter(Boolean).join(' · ') },
    { key: 'area', header: 'Área', render: (i) => (i.area ? `${i.area} m²` : '—') },
    { key: 'estado', header: 'Estado', render: (i) => <Pill status={i.estado}>{i.estadoLabel}</Pill> },
  ];

  return (
    <section>
      <PageHead
        title="Inmuebles"
        subtitle={`${items.length} inmuebles registrados`}
        action={<button className="btn btn-primary" onClick={() => router.push('/inmuebles/nuevo')}>+ Nuevo inmueble</button>}
      />
      <div className="toolbar">
        <input className="search" placeholder="Buscar por código, dirección o barrio..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span style={{ fontSize: '.78rem', color: 'var(--mute)' }}>Haz clic sobre una fila para editarla</span>
      </div>
      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} onRowClick={(row) => router.push(`/inmuebles/${row.id}`)} />
      )}
    </section>
  );
}
