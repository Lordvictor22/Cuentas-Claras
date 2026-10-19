import { Moon, Sun, Wallet } from 'lucide-react';

export default function Login({ INTEGRANTES, emailSelect, setEmailSelect, password, setPassword, handleLogin, theme, onToggleTheme }) {
  return (
    <div className="app-shell login-screen min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="login-card bg-slate-800 p-6 rounded-2xl max-w-md w-full border border-slate-700 shadow-xl">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
          </button>
        </div>
        <div className="text-center mb-6">
          <div className="login-mark bg-emerald-500/20 text-emerald-400 p-3 rounded-full w-fit mx-auto mb-2">
            <Wallet size={32} />
          </div>
          <h1 className="text-2xl font-bold">Cuentas Claras - Hogar</h1>
          <p className="text-slate-400 text-sm mt-1">Selecciona tu perfil para ingresar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">INTEGRANTE</label>
            <select 
              value={emailSelect} 
              onChange={e => setEmailSelect(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
            >
              {INTEGRANTES.map(m => (
                <option key={m.id} value={m.email}>{m.nombre} {m.esAdmin ? '(Admin)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">CONTRASEÑA</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-lg transition"
          >
            Iniciar Sesión y Recordar
          </button>
        </form>
      </div>
    </div>
  );
}