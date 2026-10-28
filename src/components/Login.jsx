import { Moon, Sun, Home, Lock, Sparkles, Check } from 'lucide-react';

export default function Login({
  INTEGRANTES = [],
  emailSelect,
  setEmailSelect,
  password,
  setPassword,
  handleLogin,
  theme,
  onToggleTheme
}) {
  return (
    <div className="app-shell min-h-screen text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle in top right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          className="p-2.5 rounded-full glass-panel text-slate-300 hover:text-emerald-400 transition active:scale-95 shadow-md"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="glass-panel bg-[#111927]/90 border border-white/10 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand & Welcome Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/25 mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-[#0b111e] rounded-2xl flex items-center justify-center">
              <Home className="text-emerald-400" size={26} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="font-display font-extrabold text-2xl tracking-tight text-white">
                Cuentas Claras
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles size={9} /> Hogar
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Selecciona tu perfil familiar para ingresar
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Visual Member Selection Tiles */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              ¿Quién eres en casa?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INTEGRANTES.map(member => {
                const isSelected = emailSelect === member.email;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setEmailSelect(member.email)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400/80 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full avatar-ring avatar-${member.id} text-xs shrink-0`}>
                      {member.nombre[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-xs truncate">
                        {member.nombre}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {member.esAdmin ? 'Administrador' : 'Familia'}
                      </p>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Lock size={12} /> Contraseña de acceso
            </label>
            <div className="relative">
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña..."
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-display font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Ingresar a Nuestro Hogar</span>
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-500">
          Cuentas Claras · Todos los aportes se sincronizan en tiempo real
        </p>
      </div>
    </div>
  );
}
