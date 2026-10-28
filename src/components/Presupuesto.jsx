import { ShoppingBag, Zap, Home, Coffee, ShieldCheck, PieChart, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CATEGORY_META = {
  'Mercado / Alimentos': {
    icon: ShoppingBag,
    color: 'emerald',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    progress: 'from-emerald-500 to-teal-400',
  },
  'Servicios Básicos': {
    icon: Zap,
    color: 'amber',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    progress: 'from-amber-500 to-yellow-400',
  },
  'Vivienda / Mantenimiento': {
    icon: Home,
    color: 'blue',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    progress: 'from-blue-500 to-indigo-400',
  },
  'Entretenimiento / Salidas': {
    icon: Coffee,
    color: 'purple',
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    progress: 'from-purple-500 to-pink-400',
  },
  'Fondo de Reserva / Imprevistos': {
    icon: ShieldCheck,
    color: 'teal',
    badge: 'bg-teal-500/15 text-teal-400 border-teal-500/25',
    progress: 'from-teal-500 to-emerald-400',
  },
};

export default function Presupuesto({ PRESUPUESTO_BASE = [], gastos = [] }) {
  const totalPresupuestado = PRESUPUESTO_BASE.reduce((sum, item) => sum + (item.objetivo || 0), 0);
  const totalGastado = gastos.reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
  const porcentajeTotal = totalPresupuestado > 0 ? (totalGastado / totalPresupuestado) * 100 : 0;
  const saldoDisponibleTotal = totalPresupuestado - totalGastado;

  return (
    <div className="space-y-6">
      {/* Global Budget Overview Card */}
      <div className="hero-vault-card p-5 sm:p-6 text-white space-y-4">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <PieChart size={18} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                Plan Mensual del Hogar
              </p>
              <h2 className="text-lg font-extrabold font-display text-white">
                Presupuesto y Metas
              </h2>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-display border flex items-center gap-1.5 ${
            porcentajeTotal > 100
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : porcentajeTotal > 85
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            {porcentajeTotal > 100 ? (
              <AlertTriangle size={13} />
            ) : (
              <CheckCircle2 size={13} />
            )}
            <span>{porcentajeTotal.toFixed(0)}% Utilizado</span>
          </span>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5 relative z-10">
          <div className="h-3 w-full bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                porcentajeTotal > 100
                  ? 'from-rose-500 to-red-600'
                  : 'from-emerald-500 via-teal-400 to-emerald-300'
              }`}
              style={{ width: `${Math.min(porcentajeTotal, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-300 font-semibold pt-1">
            <span>Gastado: <strong className="font-display text-white">${totalGastado.toFixed(2)}</strong></span>
            <span>Meta: <strong className="font-display text-white">${totalPresupuestado.toFixed(2)}</strong></span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
          <span className="text-slate-400">
            {saldoDisponibleTotal >= 0 ? 'Margen restante en el mes:' : 'Exceso sobre la meta:'}
          </span>
          <span className={`font-display font-extrabold text-sm ${saldoDisponibleTotal >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${Math.abs(saldoDisponibleTotal).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Categories Grid / List */}
      <div className="space-y-3.5">
        <h3 className="font-display font-bold text-base text-slate-200 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" />
          Desglose por Categoría
        </h3>

        {PRESUPUESTO_BASE.map(item => {
          const gastadoReal = gastos
            .filter(g => g.categoria === item.categoria)
            .reduce((sum, g) => sum + (Number(g.monto) || 0), 0);
          const diferencia = item.objetivo - gastadoReal;
          const porcentaje = item.objetivo > 0 ? (gastadoReal / item.objetivo) * 100 : 0;
          const excede = porcentaje > 100;
          const meta = CATEGORY_META[item.categoria] || {
            icon: PieChart,
            color: 'emerald',
            badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
            progress: 'from-emerald-500 to-teal-400',
          };
          const CategoryIcon = meta.icon;

          return (
            <div 
              key={item.categoria} 
              className="glass-card rounded-2xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.badge}`}>
                    <CategoryIcon size={19} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm sm:text-base text-white">
                      {item.categoria}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Meta de ${item.objetivo.toFixed(2)}
                    </p>
                  </div>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-bold font-display border ${
                  excede 
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                    : porcentaje > 80
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                }`}>
                  {porcentaje.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    excede 
                      ? 'bg-rose-500' 
                      : `bg-gradient-to-r ${meta.progress}`
                  }`}
                  style={{ width: `${Math.min(porcentaje, 100)}%` }}
                />
              </div>

              {/* Metrics Pill Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Objetivo</span>
                  <span className="font-display font-bold text-xs sm:text-sm text-slate-200">
                    ${item.objetivo.toFixed(2)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Gastado</span>
                  <span className="font-display font-bold text-xs sm:text-sm text-white">
                    ${gastadoReal.toFixed(2)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/50 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {diferencia < 0 ? 'Exceso' : 'Disponible'}
                  </span>
                  <span className={`font-display font-bold text-xs sm:text-sm ${
                    diferencia < 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    ${Math.abs(diferencia).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
