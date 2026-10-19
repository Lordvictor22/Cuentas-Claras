import { PlusCircle, Trash2 } from 'lucide-react';

export default function Gastos({ handleAddGasto, monto, setMonto, categoria, setCategoria, pagadoPor, setPagadoPor, PRESUPUESTO_BASE, INTEGRANTES, BANCO, perfil, gastos, handleDeleteGasto, onResetGastos, limpiando }) {
  return (
    <div className="space-y-6">
      <form onSubmit={handleAddGasto} className="form-card bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-4 shadow-lg">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <PlusCircle size={20} className="text-emerald-400" /> Registrar Nuevo Gasto
        </h2>

        <div>
          <label className="block text-xs text-slate-400 mb-1 font-semibold">MONTO ($)</label>
          <input 
            type="number" 
            step="0.01" 
            placeholder="0.00"
            value={monto} 
            onChange={e => setMonto(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-xl font-bold focus:outline-none focus:border-emerald-500"
            required 
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1 font-semibold">CATEGORÍA</label>
          <select 
            value={categoria} 
            onChange={e => setCategoria(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
          >
            {PRESUPUESTO_BASE.map(item => <option key={item.categoria} value={item.categoria}>{item.categoria}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1 font-semibold">¿QUIÉN LO PAGÓ?</label>
          <select 
            value={pagadoPor} 
            onChange={e => setPagadoPor(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
          >
            <option value={BANCO}>{BANCO}</option>
            {INTEGRANTES.map(m => <option key={m.id} value={m.nombre}>{m.nombre}</option>)}
          </select>
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold p-3 rounded-lg text-white transition shadow-md"
        >
          Guardar Gasto
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-slate-300">Historial de Gastos</h3>
          {perfil?.esAdmin && (
            <button
              type="button"
              onClick={onResetGastos}
              disabled={limpiando}
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10 disabled:cursor-wait disabled:opacity-60"
            >
              <Trash2 size={14} />
              {limpiando ? 'Limpiando...' : 'Limpiar gastos'}
            </button>
          )}
        </div>
        {gastos.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay gastos registrados aún.</p>
        ) : (
          gastos.map(g => (
            <div key={g.id} className="history-card bg-slate-800 border border-slate-700 p-3.5 rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold text-white">{g.categoria}</p>
                <p className="text-xs text-slate-400">
                  Pagado por <span className="text-emerald-400 font-medium">{g.pagadoPor}</span> • {g.fecha}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">${g.monto.toFixed(2)}</span>
                <button onClick={() => handleDeleteGasto(g.id)} className="text-slate-500 hover:text-red-400 text-xs p-1">✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}