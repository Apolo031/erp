'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/ui/PageHead';
import FormMsg from '@/components/ui/FormMsg';
import { useAuth } from '@/context/AuthContext';
import {
  empleadosApi, emptyEmpleado, TIPO_DOCUMENTO_OPTIONS, GENERO_OPTIONS, ESTADO_CIVIL_OPTIONS,
  TIPO_CONTRATO_OPTIONS, ESTADO_CONTRATO_OPTIONS, FORMA_PAGO_OPTIONS, TIPO_CUENTA_OPTIONS,
  TIPO_SALARIO_OPTIONS, PARENTESCO_OPTIONS,
} from './service';

const MAX_FOTO_BYTES = 700 * 1024;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EmpleadoForm({ id }) {
  const isNew = id === 'nuevo';
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [form, setForm] = useState(emptyEmpleado());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [nuevoFamiliar, setNuevoFamiliar] = useState({ nombre: '', parentesco: 'Hijo(a)', celular: '' });
  const [nuevoPago, setNuevoPago] = useState({ item: '', valor: '' });
  const [cuentaEmail, setCuentaEmail] = useState('');
  const [cuentaBusy, setCuentaBusy] = useState(false);
  const [cuentaLink, setCuentaLink] = useState('');
  const [cuentaError, setCuentaError] = useState('');

  useEffect(() => {
    if (isNew) return;
    empleadosApi.get(id).then((data) => {
      if (data) {
        setForm({
          ...emptyEmpleado(),
          ...data,
          identificacion: { ...emptyEmpleado().identificacion, ...data.identificacion },
          laboral: { ...emptyEmpleado().laboral, ...data.laboral },
          salario: { ...emptyEmpleado().salario, ...data.salario },
          bancario: { ...emptyEmpleado().bancario, ...data.bancario },
          seguridadSocial: { ...emptyEmpleado().seguridadSocial, ...data.seguridadSocial },
          familiares: data.familiares || [],
          pagosFijos: data.pagosFijos || [],
        });
        setCuentaEmail(data.correoElectronico || '');
      }
      setLoading(false);
    });
  }, [id, isNew]);

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }
  function setNested(group, field, value) { setForm((f) => ({ ...f, [group]: { ...f[group], [field]: value } })); }

  function selectEstadoContrato(value) {
    const opt = ESTADO_CONTRATO_OPTIONS.find((o) => o.value === value);
    setNested('laboral', 'estadoContrato', value);
    setNested('laboral', 'estadoContratoLabel', opt?.label || '');
  }

  async function handleFoto(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FOTO_BYTES) {
      alert('La foto pesa demasiado (máx. ~700KB mientras no tengamos Firebase Storage activado). Prueba con una más liviana.');
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    set('foto', dataUrl);
    set('fotoNombre', file.name);
  }

  function addFamiliar() {
    if (!nuevoFamiliar.nombre.trim()) return;
    setForm((f) => ({ ...f, familiares: [...f.familiares, { ...nuevoFamiliar, nombre: nuevoFamiliar.nombre.trim() }] }));
    setNuevoFamiliar({ nombre: '', parentesco: 'Hijo(a)', celular: '' });
  }
  function removeFamiliar(i) {
    setForm((f) => ({ ...f, familiares: f.familiares.filter((_, idx) => idx !== i) }));
  }

  function addPago() {
    if (!nuevoPago.item.trim() || !nuevoPago.valor) return;
    setForm((f) => ({ ...f, pagosFijos: [...f.pagosFijos, { item: nuevoPago.item.trim(), valor: Number(nuevoPago.valor) }] }));
    setNuevoPago({ item: '', valor: '' });
  }
  function removePago(i) {
    setForm((f) => ({ ...f, pagosFijos: f.pagosFijos.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombreCompleto.trim() || !form.identificacion.numero.trim()) {
      setMsg({ type: 'error', text: 'Completa los campos obligatorios: nombre completo y número de identificación.' });
      return;
    }
    setSaving(true);
    try {
      if (isNew) await empleadosApi.create(form);
      else await empleadosApi.update(id, form);
      setMsg({ type: 'ok', text: isNew ? 'Empleado guardado correctamente.' : 'Empleado actualizado correctamente.' });
      setTimeout(() => router.push('/gestion-humana/empleados'), 700);
    } catch (err) {
      setMsg({ type: 'error', text: 'Ocurrió un error al guardar. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleCrearCuenta() {
    if (!cuentaEmail.trim()) { setCuentaError('Escribe el correo del empleado.'); return; }
    setCuentaBusy(true);
    setCuentaError('');
    setCuentaLink('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/empleados/crear-cuenta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ empleadoId: id, email: cuentaEmail.trim(), nombre: form.nombreCompleto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la cuenta');
      setCuentaLink(data.link);
      set('tieneCuenta', true);
      set('correoAcceso', cuentaEmail.trim());
    } catch (err) {
      setCuentaError(err.message);
    } finally {
      setCuentaBusy(false);
    }
  }

  async function handleNuevoEnlace() {
    setCuentaBusy(true);
    setCuentaError('');
    setCuentaLink('');
    try {
      const token = await getIdToken();
      const res = await fetch('/api/empleados/enlace-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: form.correoAcceso }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al generar el enlace');
      setCuentaLink(data.link);
    } catch (err) {
      setCuentaError(err.message);
    } finally {
      setCuentaBusy(false);
    }
  }

  if (loading) return <div className="empty-state">Cargando...</div>;

  return (
    <section>
      <PageHead
        title={isNew ? 'Nuevo empleado' : form.nombreCompleto || 'Editar empleado'}
        subtitle="Información personal y laboral del colaborador"
      />
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Foto de perfil</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {form.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.foto} alt="" style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
            ) : (
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)', fontWeight: 700, fontSize: '1.3rem' }}>
                {(form.nombreCompleto || '?').trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                Cambiar foto
                <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
              </label>
              <p style={{ fontSize: '.76rem', color: 'var(--mute)', marginTop: 6 }}>Máx. ~700KB</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Datos personales</h2>
          <div className="row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field"><label>Nombre completo<span className="req">*</span></label><input value={form.nombreCompleto} onChange={(e) => set('nombreCompleto', e.target.value)} /></div>
          </div>
          <div className="row cols3">
            <div className="field">
              <label>Tipo de documento</label>
              <select value={form.identificacion.tipo} onChange={(e) => setNested('identificacion', 'tipo', e.target.value)}>
                {TIPO_DOCUMENTO_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>Número de identificación<span className="req">*</span></label><input value={form.identificacion.numero} onChange={(e) => setNested('identificacion', 'numero', e.target.value)} /></div>
            <div className="field"><label>Ciudad de expedición</label><input value={form.identificacion.ciudadExpedicion} onChange={(e) => setNested('identificacion', 'ciudadExpedicion', e.target.value)} /></div>
          </div>
          <div className="row cols3">
            <div className="field"><label>Fecha de nacimiento</label><input type="date" value={form.fechaNacimiento} onChange={(e) => set('fechaNacimiento', e.target.value)} /></div>
            <div className="field">
              <label>Género</label>
              <select value={form.genero} onChange={(e) => set('genero', e.target.value)}>
                <option value="">Seleccionar...</option>
                {GENERO_OPTIONS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Estado civil</label>
              <select value={form.estadoCivil} onChange={(e) => set('estadoCivil', e.target.value)}>
                <option value="">Seleccionar...</option>
                {ESTADO_CIVIL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="field"><label>Teléfono fijo</label><input value={form.telefonoFijo} onChange={(e) => set('telefonoFijo', e.target.value)} /></div>
            <div className="field"><label>Celular</label><input value={form.telefonoCelular} onChange={(e) => set('telefonoCelular', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Correo electrónico</label><input type="email" value={form.correoElectronico} onChange={(e) => set('correoElectronico', e.target.value)} /></div>
            <div className="field"><label>Ciudad de residencia</label><input value={form.ciudadResidencia} onChange={(e) => set('ciudadResidencia', e.target.value)} /></div>
          </div>
          <div className="row" style={{ gridTemplateColumns: '1fr', marginBottom: 0 }}>
            <div className="field"><label>Dirección</label><input value={form.direccion} onChange={(e) => set('direccion', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2>Datos laborales</h2>
          <div className="row">
            <div className="field"><label>Área</label><input value={form.laboral.area} onChange={(e) => setNested('laboral', 'area', e.target.value)} /></div>
            <div className="field"><label>Cargo</label><input value={form.laboral.cargo} onChange={(e) => setNested('laboral', 'cargo', e.target.value)} /></div>
          </div>
          <div className="row cols3">
            <div className="field">
              <label>Tipo de contrato</label>
              <select value={form.laboral.tipoContrato} onChange={(e) => setNested('laboral', 'tipoContrato', e.target.value)}>
                {TIPO_CONTRATO_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>Fecha de ingreso</label><input type="date" value={form.laboral.fechaIngreso} onChange={(e) => setNested('laboral', 'fechaIngreso', e.target.value)} /></div>
            <div className="field"><label>Fecha de terminación</label><input type="date" value={form.laboral.fechaTerminacion} onChange={(e) => setNested('laboral', 'fechaTerminacion', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Sede</label><input value={form.laboral.sede} onChange={(e) => setNested('laboral', 'sede', e.target.value)} /></div>
            <div className="field"><label>Centro de trabajo</label><input value={form.laboral.centroDeTrabajo} onChange={(e) => setNested('laboral', 'centroDeTrabajo', e.target.value)} /></div>
          </div>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field">
              <label>Estado del contrato</label>
              <select value={form.laboral.estadoContrato} onChange={(e) => selectEstadoContrato(e.target.value)}>
                {ESTADO_CONTRATO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div />
          </div>
        </div>

        <div className="card">
          <h2>Salario</h2>
          <div className="row cols3">
            <div className="field">
              <label>Tipo de salario</label>
              <select value={form.salario.tipo} onChange={(e) => setNested('salario', 'tipo', e.target.value)}>
                {TIPO_SALARIO_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>Valor mensual</label><input placeholder="$" value={form.salario.valor} onChange={(e) => setNested('salario', 'valor', e.target.value)} /></div>
            <div className="field">
              <label>Forma de pago</label>
              <select value={form.salario.formaPago} onChange={(e) => setNested('salario', 'formaPago', e.target.value)}>
                {FORMA_PAGO_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field">
              <label>Tipo de cuenta</label>
              <select value={form.bancario.tipoCuenta} onChange={(e) => setNested('bancario', 'tipoCuenta', e.target.value)}>
                {TIPO_CUENTA_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="field"><label>Número de cuenta</label><input value={form.bancario.numeroCuenta} onChange={(e) => setNested('bancario', 'numeroCuenta', e.target.value)} /></div>
          </div>
          <div className="row" style={{ gridTemplateColumns: '1fr', marginTop: 16, marginBottom: 0 }}>
            <div className="field"><label>Banco</label><input value={form.bancario.banco} onChange={(e) => setNested('bancario', 'banco', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2>Seguridad social</h2>
          <div className="row">
            <div className="field"><label>EPS</label><input value={form.seguridadSocial.eps} onChange={(e) => setNested('seguridadSocial', 'eps', e.target.value)} /></div>
            <div className="field"><label>Fondo de pensión</label><input value={form.seguridadSocial.fondoPension} onChange={(e) => setNested('seguridadSocial', 'fondoPension', e.target.value)} /></div>
          </div>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field"><label>ARL</label><input value={form.seguridadSocial.arl} onChange={(e) => setNested('seguridadSocial', 'arl', e.target.value)} /></div>
            <div className="field"><label>Caja de compensación</label><input value={form.seguridadSocial.cajaCompensacion} onChange={(e) => setNested('seguridadSocial', 'cajaCompensacion', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2>Grupo familiar</h2>
          <div className="owner-add">
            <input placeholder="Nombre completo" value={nuevoFamiliar.nombre} onChange={(e) => setNuevoFamiliar({ ...nuevoFamiliar, nombre: e.target.value })} style={{ flex: 1 }} />
            <select value={nuevoFamiliar.parentesco} onChange={(e) => setNuevoFamiliar({ ...nuevoFamiliar, parentesco: e.target.value })}>
              {PARENTESCO_OPTIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <input placeholder="Celular" value={nuevoFamiliar.celular} onChange={(e) => setNuevoFamiliar({ ...nuevoFamiliar, celular: e.target.value })} style={{ width: 130 }} />
            <button type="button" className="btn-add" onClick={addFamiliar}>+ Agregar</button>
          </div>
          <div className="owner-list">
            {form.familiares.map((fam, i) => (
              <div className="owner-chip" key={i}>
                <span>{fam.nombre} <span style={{ color: 'var(--mute)' }}>· {fam.parentesco}{fam.celular ? ' · ' + fam.celular : ''}</span></span>
                <button type="button" onClick={() => removeFamiliar(i)}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Pagos fijos adicionales <span className="badge">Auxilios, bonificaciones fijas...</span></h2>
          <div className="owner-add">
            <input placeholder="Ej: Auxilio de conectividad" value={nuevoPago.item} onChange={(e) => setNuevoPago({ ...nuevoPago, item: e.target.value })} style={{ flex: 1 }} />
            <input placeholder="Valor $" type="number" value={nuevoPago.valor} onChange={(e) => setNuevoPago({ ...nuevoPago, valor: e.target.value })} style={{ width: 130 }} />
            <button type="button" className="btn-add" onClick={addPago}>+ Agregar</button>
          </div>
          <div className="owner-list">
            {form.pagosFijos.map((p, i) => (
              <div className="owner-chip" key={i}>
                <span>{p.item}</span>
                <span><span className="pct-val">${Number(p.valor).toLocaleString('es-CO')}</span> &nbsp; <button type="button" onClick={() => removePago(i)}>✕</button></span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Notas</h2>
          <div className="field"><textarea rows={3} value={form.notas} onChange={(e) => set('notas', e.target.value)} /></div>
        </div>

        {!isNew && (
          <div className="card">
            <h2>Cuenta de acceso</h2>
            {form.tieneCuenta ? (
              <>
                <p style={{ fontSize: '.86rem', marginBottom: 12 }}>Este empleado ya tiene cuenta: <b>{form.correoAcceso}</b></p>
                <button type="button" className="btn btn-secondary" onClick={handleNuevoEnlace} disabled={cuentaBusy}>
                  {cuentaBusy ? 'Generando...' : 'Generar nuevo enlace de contraseña'}
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '.86rem', color: 'var(--mute)', marginBottom: 12 }}>
                  Crea el acceso para que el empleado pueda entrar a "Mi perfil" con su propio usuario y contraseña.
                </p>
                <div className="row" style={{ marginBottom: 12 }}>
                  <div className="field"><label>Correo para iniciar sesión</label><input type="email" value={cuentaEmail} onChange={(e) => setCuentaEmail(e.target.value)} /></div>
                  <div />
                </div>
                <button type="button" className="btn btn-primary" onClick={handleCrearCuenta} disabled={cuentaBusy}>
                  {cuentaBusy ? 'Creando...' : 'Crear cuenta de acceso'}
                </button>
              </>
            )}
            {cuentaError && <FormMsg text={cuentaError} type="error" />}
            {cuentaLink && (
              <div className="form-msg ok" style={{ marginTop: 12, wordBreak: 'break-all' }}>
                Comparte este enlace con el empleado para que defina su contraseña (solo se muestra una vez):
                <br /><a href={cuentaLink} target="_blank" rel="noreferrer">{cuentaLink}</a>
              </div>
            )}
          </div>
        )}

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar empleado'}</button>
          <button className="btn btn-secondary" type="button" onClick={() => router.push('/gestion-humana/empleados')}>Cancelar</button>
        </div>
        <FormMsg text={msg?.text} type={msg?.type} />
      </form>
    </section>
  );
}
