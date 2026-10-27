export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
  style = {}
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`reusable-btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}
