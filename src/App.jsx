import { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, writeBatch } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Home, LogOut, Users, PieChart, PlusCircle, ArrowLeftRight, Sun, Moon, Sparkles, Loader2 } from 'lucide-react';

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
  const [profilePhotos, setProfilePhotos] = useState({});
  const [photoError, setPhotoError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
        setPerfil(p || { id: null, nombre: currentUser.email, esAdmin: false });
        if (p) setPagadoPor(p.nombre);
      } else {
        setPerfil(null);
        setProfilePhotos({});
        setPhotoError('');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    const loadProfilePhotos = async () => {
      try {
        const photos = await Promise.all(INTEGRANTES.map(async member => {
          try {
            const url = await getDownloadURL(ref(storage, `avatars/${member.id}/profile`));
            return [member.id, url];
          } catch (err) {
            if (err.code === 'storage/object-not-found') return [member.id, null];
            throw err;
          }
        }));

        if (!cancelled) {
          setProfilePhotos(Object.fromEntries(photos.filter(([, url]) => url)));
          setPhotoError('');
        }
      } catch (err) {
        console.error('Error al cargar las fotos de perfil:', err);
        if (!cancelled) {
          setPhotoError('No se pudieron cargar las fotos de perfil.');
        }
      }
    };

    loadProfilePhotos();
    return () => {
      cancelled = true;
    };
  }, [user]);

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

  const handleUploadPhoto = async (file) => {
    if (!file || !perfil?.id) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Elige una imagen JPG, PNG o WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('La foto debe pesar menos de 5 MB.');
      return;
    }

    setUploadingPhoto(true);
    setPhotoError('');
    try {
      const avatarRef = ref(storage, `avatars/${perfil.id}/profile`);
      const uploadedPhoto = await uploadBytes(avatarRef, file, { contentType: file.type });
      const photoUrl = await getDownloadURL(uploadedPhoto.ref);
      setProfilePhotos(currentPhotos => ({ ...currentPhotos, [perfil.id]: photoUrl }));
    } catch (err) {
      console.error('Error al guardar la foto de perfil:', err);
      setPhotoError('No se pudo guardar la foto. Revisa la conexión y los permisos.');
    } finally {
      setUploadingPhoto(false);
    }
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

  const handleAddAbono = async (nombre, montoAbono, nota, tipo = 'entrada') => {
    await addDoc(collection(db, 'abonos'), {
      nombre,
      monto: parseFloat(montoAbono),
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
    return (
      <div className="min-h-screen bg-[#090e17] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 animate-pulse">
          <div className="w-full h-full bg-[#090e17] rounded-2xl flex items-center justify-center">
            <Home className="text-emerald-400" size={26} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <Loader2 size={16} className="animate-spin text-emerald-400" />
          <span>Cargando cuentas del hogar...</span>
        </div>
      </div>
    );
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
    <div className="app-shell min-h-screen text-slate-100 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 glass-panel border-b px-4 py-3 sm:px-6">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-3">
          {/* Logo & Household Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
              <Home className="text-emerald-400" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display font-extrabold text-base tracking-tight text-white leading-none">
                  Cuentas Claras
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  <Sparkles size={9} /> Hogar
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Finanzas compartidas
              </p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-inner">
              <div className={`w-6 h-6 rounded-full avatar-ring avatar-${perfil?.id || 'manuel'} text-[10px]`}>
                {profilePhotos[perfil?.id] ? (
                  <img src={profilePhotos[perfil.id]} alt={perfil?.nombre} className="w-full h-full object-cover" />
                ) : (
                  perfil?.nombre?.[0] || 'U'
                )}
              </div>
              <span className="text-xs font-semibold text-slate-200 max-w-[85px] sm:max-w-none truncate">
                {perfil?.nombre?.split(' ')[0]}
              </span>
              {perfil?.esAdmin && (
                <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  Admin
                </span>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={handleToggleTheme}
              aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
              title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition active:scale-95"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition active:scale-95"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 pt-5 max-w-2xl mx-auto space-y-6">
        {tab === 'cuentas' && (
          <CuentasClaras 
            gastoTotal={gastoTotal}
            cuotaEquitativa={cuotaEquitativa}
            INTEGRANTES={INTEGRANTES}
            gastos={gastos}
            abonos={abonos}
            saldoBanco={saldoBanco}
            perfil={perfil}
            profilePhotos={profilePhotos}
            photoError={photoError}
            onUploadPhoto={handleUploadPhoto}
            uploadingPhoto={uploadingPhoto}
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

      {/* Modern Floating Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pointer-events-none flex justify-center">
        <div className="pointer-events-auto bottom-dock rounded-2xl sm:rounded-3xl p-1.5 flex items-center justify-between gap-1 sm:gap-2 shadow-2xl max-w-md w-full border border-white/10 backdrop-blur-2xl">
          <button 
            type="button"
            onClick={() => setTab('cuentas')}
            className={`dock-item flex-1 py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition active:scale-95 ${
              tab === 'cuentas' 
                ? 'dock-item-active bg-emerald-500/15 text-emerald-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Users size={19} className={tab === 'cuentas' ? 'text-emerald-400 stroke-[2.3]' : 'stroke-[1.8]'} />
            <span>Familia</span>
          </button>

          <button 
            type="button"
            onClick={() => setTab('pagos')}
            className={`dock-item flex-1 py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition active:scale-95 ${
              tab === 'pagos' 
                ? 'dock-item-active bg-emerald-500/15 text-emerald-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ArrowLeftRight size={19} className={tab === 'pagos' ? 'text-emerald-400 stroke-[2.3]' : 'stroke-[1.8]'} />
            <span>Aportes</span>
          </button>

          <button 
            type="button"
            onClick={() => setTab('presupuesto')}
            className={`dock-item flex-1 py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition active:scale-95 ${
              tab === 'presupuesto' 
                ? 'dock-item-active bg-emerald-500/15 text-emerald-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <PieChart size={19} className={tab === 'presupuesto' ? 'text-emerald-400 stroke-[2.3]' : 'stroke-[1.8]'} />
            <span>Plan</span>
          </button>

          <button 
            type="button"
            onClick={() => setTab('gastos')}
            className={`dock-item flex-1 py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition active:scale-95 ${
              tab === 'gastos' 
                ? 'dock-item-active bg-emerald-500/15 text-emerald-400 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <PlusCircle size={19} className={tab === 'gastos' ? 'text-emerald-400 stroke-[2.3]' : 'stroke-[1.8]'} />
            <span>Registrar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
