export default function DataTable({ columns, rows, onRowClick, emptyMessage = 'No hay registros todavía.' }) {
  return (
    <div className="panel">
      <table className="list">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="row-click" onClick={() => onRowClick?.(row)}>
              {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty-state">{emptyMessage}</div>}
    </div>
  );
}
