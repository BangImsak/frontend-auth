// src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await forgotPassword({ email });
      alert(data.message || 'Link sent.');
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error sending request.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-[420px]">
        <h1 className="text-2xl font-bold mb-1">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email to receive a reset link.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
            Email address
            <input
              type="email"
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@example.com"
              required
            />
          </label>

          <div className="flex gap-3 mt-2">
            <Link 
              to="/login" 
              className="flex-1 py-2.5 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold text-center hover:bg-gray-300 transition"
            >
              Cancel
            </Link>
            <button 
              className="flex-1 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow-lg hover:bg-emerald-600 hover:-translate-y-px transition disabled:opacity-70" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;