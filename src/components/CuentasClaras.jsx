import { Camera, CheckCircle2, AlertCircle, Clock, Sparkles, ShieldCheck, TrendingUp, Users, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

function calcularSaldos(INTEGRANTES, gastos, abonos) {
  if (INTEGRANTES.length === 0) return new Map();

  const gastoTotalCentavos = gastos.reduce(
    (total, gasto) => total + Math.round((Number(gasto.monto) || 0) * 100),
    0
  );
  const cuotaBaseCentavos = Math.floor(gastoTotalCentavos / INTEGRANTES.length);
  const centavosRestantes = gastoTotalCentavos % INTEGRANTES.length;
  const saldos = new Map(INTEGRANTES.map((member, index) => [
    member.nombre,
    -cuotaBaseCentavos - (index < centavosRestantes ? 1 : 0)
  ]));

  gastos.forEach(gasto => {
    const nombrePagador = gasto.pagadoPor;
    if (saldos.has(nombrePagador)) {
      saldos.set(
        nombrePagador,
        saldos.get(nombrePagador) + Math.round((Number(gasto.monto) || 0) * 100)
      );
    }
  });

  abonos.forEach(abono => {
    if (!saldos.has(abono.nombre)) return;
    const montoCentavos = Math.round((Number(abono.monto) || 0) * 100);
    const variacion = abono.tipo === 'saida' ? -montoCentavos : montoCentavos;
    saldos.set(abono.nombre, saldos.get(abono.nombre) + variacion);
  });

  return saldos;
}

export default function CuentasClaras({
  gastoTotal = 0,
  cuotaEquitativa = 0,
  INTEGRANTES = [],
  gastos = [],
  abonos = [],
  saldoBanco = 0,
  perfil,
  profilePhotos = {},
  photoError,
  onUploadPhoto,
  uploadingPhoto
}) {
  const saldos = calcularSaldos(INTEGRANTES, gastos, abonos);

  return (
    <div className="space-y-6">
      {/* Hero Master Balance Card */}
      <div className="hero-vault-card p-5 sm:p-6 text-white space-y-5">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <TrendingUp size={18} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                Resumen del Hogar
              </p>
              <h2 className="text-lg font-extrabold font-display text-white">
                Finanzas Compartidas
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-slate-200 border border-white/10">
            <Users size={13} className="text-emerald-400" />
            <span>4 integrantes</span>
          </div>
        </div>

        {/* 2-Column Main Numbers */}
        <div className="grid grid-cols-2 gap-4 pt-1 relative z-10">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Gastos de la casa
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              ${gastoTotal.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400">
              Acumulado de compras comunes
            </p>
          </div>

          <div className="space-y-1 text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Parte de cada quien
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-400 tracking-tight">
              ${cuotaEquitativa.toFixed(2)}
            </p>
            <p className="text-[11px] text-emerald-400/80 font-medium">
              Repartición equitativa (25%)
            </p>
          </div>
        </div>

        {/* Bank / Vault Status */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-200">
                Fondo Común (Manuel Jr)
              </p>
              <p className="text-[11px] text-slate-400">
                Dinero disponible para pagos colectivos
              </p>
            </div>
          </div>

          <div className={`self-start sm:self-auto px-3.5 py-1.5 rounded-full font-bold font-display text-sm sm:text-base border flex items-center gap-2 shadow-inner ${
            saldoBanco >= 0
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10'
          }`}>
            <span className={`w-2 h-2 rounded-full ${saldoBanco >= 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span>${saldoBanco.toFixed(2)}</span>
            <span className="text-[10px] uppercase tracking-wider opacity-80 font-sans">
              {saldoBanco >= 0 ? 'Disponible' : 'Déficit'}
            </span>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            Estado de Cuentas por Integrante
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cada quien pone su parte y Manuel Jr ayuda a administrar el fondo.
          </p>
        </div>
      </div>

      {photoError && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{photoError}</span>
        </div>
      )}

      {/* Member Cards Grid */}
      <div className="space-y-3.5">
        {INTEGRANTES.map(member => {
          const totalPagado = gastos
            .filter(gasto => gasto.pagadoPor === member.nombre)
            .reduce((sum, gasto) => sum + (Number(gasto.monto) || 0), 0);
          const movimientosMiembro = abonos.filter(abono => abono.nombre === member.nombre);
          const totalAbonado = movimientosMiembro
            .filter(abono => abono.tipo !== 'saida')
            .reduce((sum, abono) => sum + (Number(abono.monto) || 0), 0);
          const totalRecibidoDelBanco = movimientosMiembro
            .filter(abono => abono.tipo === 'saida')
            .reduce((sum, abono) => sum + (Number(abono.monto) || 0), 0);
          const saldoCentavos = saldos.get(member.nombre) || 0;
          const totalDebe = Math.max(0, -saldoCentavos) / 100;
          const totalRecibe = Math.max(0, saldoCentavos) / 100;
          const isCurrentUser = member.id === perfil?.id;

          return (
            <div
              key={member.id}
              className={`glass-card rounded-2xl p-4 sm:p-5 space-y-4 relative ${
                isCurrentUser ? 'ring-1 ring-emerald-500/30' : ''
              }`}
            >
              {/* Card Header: Avatar, Name, Admin Badge, Status Badge */}
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  {/* Avatar with Monogram or Image */}
                  <div className="relative">
                    <div className={`w-11 h-11 rounded-full avatar-ring avatar-${member.id} text-base`}>
                      {profilePhotos[member.id] ? (
                        <img
                          src={profilePhotos[member.id]}
                          alt={`Foto de ${member.nombre}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.nombre.slice(0, 1)
                      )}
                    </div>

                    {/* Camera button only for current user's profile */}
                    {isCurrentUser && (
                      <label
                        className="avatar-camera-btn"
                        title="Cambiar mi foto de perfil"
                      >
                        <Camera size={12} />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          aria-label="Elegir foto de perfil"
                          className="hidden"
                          disabled={uploadingPhoto}
                          onChange={event => {
                            onUploadPhoto(event.target.files?.[0]);
                            event.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-base text-white">
                        {member.nombre}
                      </h4>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                          Tú
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {member.esAdmin ? '👑 Administrador del fondo' : 'Integrante de la casa'}
                    </p>
                  </div>
                </div>

                {/* Balance Status Badge */}
                <div>
                  {totalDebe > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold font-display">
                      <Clock size={12} />
                      <span>Falta ${totalDebe.toFixed(2)}</span>
                    </span>
                  )}
                  {totalRecibe > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-display">
                      <ArrowDownLeft size={12} />
                      <span>A favor ${totalRecibe.toFixed(2)}</span>
                    </span>
                  )}
                  {totalDebe === 0 && totalRecibe === 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600/50 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 size={12} />
                      <span>Al día ✨</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics Tiles: Direct Expenses & Fund Contributions */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <ArrowUpRight size={13} className="text-blue-400" /> Adelantó en gastos:
                  </span>
                  <span className="font-display font-bold text-sm text-white block">
                    ${totalPagado.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <ArrowDownLeft size={13} className="text-emerald-400" /> Aportó al fondo:
                  </span>
                  <span className="font-display font-bold text-sm text-white block">
                    ${totalAbonado.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Settlement explanation note */}
              <div className="pt-2 border-t border-white/5 text-xs text-slate-300">
                {totalDebe > 0 && (
                  <p className="flex items-center gap-1.5 text-rose-300/90 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                    {member.esAdmin
                      ? `Manuel Jr también aporta $${totalDebe.toFixed(2)} para cubrir su cuota.`
                      : `Debe aportar al fondo de Manuel Jr: $${totalDebe.toFixed(2)}`}
                  </p>
                )}

                {totalRecibe > 0 && (
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 text-emerald-300/90 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      Del fondo de la casa, Manuel Jr le devolverá ${totalRecibe.toFixed(2)}.
                    </p>
                    {totalRecibidoDelBanco > 0 && (
                      <p className="text-[11px] text-slate-400 pl-3">
                        (Ya recibió ${totalRecibidoDelBanco.toFixed(2)} del fondo anteriormente)
                      </p>
                    )}
                  </div>
                )}

                {totalDebe === 0 && totalRecibe === 0 && (
                  <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ¡Sin pagos ni devoluciones pendientes! Sus cuentas están al día.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
