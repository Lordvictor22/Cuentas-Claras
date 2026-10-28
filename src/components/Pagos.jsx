import { useState } from 'react';
import { PlusCircle, Trash2, Send, ArrowDownLeft, ArrowUpRight, Calendar, Tag, X, User } from 'lucide-react';

export default function Pagos({ abonos = [], handleAddAbono, handleDeleteAbono, perfil, INTEGRANTES = [], onResetPagos, limpiando }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [montoAbono, setMontoAbono] = useState('');
  const [notaAbono, setNotaAbono] = useState('');
  const [membroSeleccionado, setMembroSeleccionado] = useState(perfil?.nombre || 'Mayely');
  const [filtroPersona, setFiltroPersona] = useState('TODOS');
  const [tipoMovimiento, setTipoMovimiento] = useState('entrada');

  // Si no es admin, muestra únicamente los abonos del propio perfil logueado
  const pagamentosFiltrados = abonos.filter(a => {
    if (!perfil?.esAdmin) {
      return a.nombre === perfil?.nombre;
    }
    if (filtroPersona !== 'TODOS') {
      return a.nombre === filtroPersona;
    }
    return true;
  });

  const guardarPago = (e) => {
    e.preventDefault();
    if (!montoAbono || isNaN(montoAbono) || parseFloat(montoAbono) <= 0) return;
    
    const personaMovimiento = perfil?.esAdmin ? membroSeleccionado : perfil?.nombre;
    handleAddAbono(personaMovimiento, parseFloat(montoAbono), notaAbono, tipoMovimiento);
    
    setMontoAbono('');
    setNotaAbono('');
    setModalAbierto(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Send size={18} />
            </span>
            <div>
              <h2 className="font-display font-extrabold text-white text-lg leading-tight">
                Aportes de la Familia
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {perfil?.esAdmin 
                  ? 'Entradas y salidas registradas en el fondo común' 
                  : 'Tus pagos y aportes registrados para el hogar'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {perfil?.esAdmin && (
            <button
              type="button"
              onClick={onResetPagos}
              disabled={limpiando}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
              title="Borrar todos los pagos"
            >
              <Trash2 size={14} />
              <span>{limpiando ? 'Limpiando...' : 'Limpiar'}</span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition active:scale-95"
          >
            <PlusCircle size={16} />
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs for Admin */}
      {perfil?.esAdmin && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          <button 
            type="button"
            onClick={() => setFiltroPersona('TODOS')}
            className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition shrink-0 ${
              filtroPersona === 'TODOS' 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
          >
            Todos ({abonos.length})
          </button>
          {INTEGRANTES.filter(m => !m.esAdmin).map(m => {
            const count = abonos.filter(a => a.nombre === m.nombre).length;
            const isSelected = filtroPersona === m.nombre;
            return (
              <button 
                key={m.id}
                type="button"
                onClick={() => setFiltroPersona(m.nombre)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition shrink-0 flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-bold' 
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span>{m.nombre}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-3">
        {pagamentosFiltrados.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 mx-auto flex items-center justify-center text-slate-500">
              <Send size={22} />
            </div>
            <p className="text-slate-300 font-bold text-sm">No hay aportes registrados</p>
            <p className="text-slate-500 text-xs max-w-xs mx-auto">
              Presiona el botón "Registrar Pago" para ingresar un aporte de dinero al fondo.
            </p>
          </div>
        ) : (
          pagamentosFiltrados.map(pago => {
            const isSalida = pago.tipo === 'saida';
            const montoVal = Number(pago.monto) || 0;

            return (
              <div 
                key={pago.id} 
                className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  {/* Direction Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isSalida 
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {isSalida ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                  </div>

                  {/* Info details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-white">
                        {pago.nombre}
                      </span>
                      {perfil?.esAdmin && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isSalida ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                        }`}>
                          {isSalida ? 'Devolución' : 'Aporte'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                      {pago.nota && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Tag size={11} className="text-slate-400" />
                          {pago.nota}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Calendar size={11} />
                        {pago.fecha}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Amount & Delete Action */}
                <div className="flex items-center gap-3">
                  <span className={`font-display font-extrabold text-base sm:text-lg ${
                    isSalida ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {isSalida ? '-' : '+'}${montoVal.toFixed(2)}
                  </span>

                  <button 
                    type="button"
                    onClick={() => handleDeleteAbono(pago.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95"
                    title="Eliminar este pago"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog for Registering Payments */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel bg-[#111927] border border-white/10 rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Send size={16} />
                </span>
                <h3 className="font-display font-extrabold text-white text-lg">
                  Registrar Pago
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setModalAbierto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={guardarPago} className="space-y-4">
              {perfil?.esAdmin && (
                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Tipo de Movimiento
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setTipoMovimiento('entrada')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        tipoMovimiento === 'entrada'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ArrowDownLeft size={14} />
                      <span>Entrada (Aporte)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoMovimiento('saida')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        tipoMovimiento === 'saida'
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ArrowUpRight size={14} />
                      <span>Salida (Devolución)</span>
                    </button>
                  </div>
                </div>
              )}

              {perfil?.esAdmin && (
                <div className="space-y-1">
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <User size={13} />
                    {tipoMovimiento === 'saida'
                      ? '¿Quién recibió del fondo común?'
                      : '¿Quién aportó al fondo común?'}
                  </label>
                  <select 
                    value={membroSeleccionado}
                    onChange={e => setMembroSeleccionado(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                  >
                    {INTEGRANTES.map(m => (
                      <option key={m.id} value={m.nombre}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Monto ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-display font-bold text-xl">
                    $
                  </span>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    value={montoAbono} 
                    onChange={e => setMontoAbono(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-3 text-white font-display text-2xl font-black focus:outline-none focus:border-emerald-500 transition"
                    autoFocus
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Nota / Detalle (Opcional)
                </label>
                <input 
                  type="text" 
                  placeholder="Ej: Zelle, Efectivo, Transferencia..."
                  value={notaAbono} 
                  onChange={e => setNotaAbono(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalAbierto(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold p-3 rounded-xl text-sm transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold p-3 rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95"
                >
                  Guardar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
