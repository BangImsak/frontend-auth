// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../api';

function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: 'Male', dateOfBirth: '', email: '', password: '',
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(form);
      alert(res.message || 'Registration Successful.');
      setForm({ firstName: '', lastName: '', gender: 'Male', dateOfBirth: '', email: '', password: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration Error';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  // Shared Input Styles
  const inputClass = "px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 w-full";
  const labelClass = "flex flex-col gap-1.5 text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-[420px]">

        <h1 className="text-2xl font-bold mb-1">Create New Account</h1>
        <p className="text-sm text-gray-500 mb-6">Sign up to use the PM Dashboard system.</p>

        <form className="flex flex-col gap-4 mb-4" onSubmit={handleSubmit}>
          
          {/* First + Last Name */}
          <div className="flex gap-3">
            <label className={`${labelClass} flex-1 min-w-0`}>
              First name
              <input type="text" className={inputClass} name="firstName" value={form.firstName} onChange={handleChange} required />
            </label>
            <label className={`${labelClass} flex-1 min-w-0`}>
              Surname
              <input type="text" className={inputClass} name="lastName" value={form.lastName} onChange={handleChange} required />
            </label>
          </div>

          <label className={labelClass}>
            Date of birth
            <input type="date" className={inputClass} name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
          </label>

          {/* Gender */}
          <div className={labelClass}>
            Gender
            <div className="flex gap-3 mt-1">
              {['Female', 'Male', 'Prefer not to say'].map((g) => (
                <label key={g} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={form.gender === g}
                    onChange={handleChange}
                    className="text-emerald-500 focus:ring-emerald-400"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <label className={labelClass}>
            Email address
            <input type="email" className={inputClass} name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label className={labelClass}>
            Password
            <input type="password" className={inputClass} name="password" value={form.password} onChange={handleChange} required />
          </label>

          <button
            className="w-full py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow-lg hover:bg-emerald-600 hover:-translate-y-px transition disabled:opacity-70 mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div className="flex justify-center gap-1.5 text-xs text-gray-600">
          <span>Already have an account?</span>
          <Link to="/login" className="text-emerald-500 font-semibold hover:underline">
            Log In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;