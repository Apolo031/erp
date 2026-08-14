export default function Dropzone({ id, title, hint, onFiles, docs = [], onRemove }) {
  return (
    <>
      <label htmlFor={id} className="dropzone">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h8l4 4v14H7z" /><path d="M11 3v5h5" /><path d="M9 13h6M9 17h6" />
        </svg>
        <span className="title">{title}</span>
        <span className="hint">{hint}</span>
        <input
          id={id}
          type="file"
          accept="application/pdf"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </label>
      <div className="owner-list" style={{ marginTop: 12 }}>
        {docs.length === 0 && <div style={{ fontSize: '.8rem', color: 'var(--mute)' }}>Aún no se han agregado documentos.</div>}
        {docs.map((doc, i) => (
          <div className="owner-chip" key={doc.path || doc.name + i}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 3h8l4 4v14H7z" /><path d="M11 3v5h5" />
              </svg>
              {doc.url ? <a href={doc.url} target="_blank" rel="noreferrer">{doc.name}</a> : doc.name}
            </span>
            <button type="button" onClick={() => onRemove(i)}>✕</button>
          </div>
        ))}
      </div>
    </>
  );
}
