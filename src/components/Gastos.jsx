import { PlusCircle, Trash2, ShoppingBag, Zap, Home, Coffee, ShieldCheck, PieChart, Calendar, User, Wallet, Sparkles } from 'lucide-react';

const CATEGORY_META = {
  'Mercado / Alimentos': { icon: ShoppingBag, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25' },
  'Servicios Básicos': { icon: Zap, color: 'text-amber-400 bg-amber-500/15 border-amber-500/25' },
  'Vivienda / Mantenimiento': { icon: Home, color: 'text-blue-400 bg-blue-500/15 border-blue-500/25' },
  'Entretenimiento / Salidas': { icon: Coffee, color: 'text-purple-400 bg-purple-500/15 border-purple-500/25' },
  'Fondo de Reserva / Imprevistos': { icon: ShieldCheck, color: 'text-teal-400 bg-teal-500/15 border-teal-500/25' },
};

export default function Gastos({
  handleAddGasto,
  monto,
  setMonto,
  categoria,
  setCategoria,
  pagadoPor,
  setPagadoPor,
  PRESUPUESTO_BASE = [],
  INTEGRANTES = [],
  BANCO,
  perfil,
  gastos = [],
  handleDeleteGasto,
  onResetGastos,
  limpiando
}) {
  return (
    <div className="space-y-6">
      {/* Form Card: Registrar Gasto */}
      <form 
        onSubmit={handleAddGasto} 
        className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 border border-white/10 shadow-xl"
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <PlusCircle size={18} />
            </span>
            <div>
              <h2 className="font-display font-extrabold text-white text-lg">
                Registrar Gasto de la Casa
              </h2>
              <p className="text-xs text-slate-400">
                Todo lo que se compra en común para el hogar
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            Nuevo
          </span>
        </div>

        {/* Big Numerical Amount Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            ¿Cuánto fue? ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-display font-bold text-2xl">
              $
            </span>
            <input 
              type="number" 
              step="0.01" 
              placeholder="0.00"
              value={monto} 
              onChange={e => setMonto(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3.5 text-white font-display text-3xl font-extrabold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition placeholder-slate-600"
              required 
            />
          </div>
        </div>

        {/* Visual Category Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-400" /> Categoría del Gasto
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESUPUESTO_BASE.map(item => {
              const meta = CATEGORY_META[item.categoria] || { icon: PieChart, color: 'text-slate-400 bg-slate-800' };
              const Icon = meta.icon;
              const isSelected = categoria === item.categoria;

              return (
                <button
                  key={item.categoria}
                  type="button"
                  onClick={() => setCategoria(item.categoria)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className={`p-1.5 rounded-lg border shrink-0 ${meta.color}`}>
                    <Icon size={14} />
                  </span>
                  <span className="text-xs font-semibold leading-tight line-clamp-1">
                    {item.categoria.split('/')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payer Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User size={13} /> ¿Quién lo cubrió o adelantó el dinero?
          </label>
          <div className="relative">
            <select 
              value={pagadoPor} 
              onChange={e => setPagadoPor(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-white text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value={BANCO}>🏛️ {BANCO} (Fondo Común)</option>
              {INTEGRANTES.map(m => (
                <option key={m.id} value={m.nombre}>
                  👤 {m.nombre} {m.nombre === perfil?.nombre ? '(Tú)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-display font-bold text-base shadow-lg shadow-emerald-500/25 transition active:scale-98 flex items-center justify-center gap-2"
        >
          <PlusCircle size={18} />
          <span>Agregar Gasto al Hogar</span>
        </button>
      </form>

      {/* Expenses History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <h3 className="font-display font-bold text-base text-slate-100 flex items-center gap-2">
              <Wallet size={16} className="text-emerald-400" />
              Historial de Compras ({gastos.length})
            </h3>
            <p className="text-xs text-slate-400">
              Registro cronológico de gastos de la casa
            </p>
          </div>

          {perfil?.esAdmin && (
            <button
              type="button"
              onClick={onResetGastos}
              disabled={limpiando}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={13} />
              <span>{limpiando ? 'Limpiando...' : 'Limpiar gastos'}</span>
            </button>
          )}
        </div>

        {gastos.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 mx-auto flex items-center justify-center text-slate-500">
              <ShoppingBag size={22} />
            </div>
            <p className="text-slate-300 font-bold text-sm">No hay gastos registrados aún</p>
            <p className="text-slate-500 text-xs">Usa el formulario arriba para agregar la primera compra.</p>
          </div>
        ) : (
          gastos.map(g => {
            const meta = CATEGORY_META[g.categoria] || { icon: ShoppingBag, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25' };
            const CategoryIcon = meta.icon;
            const montoVal = Number(g.monto) || 0;

            return (
              <div 
                key={g.id} 
                className="glass-card rounded-2xl p-3.5 sm:p-4 flex justify-between items-center gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.color}`}>
                    <CategoryIcon size={18} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm sm:text-base text-white">
                      {g.categoria}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                      <span>
                        Cubierto por <strong className="text-emerald-400 font-semibold">{g.pagadoPor}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Calendar size={11} /> {g.fecha}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-display font-extrabold text-base sm:text-lg text-white">
                    ${montoVal.toFixed(2)}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleDeleteGasto(g.id)} 
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95"
                    title="Eliminar este gasto"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
