export default function FormField({ label, error, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}{required && <span style={{ color:'var(--color-danger)', marginLeft:2 }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ fontSize:11, color:'var(--color-danger)', marginTop:3 }}>{error}</p>
      )}
    </div>
  )
}
