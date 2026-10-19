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

export default function CuentasClaras({ gastoTotal, cuotaEquitativa, INTEGRANTES, gastos = [], abonos = [], saldoBanco }) {
  const saldos = calcularSaldos(INTEGRANTES, gastos, abonos);

  return (
    <div className="space-y-4">
      {/* Resumo Geral */}
      <div className="summary-card grid grid-cols-2 gap-4 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-lg">
        <div className="summary-metric">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Gasto Total Registrado</p>
          <p className="text-2xl font-black text-white">${gastoTotal.toFixed(2)}</p>
        </div>
        <div className="summary-metric text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Cuota x Persona</p>
          <p className="text-xl font-bold text-emerald-400">${cuotaEquitativa.toFixed(2)}</p>
        </div>
        <div className="bank-balance col-span-2 border-t border-slate-700/50 pt-3 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Saldo en el banco Manuel Jr</p>
          <p className={`text-lg font-bold ${saldoBanco >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${saldoBanco.toFixed(2)}
          </p>
        </div>
      </div>

      <section className="space-y-1">
        <h2 className="text-lg font-bold text-slate-200">Quién debe y quién recibe</h2>
        <p className="text-sm text-slate-400">
          Todos los pagos se hacen a Manuel Jr; los gastos pagados por el banco descuentan de su saldo.
        </p>
      </section>

      {/* Cartões dos Integrantes */}
      <div className="space-y-3">
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

          return (
            <div key={member.id} className="member-card bg-slate-800 border border-slate-700 p-4 rounded-xl space-y-3 shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{member.nombre}</span>
                {member.esAdmin && (
                  <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                    👑 Administrador
                  </span>
                )}
              </div>

              <div className="member-metrics grid grid-cols-2 gap-2 text-sm text-slate-300 bg-slate-900/50 p-2.5 rounded-lg">
                <div>
                  <span className="text-xs text-slate-500 block">Pagó de su bolsillo:</span>
                  <span className="font-semibold text-white">${totalPagado.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Abonos registrados:</span>
                  <span className="font-semibold text-white">${totalAbonado.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-700/50 pt-3">
                {totalDebe > 0 && (
                  <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-400">
                    {member.esAdmin ? 'Aporte al fondo común' : 'Debe pagar al banco ·'} ${totalDebe.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-300">
                    {member.esAdmin
                      ? `Manuel Jr debe aportar $${totalDebe.toFixed(2)} al fondo común.`
                      : `Pagar a Manuel Jr: $${totalDebe.toFixed(2)}`}
                  </p>
                  </div>
                )}

                {totalRecibe > 0 && (
                  <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-400">
                    Debe recibir del banco · ${totalRecibe.toFixed(2)}
                  </p>
                  <p className="text-sm text-slate-300">
                    Manuel Jr debe pagarle ${totalRecibe.toFixed(2)}.
                  </p>
                  {totalRecibidoDelBanco > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Ya recibió del banco: ${totalRecibidoDelBanco.toFixed(2)}
                    </p>
                  )}
                  </div>
                )}

                {totalDebe === 0 && totalRecibe === 0 && (
                  <p className="text-sm text-slate-500">Su cuenta está al día.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}