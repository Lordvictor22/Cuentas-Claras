import { useState } from 'react';
import { ShoppingBag, Zap, Home, Coffee, ShieldCheck, PieChart, TrendingUp, AlertTriangle, CheckCircle2, Pencil, Save, X, CalendarDays, Download } from 'lucide-react';

function getCurrentMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

async function downloadMonthlyExpensesPdf(expenses, month, totalCents) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const monthLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric'
  });

  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageWidth, 48, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('Cuentas Claras', 15, 19);
  pdf.setFontSize(12);
  pdf.setTextColor(167, 243, 208);
  pdf.text('REPORTE MENSUAL DE GASTOS', 15, 29);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(226, 232, 240);
  pdf.text(monthLabel, 15, 38);

  pdf.setFillColor(236, 253, 245);
  pdf.roundedRect(15, 56, pageWidth - 30, 25, 3, 3, 'F');
  pdf.setTextColor(71, 85, 105);
  pdf.setFontSize(9);
  pdf.text('TOTAL EXACTO DEL MES', 21, 66);
  pdf.text(`GASTOS REGISTRADOS: ${expenses.length}`, pageWidth - 21, 66, { align: 'right' });
  pdf.setTextColor(5, 150, 105);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(`$${(totalCents / 100).toFixed(2)}`, 21, 76);

  autoTable(pdf, {
    startY: 91,
    head: [['Fecha', 'Categoría / Concepto', 'Quién pagó', 'Monto']],
    body: expenses.map(expense => [
      expense.fecha || '—',
      expense.categoria || 'Sin categoría',
      expense.pagadoPor || 'No especificado',
      `$${(Math.round((Number(expense.monto) || 0) * 100) / 100).toFixed(2)}`
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      cellPadding: 3.5
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: [51, 65, 85],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 27 },
      1: { cellWidth: 68 },
      2: { cellWidth: 55 },
      3: { halign: 'right' }
    },
    margin: { left: 15, right: 15, bottom: 20 },
    didDrawPage: () => {
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Cuentas Claras · Reporte de gastos', 15, pageHeight - 10);
      pdf.text(`Página ${pdf.internal.getNumberOfPages()}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }
  });

  pdf.save(`gastos-${month}.pdf`);
}

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

export default function Presupuesto({
  PRESUPUESTO_BASE = [],
  gastos = [],
  perfil,
  onUpdateGoal,
  savingGoal = false,
  budgetError = ''
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [draftGoal, setDraftGoal] = useState('');
  const [validationError, setValidationError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const isAdmin = Boolean(perfil?.esAdmin);
  const totalPresupuestado = PRESUPUESTO_BASE.reduce((sum, item) => sum + (item.objetivo || 0), 0);
  const gastosDelMes = gastos
    .filter(gasto => typeof gasto.fecha === 'string' && gasto.fecha.startsWith(`${selectedMonth}-`))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const totalGastadoCentavos = gastosDelMes.reduce(
    (sum, gasto) => sum + Math.round((Number(gasto.monto) || 0) * 100),
    0
  );
  const totalGastado = totalGastadoCentavos / 100;
  const porcentajeTotal = totalPresupuestado > 0 ? (totalGastado / totalPresupuestado) * 100 : 0;
  const saldoDisponibleTotal = totalPresupuestado - totalGastado;

  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    setPdfError('');
    try {
      await downloadMonthlyExpensesPdf(gastosDelMes, selectedMonth, totalGastadoCentavos);
    } catch (error) {
      console.error('Error al generar el reporte PDF:', error);
      setPdfError('No se pudo generar el PDF. Inténtalo de nuevo.');
    } finally {
      setGeneratingPdf(false);
    }
  };

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

      <section className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <CalendarDays size={17} className="text-emerald-400" />
              Gastos del mes
            </h3>
            <label className="block text-xs text-slate-400" htmlFor="monthly-expenses-month">
              Selecciona el mes para revisar y descargar los gastos
            </label>
            <input
              id="monthly-expenses-month"
              type="month"
              value={selectedMonth}
              onChange={event => setSelectedMonth(event.target.value || getCurrentMonth())}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={gastosDelMes.length === 0 || generatingPdf}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            {generatingPdf ? 'Generando PDF...' : 'Descargar PDF'}
          </button>
        </div>

        {pdfError && (
          <p role="alert" className="text-sm text-rose-300">
            {pdfError}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <span className="text-sm font-semibold text-slate-300">
            Total exacto ({gastosDelMes.length} {gastosDelMes.length === 1 ? 'gasto' : 'gastos'})
          </span>
          <strong className="font-display text-lg font-extrabold text-emerald-300">
            ${(totalGastadoCentavos / 100).toFixed(2)}
          </strong>
        </div>

        {gastosDelMes.length === 0 ? (
          <p className="rounded-xl bg-slate-900/50 p-4 text-center text-sm text-slate-400">
            No hay gastos registrados en este mes.
          </p>
        ) : (
          <div className="max-h-80 overflow-auto rounded-xl border border-white/5">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="sticky top-0 bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-3 py-2.5 font-bold">Fecha</th>
                  <th className="px-3 py-2.5 font-bold">¿En qué se gastó?</th>
                  <th className="px-3 py-2.5 font-bold">¿Quién pagó?</th>
                  <th className="px-3 py-2.5 text-right font-bold">Monto</th>
                </tr>
              </thead>
              <tbody>
                {gastosDelMes.map((gasto, index) => (
                  <tr
                    key={gasto.id || `${gasto.fecha}-${gasto.categoria}-${index}`}
                    className="border-t border-white/5 text-slate-200"
                  >
                    <td className="px-3 py-2.5 whitespace-nowrap">{gasto.fecha}</td>
                    <td className="px-3 py-2.5">{gasto.categoria}</td>
                    <td className="px-3 py-2.5">{gasto.pagadoPor || 'No especificado'}</td>
                    <td className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                      ${(Math.round((Number(gasto.monto) || 0) * 100) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {budgetError && (
        <div role="alert" className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {budgetError}
        </div>
      )}

      {validationError && (
        <div role="alert" className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
          {validationError}
        </div>
      )}

      {/* Categories Grid / List */}
      <div className="space-y-3.5">
        <h3 className="font-display font-bold text-base text-slate-200 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-400" />
          Desglose por Categoría
        </h3>

        {PRESUPUESTO_BASE.map(item => {
          const gastadoRealCentavos = gastosDelMes
            .filter(g => g.categoria === item.categoria)
            .reduce((sum, g) => sum + Math.round((Number(g.monto) || 0) * 100), 0);
          const gastadoReal = gastadoRealCentavos / 100;
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
          const isEditing = editingCategory === item.categoria;

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
                    {isEditing ? (
                      <label className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        Meta $
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draftGoal}
                          onChange={event => setDraftGoal(event.target.value)}
                          aria-label={`Objetivo para ${item.categoria}`}
                          className="w-28 rounded-lg border border-slate-600 bg-slate-900 px-2 py-1 text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </label>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Meta de ${item.objetivo.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold font-display border ${
                    excede
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : porcentaje > 80
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {porcentaje.toFixed(1)}%
                  </span>
                  {isAdmin && (isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          const objetivo = Number(draftGoal);
                          if (draftGoal.trim() === '' || !Number.isFinite(objetivo) || objetivo < 0) {
                            setValidationError('Ingresa un objetivo válido, igual o mayor que cero.');
                            return;
                          }
                          setValidationError('');
                          if (await onUpdateGoal(item.categoria, objetivo)) {
                            setEditingCategory(null);
                          }
                        }}
                        disabled={savingGoal}
                        aria-label={`Guardar objetivo de ${item.categoria}`}
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50"
                      >
                        <Save size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setValidationError('');
                        }}
                        disabled={savingGoal}
                        aria-label="Cancelar edición del objetivo"
                        className="p-2 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                      >
                        <X size={15} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(item.categoria);
                        setDraftGoal(String(item.objetivo));
                        setValidationError('');
                      }}
                      aria-label={`Editar objetivo de ${item.categoria}`}
                      className="p-2 rounded-lg bg-slate-700/60 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300"
                    >
                      <Pencil size={15} />
                    </button>
                  ))}
                </div>
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
