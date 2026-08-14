export default function FormMsg({ text, type = 'ok' }) {
  if (!text) return null;
  return <div className={`form-msg ${type}`}>{text}</div>;
}
