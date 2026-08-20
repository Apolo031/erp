'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCollection } from '@/hooks/useCollection';
import { empleadosApi } from '@/features/empleados/service';
import { novedadesApi, emptyNovedad, TIPO_OPTIONS, ESTADO_PILL } from '@/features/novedades/service';
import PageHead from '@/components/ui/PageHead';
import Pill from '@/components/ui/Pill';
import FormMsg from '@/components/ui/FormMsg';
import { formatDate } from '@/lib/format';

const MAX_SOPORTE_BYTES = 700 * 1024;

const MAX_FOTO_BYTES = 700 * 1024;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Field({ label, value }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ padding: '10px 13px', border: '1px solid var(--border)', borderRadius: 10, fontSize: '.9rem', background: '#FAFBFC' }}>
        {value || '—'}
      </div>
    </div>
  );
}

export default function MiPerfilPage() {
  const { empleadoId } = useAuth();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const { items: misNovedades, loading: loadingNovedades } = useCollection('novedades', {
    whereClauses: empleadoId ? [['empleadoId', '==', empleadoId]] : [],
    orderByField: 'createdAt', direction: 'desc',
  });
  const [showForm, setShowForm] = useState(false);
  const [solicitud, setSolicitud] = useState(emptyNovedad());
  const [enviando, setEnviando] = useState(false);
  const [solicitudMsg, setSolicitudMsg] = useState(null);

  useEffect(() => {
    if (!empleadoId) { setLoading(false); return; }
    empleadosApi.get(empleadoId).then((data) => {
      setEmpleado(data);
      setLoading(false);
    });
  }, [empleadoId]);

  async function handleFoto(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FOTO_BYTES) {
      setMsg('La foto pesa demasiado (máx. ~700KB). Prueba con una más liviana.');
      return;
    }
    setUploading(true);
    setMsg('');
    try {
      const foto = await readFileAsDataURL(file);
      await empleadosApi.update(empleadoId, { foto, fotoNombre: file.name });
      setEmpleado((prev) => ({ ...prev, foto }));
      setMsg('Foto actualizada.');
    } catch (err) {
      setMsg('No se pudo actualizar la foto: ' + err.message);
    } finally {
      setUploading(false);
      setTimeout(() => setMsg(''), 4000);
    }
  }

  function setSolicitudField(field, value) { setSolicitud((s) => ({ ...s, [field]: value })); }

  function selectTipo(value) {
    const opt = TIPO_OPTIONS.find((t) => t.value === value);
    setSolicitud((s) => ({ ...s, tipo: value, tipoLabel: opt?.label || '' }));
  }

  async function handleSoporte(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_SOPORTE_BYTES) {
      setSolicitudMsg({ type: 'error', text: 'El archivo pesa demasiado (máx. ~700KB).' });
      return;
    }
    const src = await readFileAsDataURL(file);
    setSolicitud((s) => ({ ...s, soporte: { src, name: file.name } }));
  }

  async function handleEnviarSolicitud(e) {
    e.preventDefault();
    if (!solicitud.fechaInicio) {
      setSolicitudMsg({ type: 'error', text: 'Elige al menos la fecha de inicio.' });
      return;
    }
    setEnviando(true);
    try {
      await novedadesApi.create({
        ...solicitud,
        empleadoId,
        empleadoNombre: empleado.nombreCompleto,
        fechaFin: solicitud.fechaFin || solicitud.fechaInicio,
        estado: 'pendiente', estadoLabel: 'Pendiente',
      });
      setSolicitudMsg({ type: 'ok', text: 'Solicitud enviada. Gestión Humana la va a revisar.' });
      setSolicitud(emptyNovedad());
      setTimeout(() => { setShowForm(false); setSolicitudMsg(null); }, 1200);
    } catch (err) {
      setSolicitudMsg({ type: 'error', text: 'No se pudo enviar la solicitud: ' + err.message });
    } finally {
      setEnviando(false);
    }
  }

  if (loading) return <div className="empty-state">Cargando...</div>;

  if (!empleadoId || !empleado) {
    return (
      <section>
        <PageHead title="Mi perfil" subtitle="Tu información personal y laboral" />
        <div className="empty-state">Tu cuenta no está vinculada a un perfil de empleado todavía. Pídele a Gestión Humana que lo vincule.</div>
      </section>
    );
  }

  return (
    <section>
      <PageHead title="Mi perfil" subtitle="Tu información personal y laboral · solo lectura, salvo tu foto" />

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {empleado.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={empleado.foto} alt="" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
          ) : (
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', fontWeight: 700, fontSize: '1.4rem' }}>
              {(empleado.nombreCompleto || '?').trim().charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 800, fontSize: '1.05rem' }}>{empleado.nombreCompleto}</div>
            <div style={{ color: 'var(--mute)', fontSize: '.85rem', marginTop: 2 }}>{empleado.laboral?.cargo} · {empleado.laboral?.area}</div>
            <label className="btn btn-secondary" style={{ cursor: 'pointer', marginTop: 10, display: 'inline-flex' }}>
              {uploading ? 'Subiendo...' : 'Cambiar foto'}
              <input type="file" accept="image/*" onChange={handleFoto} disabled={uploading} style={{ display: 'none' }} />
            </label>
            {msg && <div style={{ fontSize: '.78rem', color: 'var(--mute)', marginTop: 6 }}>{msg}</div>}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Datos personales</h2>
        <div className="row">
          <Field label="Tipo y número de documento" value={`${empleado.identificacion?.tipo || ''} ${empleado.identificacion?.numero || ''}`} />
          <Field label="Fecha de nacimiento" value={empleado.fechaNacimiento} />
        </div>
        <div className="row">
          <Field label="Celular" value={empleado.telefonoCelular} />
          <Field label="Correo electrónico" value={empleado.correoElectronico} />
        </div>
        <div className="row" style={{ marginBottom: 0 }}>
          <Field label="Ciudad de residencia" value={empleado.ciudadResidencia} />
          <Field label="Dirección" value={empleado.direccion} />
        </div>
      </div>

      <div className="card">
        <h2>Datos laborales</h2>
        <div className="row">
          <Field label="Cargo" value={empleado.laboral?.cargo} />
          <Field label="Área" value={empleado.laboral?.area} />
        </div>
        <div className="row">
          <Field label="Tipo de contrato" value={empleado.laboral?.tipoContrato} />
          <Field label="Fecha de ingreso" value={empleado.laboral?.fechaIngreso} />
        </div>
        <div className="row" style={{ marginBottom: 0 }}>
          <div className="field">
            <label>Estado</label>
            <div style={{ padding: '8px 0' }}><Pill status={empleado.laboral?.estadoContrato === 'activo' ? 'activo' : 'pendiente'}>{empleado.laboral?.estadoContratoLabel}</Pill></div>
          </div>
          <Field label="Sede" value={empleado.laboral?.sede} />
        </div>
      </div>

      {empleado.familiares?.length > 0 && (
        <div className="card">
          <h2>Grupo familiar</h2>
          <div className="owner-list">
            {empleado.familiares.map((fam, i) => (
              <div className="owner-chip" key={i}>
                <span>{fam.nombre} <span style={{ color: 'var(--mute)' }}>· {fam.parentesco}</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showForm ? 18 : 0 }}>
          <h2 style={{ margin: 0 }}>Mis solicitudes</h2>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancelar' : '+ Nueva solicitud'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleEnviarSolicitud} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
            <div className="row">
              <div className="field">
                <label>Tipo</label>
                <select value={solicitud.tipo} onChange={(e) => selectTipo(e.target.value)}>
                  {TIPO_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div />
            </div>
            <div className="row">
              <div className="field"><label>Fecha inicio<span className="req">*</span></label><input type="date" value={solicitud.fechaInicio} onChange={(e) => setSolicitudField('fechaInicio', e.target.value)} /></div>
              <div className="field"><label>Fecha fin</label><input type="date" value={solicitud.fechaFin} onChange={(e) => setSolicitudField('fechaFin', e.target.value)} /></div>
            </div>
            {solicitud.tipo === 'permiso_horas' && (
              <div className="row">
                <div className="field"><label>Hora inicio</label><input type="time" value={solicitud.horaInicio} onChange={(e) => setSolicitudField('horaInicio', e.target.value)} /></div>
                <div className="field"><label>Hora fin</label><input type="time" value={solicitud.horaFin} onChange={(e) => setSolicitudField('horaFin', e.target.value)} /></div>
              </div>
            )}
            <div className="row" style={{ gridTemplateColumns: '1fr' }}>
              <div className="field"><label>Motivo</label><textarea rows={2} value={solicitud.motivo} onChange={(e) => setSolicitudField('motivo', e.target.value)} /></div>
            </div>
            <div className="row" style={{ gridTemplateColumns: '1fr', marginBottom: 0 }}>
              <div className="field">
                <label>Soporte (opcional, PDF o imagen, máx. ~700KB)</label>
                <input type="file" accept="image/*,application/pdf" onChange={handleSoporte} />
                {solicitud.soporte && <span style={{ fontSize: '.78rem', color: 'var(--mute)' }}>{solicitud.soporte.name}</span>}
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-primary" type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar solicitud'}</button>
            </div>
            <FormMsg text={solicitudMsg?.text} type={solicitudMsg?.type} />
          </form>
        )}

        {loadingNovedades ? (
          <div className="empty-state">Cargando...</div>
        ) : misNovedades.length === 0 ? (
          <div className="empty-state">Aún no has enviado ninguna solicitud.</div>
        ) : (
          misNovedades.map((n) => (
            <div className="contract-row" key={n.id}>
              <div>
                <div className="id">{n.tipoLabel}</div>
                <div className="tenant">{n.fechaFin && n.fechaFin !== n.fechaInicio ? `${formatDate(n.fechaInicio)} — ${formatDate(n.fechaFin)}` : formatDate(n.fechaInicio)}</div>
              </div>
              <div className="right"><Pill status={ESTADO_PILL[n.estado]}>{n.estadoLabel}</Pill></div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
