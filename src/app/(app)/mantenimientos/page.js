'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import PageHead from '@/components/ui/PageHead';
import DataTable from '@/components/ui/DataTable';
import Pill from '@/components/ui/Pill';

export default function MantenimientosPage() {
  const { items, loading } = useCollection('mantenimientos', { orderByField: 'createdAt', direction: 'desc' });
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((m) =>
      `${m.inmuebleLabel} ${m.proveedor}`.toLowerCase().includes(term)
    );
  }, [items, search]);

  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'inmuebleLabel', header: 'Inmueble', render: (m) => <div className="cell-main">{m.inmuebleLabel}</div> },
    { key: 'tipo', header: 'Tipo' },
    { key: 'proveedor', header: 'Proveedor', render: (m) => m.proveedor || '—' },
    { key: 'costo', header: 'Costo', render: (m) => m.costo || '—' },
    { key: 'estado', header: 'Estado', render: (m) => <Pill status={m.estado}>{m.estadoLabel}</Pill> },
  ];

  return (
    <section>
      <PageHead
        title="Mantenimientos"
        subtitle={`${items.length} solicitudes registradas`}
        action={<button className="btn btn-primary" onClick={() => router.push('/mantenimientos/nuevo')}>+ Nueva solicitud</button>}
      />
      <div className="toolbar">
        <input className="search" placeholder="Buscar por inmueble o proveedor..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span style={{ fontSize: '.78rem', color: 'var(--mute)' }}>Haz clic sobre una fila para editarla</span>
      </div>
      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} onRowClick={(row) => router.push(`/mantenimientos/${row.id}`)} />
      )}
    </section>
  );
}
