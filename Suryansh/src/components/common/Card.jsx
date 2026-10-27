
export default function Card({
  title,
  subtitle,
  badge,
  icon,
  children,
  className = "",
  style = {}
}) {
  return (
    <div className={`reusable-card ${className}`} style={style}>
      {(title || icon || badge) && (
        <div className="reusable-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {icon && <span style={{ fontSize: "20px" }}>{icon}</span>}
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
