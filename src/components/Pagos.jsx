import { useState } from 'react';
import { PlusCircle, Trash2, Send } from 'lucide-react';

export default function Pagos({ abonos, handleAddAbono, handleDeleteAbono, perfil, INTEGRANTES, onResetPagos, limpiando }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [montoAbono, setMontoAbono] = useState('');
  const [notaAbono, setNotaAbono] = useState('');
  const [membroSeleccionado, setMembroSeleccionado] = useState(perfil?.nombre || 'Mayely');
  const [filtroPersona, setFiltroPersona] = useState('TODOS');
  const [tipoMovimiento, setTipoMovimiento] = useState('entrada');

  // Se não for admin, mostra apenas os pagamentos do próprio perfil logado
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
      {/* Botão de Registro */}
      <div className="section-card bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center shadow-lg">
        <div className="flex flex-1 items-center justify-between gap-3">
          <div>
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Send className="text-emerald-400" size={22} /> Historial de Pagos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {perfil?.esAdmin ? 'Entradas y pagos realizados por el banco Manuel Jr' : 'Tus pagos enviados al banco Manuel Jr'}
          </p>
          </div>
          {perfil?.esAdmin && (
            <button
              type="button"
              onClick={onResetPagos}
              disabled={limpiando}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10 disabled:cursor-wait disabled:opacity-60"
            >
              <Trash2 size={14} />
              {limpiando ? 'Limpiando...' : 'Limpiar pagos'}
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setModalAbierto(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-md"
        >
          <PlusCircle size={16} /> Registrar Pago
        </button>
      </div>

      {/* Filtro para o Admin */}
      {perfil?.esAdmin && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button 
            onClick={() => setFiltroPersona('TODOS')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${filtroPersona === 'TODOS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
          >
            Todos
          </button>
          {INTEGRANTES.filter(m => !m.esAdmin).map(m => (
            <button 
              key={m.id}
              onClick={() => setFiltroPersona(m.nombre)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${filtroPersona === m.nombre ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
            >
              {m.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Histórico Limpo de Pagamentos */}
      <div className="space-y-3">
        {pagamentosFiltrados.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/60 p-8 rounded-xl text-center space-y-1">
            <p className="text-slate-400 font-medium text-sm">No hay pagos registrados aún.</p>
            <p className="text-slate-500 text-xs">Usa el botón "Registrar Pago" para agregar uno.</p>
          </div>
        ) : (
          pagamentosFiltrados.map(pago => (
            <div key={pago.id} className="history-card bg-slate-800 border border-slate-700 p-4 rounded-xl flex justify-between items-center shadow-md">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">${(Number(pago.monto) || 0).toFixed(2)}</span>
                  {perfil?.esAdmin && (
                    <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded font-semibold">
                      {pago.tipo === 'saida' ? `Banco → ${pago.nombre}` : `${pago.nombre} → Banco`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pago.nota ? pago.nota : pago.tipo === 'saida' ? 'Pago realizado por Manuel Jr' : 'Pago recibido por Manuel Jr'} • <span className="text-slate-500">{pago.fecha}</span>
                </p>
              </div>

              <button 
                onClick={() => handleDeleteAbono(pago.id)}
                className="text-slate-500 hover:text-rose-400 p-2 transition"
                title="Eliminar pago"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal Modal/Popup Limpo para Lançar Pago */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="modal-card bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg">Registrar Nuevo Pago</h3>
            
            <form onSubmit={guardarPago} className="space-y-3">
              {perfil?.esAdmin && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">TIPO DE MOVIMIENTO</label>
                  <select
                    value={tipoMovimiento}
                    onChange={e => setTipoMovimiento(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="entrada">Entrada: integrante paga al banco</option>
                    <option value="saida">Salida: banco paga al integrante</option>
                  </select>
                </div>
              )}

              {perfil?.esAdmin && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">
                    {tipoMovimiento === 'saida' ? '¿QUIÉN RECIBIÓ EL PAGO DE MANUEL JR?' : '¿QUIÉN PAGÓ A MANUEL JR?'}
                  </label>
                  <select 
                    value={membroSeleccionado}
                    onChange={e => setMembroSeleccionado(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {INTEGRANTES.map(m => (
                      <option key={m.id} value={m.nombre}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">MONTO DE LA TRANSFERENCIA ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={montoAbono} 
                  onChange={e => setMontoAbono(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-xl font-bold focus:outline-none focus:border-emerald-500"
                  autoFocus
                  required 
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold">NOTA / DETALLE (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ej: Pago por Zelle / Efectivo / Pix"
                  value={notaAbono} 
                  onChange={e => setNotaAbono(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setModalAbierto(false)}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold p-2.5 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-lg text-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}