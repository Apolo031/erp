'use client';

import Link from 'next/link';
import { useCollection } from '@/hooks/useCollection';
import Kpi from '@/components/ui/Kpi';
import Pill from '@/components/ui/Pill';
import PageHead from '@/components/ui/PageHead';
import CanonesChart from '@/components/charts/CanonesChart';
import { formatCOP } from '@/lib/format';

const TIPO_VIVIENDA = ['casa', 'apartamento'];

export default function DashboardPage() {
  const { items: propietarios } = useCollection('propietarios');
  const { items: inmuebles } = useCollection('inmuebles');
  const { items: contratos } = useCollection('contratos');

  const contratosActivos = contratos.filter((c) => c.estado === 'activo');
  const contratosVencidos = contratos.filter((c) => c.estado === 'vencido');
  const canonMensual = contratosActivos.reduce((sum, c) => sum + (Number(c.canonValor) || 0), 0);

  const porTipo = (tipoVal) => inmuebles.filter((i) => i.tipoVal === tipoVal).length;
  const arrendados = inmuebles.filter((i) => i.estado === 'arrendado').length;
  const disponibles = inmuebles.filter((i) => i.estado === 'disponible').length;
  const enRemodelacion = inmuebles.filter((i) => i.estado === 'proceso').length;

  const recientes = [...contratos].slice(0, 6);

  return (
    <section>
      <PageHead title="Consolidado" subtitle="Zona Centro Inmobiliaria — resumen general" />

      <div className="kpi-grid">
        <Kpi iconBg="var(--orange-bg)" value={inmuebles.length} label="Total de inmuebles"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-7h6v7" /></svg>} />
        <Kpi iconBg="var(--blue-bg)" value={contratosActivos.length} label="Contratos activos"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2"><path d="M7 3h8l4 4v14H7z" /><path d="M11 3v5h5" /><path d="M9 13h6M9 17h6" /></svg>} />
        <Kpi iconBg="var(--green-bg)" value={formatCOP(canonMensual)} label="Canon total mensual"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>} />
        <Kpi iconBg="var(--amber-bg)" value={contratosVencidos.length} label="Contratos vencidos"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 2 20h20z" /><path d="M12 9v5" /><circle cx="12" cy="17" r=".6" fill="var(--amber)" /></svg>} />
      </div>

      <h2 className="display section-title">Composición del inventario</h2>
      <div className="kpi-grid">
        <Kpi iconBg="var(--purple-bg)" value={propietarios.length} label="Propietarios"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /><circle cx="18" cy="9" r="2.4" /><path d="M16 20c.2-2.4 1.9-4.3 4.2-4.8" /></svg>} />
        <Kpi iconBg="var(--blue-bg)" value={porTipo('local')} label="Locales comerciales"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2"><path d="M7 3h8l4 4v14H7z" /><path d="M11 3v5h5" /></svg>} />
        <Kpi iconBg="var(--purple-bg)" value={porTipo('casa')} label="Casas"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2"><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-7h6v7" /></svg>} />
        <Kpi iconBg="var(--pink-bg)" value={porTipo('apartamento')} label="Apartamentos"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 21v-5h6v5" /></svg>} />
        <Kpi iconBg="var(--orange-bg)" value={porTipo('bodega')} label="Bodegas"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2"><path d="M3 9l9-6 9 6v12H3z" /><path d="M3 9h18" /></svg>} />
        <Kpi iconBg="var(--green-bg)" value={arrendados} label="Arrendados"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 8h2M13 8h2M9 12h2M13 12h2" /></svg>} />
        <Kpi iconBg="var(--blue-bg)" value={disponibles} label="Disponibles"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>} />
        <Kpi iconBg="var(--amber-bg)" value={enRemodelacion} label="En remodelación"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z" /></svg>} />
      </div>

      <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 18 }}>
        <div className="panel" style={{ padding: '22px 22px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="display" style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>
              Tendencia de cánones <span style={{ color: 'var(--mute)', fontWeight: 500, fontSize: '.78rem' }}>— datos de ejemplo hasta conectar histórico real</span>
            </h2>
          </div>
          <div style={{ height: 270, position: 'relative' }}>
            <CanonesChart />
          </div>
        </div>
        <div className="panel" style={{ padding: '22px 22px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="display" style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>Contratos recientes</h2>
            <Link href="/contratos" style={{ fontSize: '.82rem', color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>Ver todos →</Link>
          </div>
          <div>
            {recientes.length === 0 && <div className="empty-state">Aún no hay contratos registrados.</div>}
            {recientes.map((c) => (
              <div className="contract-row" key={c.id}>
                <div>
                  <div className="id">{c.codigo}</div>
                  <div className="tenant">{c.arrendatarioNombre}</div>
                </div>
                <div className="right">
                  <div className="amount">{c.canon}</div>
                  <Pill status={c.estado}>{c.estadoLabel}</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
