'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { empleadosApi } from '@/features/empleados/service';
import PageHead from '@/components/ui/PageHead';
import Pill from '@/components/ui/Pill';

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
    </section>
  );
}
