// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // เรียก API login
      const data = await loginUser({ email, password });

      // ดึงข้อมูลโปรไฟล์จาก response
      const profile = data.profile || data.user || {};

      // เตรียมข้อมูลที่จะเก็บใน storage
      const userData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || email,
        role: profile.role || 'User',
      };

      // ✅ เก็บข้อมูลผู้ใช้ไว้ให้ Navbar / Sidebar ใช้
      // จะเก็บใน localStorage เสมอ (ถ้าอยากแยกแบบ remember ค่อยเพิ่มทีหลังได้)
      localStorage.setItem('user', JSON.stringify(userData));

      console.log(`Login Successful: Hello ${userData.firstName}`);

      // ✅ หลัง login เสร็จ กลับไปหน้า Dashboard (หน้าแรก)
      navigate('/');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Login Error';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-900">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-[420px]">
        <h1 className="text-2xl font-bold mb-1">Log In</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in to use the PM0.1 Dashboard system.
        </p>

        <form className="flex flex-col gap-4 mb-4" onSubmit={handleSubmit}>
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

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
            Password
            <input
              type="password"
              className="px-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
            />
          </label>

          <button
            className="w-full py-2.5 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow-lg hover:bg-emerald-600 hover:-translate-y-px transition disabled:opacity-70 disabled:cursor-default"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="mt-2 mb-4 text-center">
          <Link
            to="/forgot-password"
            className="text-xs text-emerald-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="flex justify-center gap-1.5 text-xs text-gray-600">
          <span>Don&apos;t have an account?</span>
          <Link
            to="/register"
            className="text-emerald-500 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
