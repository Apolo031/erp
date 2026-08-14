'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import PageHead from '@/components/ui/PageHead';
import DataTable from '@/components/ui/DataTable';
import Pill from '@/components/ui/Pill';

export default function ArrendatariosPage() {
  const { items, loading } = useCollection('arrendatarios', { orderByField: 'nombres', direction: 'asc' });
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((a) =>
      `${a.nombres} ${a.apellidos} ${a.empresa} ${a.cedula}`.toLowerCase().includes(term)
    );
  }, [items, search]);

  const columns = [
    { key: 'nombre', header: 'Arrendatario', render: (a) => <div className="cell-main">{a.nombres} {a.apellidos}</div> },
    { key: 'empresa', header: 'Empresa / actividad', render: (a) => a.empresa || a.actividad || '—' },
    { key: 'inmuebleLabel', header: 'Inmueble', render: (a) => a.inmuebleLabel || 'Sin asignar' },
    { key: 'estado', header: 'Estado pago', render: (a) => <Pill status={a.estado}>{a.estadoLabel}</Pill> },
    { key: 'contacto', header: 'Contacto', render: (a) => a.celular || '—' },
  ];

  return (
    <section>
      <PageHead
        title="Arrendatarios"
        subtitle={`${items.length} arrendatarios activos e históricos`}
        action={<button className="btn btn-primary" onClick={() => router.push('/arrendatarios/nuevo')}>+ Nuevo arrendatario</button>}
      />
      <div className="toolbar">
        <input className="search" placeholder="Buscar por nombre, empresa o documento..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span style={{ fontSize: '.78rem', color: 'var(--mute)' }}>Haz clic sobre una fila para editarla</span>
      </div>
      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} onRowClick={(row) => router.push(`/arrendatarios/${row.id}`)} />
      )}
    </section>
  );
}
