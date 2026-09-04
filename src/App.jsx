import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import KioscoPracticantes from './pages/KioscoPracticantes'
import PerfilPracticante from './pages/PerfilPracticante'
import AdminPanel from './pages/AdminPanel'

// Segmento secreto de la ruta del admin — solo quien sepa esta URL puede acceder
// Cámbialo si alguna vez se filtra.
export const RUTA_ADMIN = '/gestion-7007'

// ─── Barra de navegación ───────────────────────────────────────────────────
function Navbar() {
  const location = useLocation()
  const esAdmin = location.pathname === RUTA_ADMIN

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 group-hover:bg-emerald-500/25 transition-colors duration-200">
              <svg className="h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors duration-200">
                Control de Horas
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Practicantes
              </span>
            </div>
          </Link>

          {/* Nav: solo muestra "Kiosco" públicamente.
              El botón "Admin" aparece únicamente cuando ya estás en la ruta secreta. */}
          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                !esAdmin
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Kiosco
            </Link>

            {/* Solo visible cuando ya estás en el panel admin */}
            {esAdmin && (
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-200 border border-slate-600/50">
                Admin
              </span>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

// ─── Layout ────────────────────────────────────────────────────────────────
function Layout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"              element={<KioscoPracticantes />} />
          <Route path="/perfil/:id"    element={<PerfilPracticante />} />
          <Route path={RUTA_ADMIN}     element={<AdminPanel />} />
          {/* Cualquier otra ruta → kiosco */}
          <Route path="*"              element={<KioscoPracticantes />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-800/60 py-4 text-center">
        <p className="text-xs text-slate-600">
          Sistema de Control de Horas · Practicantes &mdash; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}

// HashRouter es obligatorio para GitHub/GitLab Pages
export default function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}
