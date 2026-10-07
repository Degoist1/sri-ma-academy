import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BATCHES } from '../config';
import Field from '../components/Field';

const emptyForm = { name: '', phone: '', age: '', parentName: '', batch: '' };

export default function Register() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // one handler for every input, it uses the input's name attribute
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // client-side validation: returns an object with one message per wrong field
  const validate = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = 'Enter the full name (at least 3 letters)';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10 digit mobile number';
    if (form.age < 5 || form.age > 40) e.age = 'Age must be between 5 and 40';
    if (form.parentName.trim().length < 3) e.parentName = "Enter the parent's name";
    if (!form.batch) e.batch = 'Choose a batch';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return; // stop if anything is wrong

    // the batch decides the monthly fee
    const fee = BATCHES.find((b) => b.name === form.batch).fee;
    try {
      await api.post('/players', { ...form, monthlyFee: fee });
      alert('Registered! Use your phone number on the Player page to log in.');
      navigate('/player');
    } catch (err) {
      alert(err.response?.data?.error || 'Could not register, please try again');
    }
  };

  return (
    <div className="card p-4 mx-auto" style={{ maxWidth: 700 }}>
      <h4 className="mb-3">Register a new player</h4>
      <form className="row g-3" onSubmit={handleSubmit} noValidate>
        <Field label="Player name" name="name" form={form} onChange={handleChange} error={errors.name} />
        <Field label="Mobile number" name="phone" form={form} onChange={handleChange} error={errors.phone} maxLength={10} />
        <Field label="Age" name="age" type="number" form={form} onChange={handleChange} error={errors.age} />
        <Field label="Parent's name" name="parentName" form={form} onChange={handleChange} error={errors.parentName} />

        <div className="col-md-6">
          <label className="form-label">Batch</label>
          <select
            className={'form-select ' + (errors.batch ? 'is-invalid' : '')}
            name="batch"
            value={form.batch}
            onChange={handleChange}
          >
            <option value="">Choose...</option>
            {BATCHES.map((b) => (
              <option key={b.name} value={b.name}>{b.name} (Rs. {b.fee} / month)</option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.batch}</div>
        </div>

        <div className="col-12">
          <button className="btn btn-brand" type="submit">Register</button>
        </div>
      </form>
    </div>
  );
}
