'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import PageHead from '@/components/ui/PageHead';
import DataTable from '@/components/ui/DataTable';
import Pill from '@/components/ui/Pill';
import { formatDate } from '@/lib/format';

export default function ContratosPage() {
  const { items, loading } = useCollection('contratos', { orderByField: 'createdAt', direction: 'desc' });
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((c) =>
      `${c.codigo} ${c.arrendatarioNombre} ${c.inmuebleLabel}`.toLowerCase().includes(term)
    );
  }, [items, search]);

  const activos = items.filter((c) => c.estado === 'activo').length;
  const vencidos = items.filter((c) => c.estado === 'vencido').length;

  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'arrendatario', header: 'Arrendatario', render: (c) => <div className="cell-main">{c.arrendatarioNombre}</div> },
    { key: 'inmuebleLabel', header: 'Inmueble' },
    { key: 'canon', header: 'Canon' },
    { key: 'vence', header: 'Vence', render: (c) => formatDate(c.fechaVencimiento) },
    { key: 'estado', header: 'Estado', render: (c) => <Pill status={c.estado}>{c.estadoLabel}</Pill> },
  ];

  return (
    <section>
      <PageHead
        title="Contratos"
        subtitle={`${items.length} contratos · ${activos} activos, ${vencidos} vencidos`}
        action={<button className="btn btn-primary" onClick={() => router.push('/contratos/nuevo')}>+ Nuevo contrato</button>}
      />
      <div className="toolbar">
        <input className="search" placeholder="Buscar por código, arrendatario o inmueble..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span style={{ fontSize: '.78rem', color: 'var(--mute)' }}>Haz clic sobre una fila para editarla</span>
      </div>
      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} onRowClick={(row) => router.push(`/contratos/${row.id}`)} />
      )}
    </section>
  );
}
