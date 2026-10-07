// small reusable input: label + input + error text (name, error etc. come in as props)
export default function Field({ label, name, form, onChange, error, ...rest }) {
  return (
    <div className="col-md-6">
      <label className="form-label">{label}</label>
      <input
        className={'form-control ' + (error ? 'is-invalid' : '')}
        name={name}
        value={form[name]}
        onChange={onChange}
        {...rest}
      />
      <div className="invalid-feedback">{error}</div>
    </div>
  );
}
