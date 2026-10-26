// ==========================================================
// VIVA TOPIC: Reusable Component & Props (Button)
// - Props: children, onClick, variant, disabled, type, style
// ==========================================================

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  style = {}
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`reusable-btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
