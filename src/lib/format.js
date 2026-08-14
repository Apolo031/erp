export function formatCOP(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

export function formatDate(value) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value + 'T00:00:00') : value;
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function padCode(prefix, seq, digits = 4) {
  return `${prefix}-${String(seq).padStart(digits, '0')}`;
}
