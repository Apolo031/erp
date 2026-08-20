'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/ui/PageHead';
import Pill from '@/components/ui/Pill';
import FormMsg from '@/components/ui/FormMsg';
import { useAuth } from '@/context/AuthContext';
import { novedadesApi, ESTADO_PILL } from '@/features/novedades/service';
import { formatDate } from '@/lib/format';

export default function NovedadDetallePage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const [novedad, setNovedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    novedadesApi.get(id).then((data) => {
      setNovedad(data);
      setComentario(data?.comentarioGestion || '');
      setLoading(false);
    });
  }, [id]);

  async function resolver(estado, estadoLabel) {
    setBusy(true);
    try {
      await novedadesApi.update(id, {
        estado, estadoLabel, comentarioGestion: comentario,
        gestionadoPor: user?.email || '', gestionadoEn: new Date().toISOString(),
      });
      setNovedad((prev) => ({ ...prev, estado, estadoLabel, comentarioGestion: comentario }));
      setMsg({ type: 'ok', text: `Solicitud ${estadoLabel.toLowerCase()}.` });
      setTimeout(() => router.push('/gestion-humana/novedades'), 800);
    } catch (err) {
      setMsg({ type: 'error', text: 'No se pudo actualizar. Intenta de nuevo.' });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="empty-state">Cargando...</div>;
  if (!novedad) return <div className="empty-state">No se encontró la solicitud.</div>;

  return (
    <section>
      <PageHead title={`${novedad.tipoLabel} · ${novedad.empleadoNombre}`} subtitle="Solicitud de novedad" />

      <div className="card">
        <h2>Detalle</h2>
        <div className="row">
          <div className="field"><label>Empleado</label><div style={{ padding: '10px 0' }}>{novedad.empleadoNombre}</div></div>
          <div className="field"><label>Tipo</label><div style={{ padding: '10px 0' }}>{novedad.tipoLabel}</div></div>
        </div>
        <div className="row">
          <div className="field"><label>Fecha inicio</label><div style={{ padding: '10px 0' }}>{formatDate(novedad.fechaInicio)}</div></div>
          <div className="field"><label>Fecha fin</label><div style={{ padding: '10px 0' }}>{novedad.fechaFin ? formatDate(novedad.fechaFin) : '—'}</div></div>
        </div>
        {(novedad.horaInicio || novedad.horaFin) && (
          <div className="row">
            <div className="field"><label>Hora inicio</label><div style={{ padding: '10px 0' }}>{novedad.horaInicio || '—'}</div></div>
            <div className="field"><label>Hora fin</label><div style={{ padding: '10px 0' }}>{novedad.horaFin || '—'}</div></div>
          </div>
        )}
        <div className="row" style={{ gridTemplateColumns: '1fr' }}>
          <div className="field"><label>Motivo</label><div style={{ padding: '10px 0' }}>{novedad.motivo || '—'}</div></div>
        </div>
        <div className="row" style={{ marginBottom: 0 }}>
          <div className="field">
            <label>Estado actual</label>
            <div style={{ padding: '10px 0' }}><Pill status={ESTADO_PILL[novedad.estado]}>{novedad.estadoLabel}</Pill></div>
          </div>
          <div />
        </div>
        {novedad.soporte && (
          <div className="row" style={{ marginTop: 4, marginBottom: 0 }}>
            <div className="field">
              <label>Soporte adjunto</label>
              <a href={novedad.soporte.src} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: 'fit-content' }}>Ver {novedad.soporte.name || 'archivo'}</a>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Gestión</h2>
        <div className="field"><label>Comentario</label><textarea rows={3} placeholder="Motivo de la aprobación o el rechazo (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} /></div>
        {novedad.gestionadoPor && (
          <p style={{ fontSize: '.78rem', color: 'var(--mute)' }}>Última gestión: {novedad.gestionadoPor} · {novedad.gestionadoEn ? formatDate(novedad.gestionadoEn.slice(0, 10)) : ''}</p>
        )}
        <div className="actions">
          <button className="btn btn-primary" type="button" disabled={busy} onClick={() => resolver('aprobada', 'Aprobada')}>Aprobar</button>
          <button className="btn btn-danger" type="button" disabled={busy} onClick={() => resolver('rechazada', 'Rechazada')}>Rechazar</button>
          <button className="btn btn-secondary" type="button" onClick={() => router.push('/gestion-humana/novedades')}>Volver</button>
        </div>
        <FormMsg text={msg?.text} type={msg?.type} />
      </div>
    </section>
  );
}
