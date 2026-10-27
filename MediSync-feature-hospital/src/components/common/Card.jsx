// ==========================================================
// VIVA TOPIC: Reusable Component & Props (Card)
// - Props: title, subtitle, icon, badge, children, style
// - Demonstrates the 'children' prop
// ==========================================================

export default function Card({
  title,
  subtitle,
  icon,
  badge,
  children,
  style = {}
}) {
  return (
    <div className="reusable-card" style={style}>
      {(title || icon) && (
        <div className="reusable-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {icon && <span style={{ fontSize: "18px" }}>{icon}</span>}
            <div>
              {title && <h4 className="reusable-card-title">{title}</h4>}
              {subtitle && <p className="reusable-card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {badge && <span className="reusable-card-badge">{badge}</span>}
        </div>
      )}
      <div className="reusable-card-body">{children}</div>
    </div>
  );
}
