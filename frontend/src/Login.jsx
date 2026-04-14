import { useState } from 'react';
import { useApp } from './AppContext';
import Logo from './Logo';

export default function Login() {
  const { login } = useApp();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 fade-up">
          <div className="flex justify-center mb-3"><Logo size={90} /></div>
          <h1 className="text-xl font-extrabold text-warm-900">SP Khamkar & Sons</h1>
          <p className="text-xs text-warm-500 mt-1">Specialist in Spices · Since 1930</p>
        </div>
        <div className="login-card rounded-2xl p-6 slide-up">
          <h2 className="text-base font-bold text-warm-800 mb-4 text-center">Login</h2>
          <div className="space-y-3">
            <input type="text" placeholder="Username" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} onKeyDown={onKey}
              className="w-full bg-warm-50 border border-warm-300 rounded-xl px-4 py-3 text-sm text-warm-900 outline-none transition-all" />
            <input type="password" placeholder="Password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={onKey}
              className="w-full bg-warm-50 border border-warm-300 rounded-xl px-4 py-3 text-sm text-warm-900 outline-none transition-all" />
          </div>
          <button onClick={handleLogin}
            className="w-full mt-4 bg-gradient-to-r from-spk-500 to-spk-600 text-white font-bold py-3.5 rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-spk-500/20 text-sm">
            Login
          </button>
          {error && <p className="text-xs text-spk-500 text-center mt-3 font-medium">{error}</p>}
          <div className="mt-4 p-3 bg-warm-50 rounded-xl">
            <p className="text-[10px] font-bold text-warm-500 uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-warm-600">
              <div className="text-center"><p className="font-bold text-spk-600">Admin</p><p>admin / admin</p></div>
              <div className="text-center"><p className="font-bold text-spk-600">Sales</p><p>sales1 / sales</p></div>
              <div className="text-center"><p className="font-bold text-spk-600">Factory</p><p>factory / factory</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
