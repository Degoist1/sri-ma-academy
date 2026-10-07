import { useState } from 'react';
import api from '../api';
import Field from './Field';

const emptyForm = { name: '', phone: '', password: '' };

// a new coach asks for an account, the admin approves it later
export default function CoachRegister({ onDone }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = 'Enter your full name';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10 digit mobile number';
    if (form.password.length < 8) e.password = 'Password needs at least 8 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    try {
      const res = await api.post('/coaches/register', form);
      alert(res.data.message);
      onDone(); // back to the login box
    } catch (err) {
      alert(err.response?.data?.error || 'Could not register, please try again');
    }
  };

  return (
    <form className="card p-4 mx-auto" style={{ maxWidth: 500 }} onSubmit={handleSubmit} noValidate>
      <h4 className="mb-3">Coach registration</h4>
      <div className="row g-3">
        <Field label="Full name" name="name" form={form} onChange={handleChange} error={errors.name} />
        <Field label="Mobile number" name="phone" form={form} onChange={handleChange} error={errors.phone} maxLength={10} />
        <Field label="Password" name="password" type="password" form={form} onChange={handleChange} error={errors.password} />
      </div>
      <div className="mt-3 d-flex gap-2">
        <button className="btn btn-brand">Send request</button>
        <button type="button" className="btn btn-link" onClick={onDone}>Back to login</button>
      </div>
    </form>
  );
}
