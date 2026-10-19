export default function Presupuesto({ PRESUPUESTO_BASE, gastos }) {
  return (
    <div className="space-y-4">
      <div className="page-heading">
        <span className="eyebrow">Control del hogar</span>
        <h2 className="text-lg font-bold text-slate-200">Presupuesto Mensual</h2>
      </div>
      
      <div className="space-y-3">
        {PRESUPUESTO_BASE.map(item => {
          const gastadoReal = gastos
            .filter(g => g.categoria === item.categoria)
            .reduce((sum, g) => sum + g.monto, 0);
          const diferencia = item.objetivo - gastadoReal;
          const porcentaje = item.objetivo > 0 ? (gastadoReal / item.objetivo) * 100 : 0;
          const excede = porcentaje > 100;

          return (
            <div key={item.categoria} className="budget-card bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-2 shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-white">{item.categoria}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${excede ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {porcentaje.toFixed(1)}%
                </span>
              </div>

              <div className="budget-progress w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${excede ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(porcentaje, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-slate-400 pt-1">
                <span>Objetivo: <strong className="text-slate-200">${item.objetivo.toFixed(2)}</strong></span>
                <span>Gastado: <strong className="text-slate-200">${gastadoReal.toFixed(2)}</strong></span>
                <span>Diferencia: <strong className={diferencia < 0 ? 'text-rose-400' : 'text-emerald-400'}>${diferencia.toFixed(2)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}