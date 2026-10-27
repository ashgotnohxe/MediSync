export default function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  inputRef,
  required = false
}) {
  return (
    <div className="reusable-input-group">
      {label && (
        <label htmlFor={name} className="reusable-input-label">
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`reusable-input-field ${error ? "reusable-input-error" : ""}`}
      />
      {error && <span className="reusable-field-error">{error}</span>}
    </div>
  );
}
