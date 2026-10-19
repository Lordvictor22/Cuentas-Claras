import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import { Wallet, LogOut, Receipt, PieChart, PlusCircle, Send, Sun, Moon } from 'lucide-react';

import Login from './components/Login';
import CuentasClaras from './components/CuentasClaras';
import Presupuesto from './components/Presupuesto';
import Gastos from './components/Gastos';
import Pagos from './components/Pagos';

const INTEGRANTES = [
  { id: 'manuel', nombre: 'Manuel Jr', email: 'manuel@hogar.com', esAdmin: true },
  { id: 'mayely', nombre: 'Mayely', email: 'mayely@hogar.com', esAdmin: false },
  { id: 'jesus', nombre: 'Jesús Lugo', email: 'jesus@hogar.com', esAdmin: false },
  { id: 'yelixa', nombre: 'Yelixa Guerrero', email: 'yelixa@hogar.com', esAdmin: false },
];

const BANCO = 'Banco Manuel Jr';

const PRESUPUESTO_BASE = [
  { categoria: 'Mercado / Alimentos', objetivo: 300 },
  { categoria: 'Servicios Básicos', objetivo: 150 },
  { categoria: 'Vivienda / Mantenimiento', objetivo: 200 },
  { categoria: 'Entretenimiento / Salidas', objetivo: 100 },
  { categoria: 'Fondo de Reserva / Imprevistos', objetivo: 300 }
];

export default function App() {
  const [theme, setTheme] = useState(() => (
    window.localStorage.getItem('cuentas-claras-theme') === 'light' ? 'light' : 'dark'
  ));
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [emailSelect, setEmailSelect] = useState('manuel@hogar.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState('cuentas'); // 'cuentas', 'pagos', 'presupuesto', 'gastos'
  const [gastos, setGastos] = useState([]);
  const [abonos, setAbonos] = useState([]);
  const [limpiandoColeccion, setLimpiandoColeccion] = useState(null);

  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(PRESUPUESTO_BASE[0].categoria);
  const [pagadoPor, setPagadoPor] = useState('Manuel Jr');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('cuentas-claras-theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const p = INTEGRANTES.find(i => i.email === currentUser.email);
        setPerfil(p || { nombre: currentUser.email, esAdmin: false });
        if (p) setPagadoPor(p.nombre);
      } else {
        setPerfil(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'gastos'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGastos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'abonos'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAbonos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, emailSelect, password);
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      alert('Error al iniciar sesión. Verifica el correo y la contraseña.');
    }
  };

  const handleLogout = () => signOut(auth);
  const handleToggleTheme = () => {
    setTheme(currentTheme => currentTheme === 'dark' ? 'light' : 'dark');
  };

  const handleAddGasto = async (e) => {
    e.preventDefault();
    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) return;
    await addDoc(collection(db, 'gastos'), {
      monto: parseFloat(monto),
      categoria,
      pagadoPor,
      registradoPor: perfil.nombre,
      fecha: new Date().toISOString().split('T')[0]
    });
    setMonto('');
    setTab('cuentas');
  };

  const handleAddAbono = async (nombre, monto, nota, tipo = 'entrada') => {
    await addDoc(collection(db, 'abonos'), {
      nombre,
      monto: parseFloat(monto),
      nota,
      tipo,
      registradoPor: perfil.nombre,
      fecha: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteAbono = async (id) => {
    if (confirm('¿Desea eliminar este registro de pago?')) {
      await deleteDoc(doc(db, 'abonos', id));
    }
  };

  const handleDeleteGasto = async (id) => {
    if (confirm('¿Desea eliminar este gasto?')) {
      await deleteDoc(doc(db, 'gastos', id));
    }
  };

  const handleResetCollection = async (nombreColeccion, registros, etiqueta) => {
    if (!perfil?.esAdmin || limpiandoColeccion) return;
    if (registros.length === 0) {
      alert(`No hay ${etiqueta} para eliminar.`);
      return;
    }
    if (!confirm(`¿Eliminar los ${registros.length} registros de ${etiqueta}? Esta acción no se puede deshacer.`)) return;

    setLimpiandoColeccion(nombreColeccion);
    let eliminados = 0;
    try {
      for (let indice = 0; indice < registros.length; indice += 500) {
        const lote = writeBatch(db);
        const grupo = registros.slice(indice, indice + 500);
        grupo.forEach(registro => lote.delete(doc(db, nombreColeccion, registro.id)));
        await lote.commit();
        eliminados += grupo.length;
      }
    } catch (err) {
      console.error(`Error al limpiar ${etiqueta}:`, err);
      alert(
        eliminados > 0
          ? `No se pudieron eliminar todos los registros. Se eliminaron ${eliminados}; actualiza la página y vuelve a intentarlo.`
          : `No se pudieron eliminar los registros de ${etiqueta}. Inténtalo de nuevo.`
      );
    } finally {
      setLimpiandoColeccion(null);
    }
  };

  const gastoTotal = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
  const cuotaEquitativa = gastoTotal / 4;
  const saldoBanco = abonos.reduce((saldo, abono) => {
    const montoCentavos = Math.round((Number(abono.monto) || 0) * 100);
    return saldo + (abono.tipo === 'saida' ? -montoCentavos : montoCentavos);
  }, 0) / 100 - gastos
    .filter(gasto => gasto.pagadoPor === BANCO)
    .reduce((total, gasto) => total + (Number(gasto.monto) || 0), 0);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return (
      <Login
        INTEGRANTES={INTEGRANTES}
        emailSelect={emailSelect}
        setEmailSelect={setEmailSelect}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="app-shell min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header */}
      <header className="app-header bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="brand-mark">
            <Wallet className="text-emerald-400" size={21} />
          </span>
          <span className="brand-title">Cuentas Claras</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-700 border border-slate-600 px-3 py-1 rounded-full text-emerald-400 font-medium">
            👋 {perfil?.nombre}
          </span>
          <button
            type="button"
            className="theme-toggle"
            onClick={handleToggleTheme}
            aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
          </button>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content p-4 max-w-2xl mx-auto space-y-6">
        {tab === 'cuentas' && (
          <CuentasClaras 
            gastoTotal={gastoTotal}
            cuotaEquitativa={cuotaEquitativa}
            INTEGRANTES={INTEGRANTES}
            gastos={gastos}
            abonos={abonos}
            saldoBanco={saldoBanco}
          />
        )}

        {tab === 'pagos' && (
          <Pagos 
            abonos={abonos}
            handleAddAbono={handleAddAbono}
            handleDeleteAbono={handleDeleteAbono}
            perfil={perfil}
            INTEGRANTES={INTEGRANTES}
            onResetPagos={() => handleResetCollection('abonos', abonos, 'pagos')}
            limpiando={limpiandoColeccion === 'abonos'}
          />
        )}

        {tab === 'presupuesto' && (
          <Presupuesto 
            PRESUPUESTO_BASE={PRESUPUESTO_BASE}
            gastos={gastos}
          />
        )}

        {tab === 'gastos' && (
          <Gastos 
            handleAddGasto={handleAddGasto}
            monto={monto}
            setMonto={setMonto}
            categoria={categoria}
            setCategoria={setCategoria}
            pagadoPor={pagadoPor}
            setPagadoPor={setPagadoPor}
            PRESUPUESTO_BASE={PRESUPUESTO_BASE}
            INTEGRANTES={INTEGRANTES}
            BANCO={BANCO}
            perfil={perfil}
            gastos={gastos}
            handleDeleteGasto={handleDeleteGasto}
            onResetGastos={() => handleResetCollection('gastos', gastos, 'gastos')}
            limpiando={limpiandoColeccion === 'gastos'}
          />
        )}
      </main>

      {/* Navegação Inferior (4 Abas Organizadas) */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-2 flex justify-around z-20">
        <button 
          onClick={() => setTab('cuentas')}
          className={`nav-item flex flex-col items-center p-2 rounded-lg text-xs font-semibold transition ${tab === 'cuentas' ? 'nav-item-active text-emerald-400' : 'text-slate-400'}`}
        >
          <Receipt size={20} />
          <span>Cuentas</span>
        </button>

        <button 
          onClick={() => setTab('pagos')}
          className={`nav-item flex flex-col items-center p-2 rounded-lg text-xs font-semibold transition ${tab === 'pagos' ? 'nav-item-active text-emerald-400' : 'text-slate-400'}`}
        >
          <Send size={20} />
          <span>Pagos</span>
        </button>

        <button 
          onClick={() => setTab('presupuesto')}
          className={`nav-item flex flex-col items-center p-2 rounded-lg text-xs font-semibold transition ${tab === 'presupuesto' ? 'nav-item-active text-emerald-400' : 'text-slate-400'}`}
        >
          <PieChart size={20} />
          <span>Presupuesto</span>
        </button>

        <button 
          onClick={() => setTab('gastos')}
          className={`nav-item flex flex-col items-center p-2 rounded-lg text-xs font-semibold transition ${tab === 'gastos' ? 'nav-item-active text-emerald-400' : 'text-slate-400'}`}
        >
          <PlusCircle size={20} />
          <span>Gasto</span>
        </button>
      </nav>
    </div>
  );
}