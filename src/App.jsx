import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import KioscoPracticantes from './pages/KioscoPracticantes'
import PerfilPracticante from './pages/PerfilPracticante'
import AdminPanel from './pages/AdminPanel'

export const RUTA_ADMIN = '/gestion-7007'

// ─── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const location = useLocation()
  const esAdmin        = location.pathname === RUTA_ADMIN
  const estaAutenticado = sessionStorage.getItem('admin_auth') === '1'

  return (
    <header className="sticky top-0 z-40 w-full"
      style={{ background: 'rgba(13,13,13,0.92)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
              style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)' }}>
              <svg className="h-4 w-4" style={{ color: '#2dd4bf' }}
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-white transition-colors duration-200 group-hover:text-teal-400">
                Control de Horas
              </span>
              <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: '#374151' }}>
                Practicantes
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1.5">
            <Link to="/"
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={!esAdmin
                ? { background: 'rgba(20,184,166,0.1)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.2)' }
                : { color: '#6b7280', border: '1px solid transparent' }}
            >
              Kiosco
            </Link>

            {estaAutenticado && (
              <Link to={RUTA_ADMIN}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={esAdmin
                  ? { background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }
                  : { color: '#6b7280', border: '1px solid transparent' }}
              >
                Admin
              </Link>
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
          <Route path="/"           element={<KioscoPracticantes />} />
          <Route path="/perfil/:id" element={<PerfilPracticante />} />
          <Route path={RUTA_ADMIN}  element={<AdminPanel />} />
          <Route path="*"           element={<KioscoPracticantes />} />
        </Routes>
      </main>
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="py-4 text-center">
        <p className="text-xs" style={{ color: '#1f2937' }}>
          Sistema de Control de Horas · Practicantes &mdash; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}
