export default function Kpi({ icon, iconBg, value, label }) {
  return (
    <div className="kpi">
      <div className="icon" style={{ background: iconBg }}>{icon}</div>
      <div>
        <div className="num">{value}</div>
        <div className="label">{label}</div>
      </div>
    </div>
  );
}
