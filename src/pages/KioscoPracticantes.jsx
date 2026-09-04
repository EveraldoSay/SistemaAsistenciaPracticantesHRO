import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  practicantesRef,
  registrosRef,
  doc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
} from '../firebase'
import PinModal from '../components/PinModal'

// ─── Utilidades ────────────────────────────────────────────────────────────
function getFechaHoy() {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const d = String(hoy.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatHoras(horas) {
  if (horas === null || horas === undefined) return '0h 00m'
  const h = Math.floor(horas)
  const m = Math.round((horas - h) * 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

function getIniciales(nombre) {
  if (!nombre) return '??'
  const partes = nombre.trim().split(' ').filter(Boolean)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-blue-600',
  'from-teal-500 to-emerald-600',
  'from-pink-500 to-rose-600',
]

// ─── Tarjeta de practicante ────────────────────────────────────────────────
function TarjetaPracticante({ practicante, index, estadoHoy, onClick }) {
  const colorAvatar = AVATAR_COLORS[index % AVATAR_COLORS.length]
  const tienePIN = !!(practicante.pin && practicante.pin.trim() !== '')

  let estadoBadge
  if (estadoHoy === 'entrada') {
    estadoBadge = (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Trabajando
      </span>
    )
  } else if (estadoHoy === 'completo') {
    estadoBadge = (
      <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Turno completo
      </span>
    )
  } else {
    estadoBadge = (
      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
        Sin marcar hoy
      </span>
    )
  }

  return (
    <button
      onClick={() => onClick(practicante)}
      className="group card p-5 text-left w-full
                 hover:border-slate-600 hover:bg-slate-800/80
                 active:scale-[0.98] transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-950
                 animate-fade-in"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl
                        bg-gradient-to-br ${colorAvatar}
                        text-white text-lg font-bold shadow-lg
                        group-hover:scale-105 transition-transform duration-200`}>
          {getIniciales(practicante.nombre_completo)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-100 truncate leading-tight group-hover:text-white transition-colors duration-200">
              {practicante.nombre_completo}
            </h3>
            {/* Candado: con PIN = cerrado (verde), sin PIN = abierto (amber) */}
            {tienePIN ? (
              <svg className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5 flex-shrink-0 text-amber-500/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9 2.35-5.25 5.25-5.25Z" />
              </svg>
            )}
          </div>
          <div className="mt-1">{estadoBadge}</div>
        </div>

        <svg className="h-5 w-5 flex-shrink-0 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all duration-200 mt-0.5"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      {/* Barra de horas */}
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">Horas acumuladas</span>
          <span className="text-sm font-bold text-slate-200">
            {formatHoras(practicante.total_horas_acumuladas || 0)}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${Math.min(100, ((practicante.total_horas_acumuladas || 0) / 480) * 100)}%` }}
          />
        </div>
      </div>

      {/* Aviso primera vez */}
      {!tienePIN && (
        <p className="mt-2 text-[11px] text-amber-500/80 flex items-center gap-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          Primera vez: deberás crear tu PIN
        </p>
      )}
    </button>
  )
}

// ─── Ranking ────────────────────────────────────────────────────────────────
function RankingWidget({ practicantes }) {
  const ordenados = [...practicantes].sort(
    (a, b) => (b.total_horas_acumuladas || 0) - (a.total_horas_acumuladas || 0)
  )
  if (ordenados.length === 0) return null
  const medallas = ['🥇', '🥈', '🥉']

  return (
    <div className="card p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd" />
        </svg>
        Ranking de horas
      </h3>
      <div className="space-y-2">
        {ordenados.slice(0, 5).map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <span className="text-base w-6 flex-shrink-0 text-center">
              {medallas[i] ?? <span className="text-slate-500 text-sm font-bold">{i + 1}</span>}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-300 truncate font-medium">
                  {p.nombre_completo.split(' ')[0]}
                </span>
                <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                  {formatHoras(p.total_horas_acumuladas || 0)}
                </span>
              </div>
              <div className="h-1 rounded-full bg-slate-700/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-emerald-600'
                  }`}
                  style={{
                    width: `${ordenados[0].total_horas_acumuladas > 0
                      ? ((p.total_horas_acumuladas || 0) / ordenados[0].total_horas_acumuladas) * 100
                      : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Kiosco principal ──────────────────────────────────────────────────────
export default function KioscoPracticantes() {
  const navigate = useNavigate()
  const [practicantes, setPracticantes] = useState([])
  const [estadosHoy, setEstadosHoy] = useState({})
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  // Estado del flujo PIN
  const [pinTarget, setPinTarget] = useState(null)       // practicante seleccionado
  const [pinModo, setPinModo] = useState(null)           // 'establecer' | 'verificar'
  const [pinError, setPinError] = useState(null)         // mensaje de error externo

  // Suscripción en tiempo real
  useEffect(() => {
    const q = query(practicantesRef, orderBy('nombre_completo'))
    const unsub = onSnapshot(q, async (snap) => {
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setPracticantes(lista)

      const hoy = getFechaHoy()
      const estados = {}
      await Promise.all(
        lista.map(async (p) => {
          const q2 = query(registrosRef, where('id_practicante', '==', p.id), where('fecha', '==', hoy))
          const snap2 = await getDocs(q2)
          if (!snap2.empty) {
            const reg = snap2.docs[0].data()
            estados[p.id] = reg.hora_entrada && reg.hora_salida ? 'completo'
              : reg.hora_entrada ? 'entrada' : null
          } else {
            estados[p.id] = null
          }
        })
      )
      setEstadosHoy(estados)
      setCargando(false)
    })
    return () => unsub()
  }, [])

  // ── Seleccionar tarjeta → abrir modal de PIN ──
  const handleSeleccionar = (practicante) => {
    setPinError(null)
    setPinTarget(practicante)
    const tienePIN = !!(practicante.pin && practicante.pin.trim() !== '')
    setPinModo(tienePIN ? 'verificar' : 'establecer')
  }

  // ── Confirmar PIN desde el modal ──
  const handlePinConfirmado = async (pinIngresado) => {
    if (!pinTarget) return

    if (pinModo === 'establecer') {
      // Guardar PIN en Firestore por primera vez
      try {
        await updateDoc(doc(practicantesRef, pinTarget.id), { pin: pinIngresado })
        cerrarPin()
        navigate(`/perfil/${pinTarget.id}`)
      } catch (e) {
        console.error('Error guardando PIN:', e)
        setPinError('Error al guardar. Intenta de nuevo.')
      }
    } else {
      // Verificar PIN
      if (pinIngresado === pinTarget.pin) {
        cerrarPin()
        navigate(`/perfil/${pinTarget.id}`)
      } else {
        setPinError('PIN incorrecto. Intenta de nuevo.')
      }
    }
  }

  const cerrarPin = () => {
    setPinTarget(null)
    setPinModo(null)
    setPinError(null)
  }

  const practicantesFiltrados = practicantes.filter((p) =>
    p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">Kiosco de Marcaje</h1>
        <p className="mt-1.5 text-slate-400">
          Selecciona tu nombre e ingresa tu PIN para registrar entrada o salida.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listado principal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Buscador */}
          <div className="relative">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar practicante..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {cargando && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-slate-500 text-sm">Cargando practicantes…</p>
            </div>
          )}

          {!cargando && practicantes.length === 0 && (
            <div className="card p-10 text-center">
              <p className="text-slate-400 font-medium">No hay practicantes registrados</p>
              <p className="text-slate-600 text-sm mt-1">El administrador debe añadir practicantes primero.</p>
            </div>
          )}

          {!cargando && practicantes.length > 0 && practicantesFiltrados.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-slate-400">No se encontró "{busqueda}"</p>
            </div>
          )}

          {!cargando && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {practicantesFiltrados.map((p, i) => (
                <TarjetaPracticante
                  key={p.id}
                  practicante={p}
                  index={i}
                  estadoHoy={estadosHoy[p.id]}
                  onClick={handleSeleccionar}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {!cargando && practicantes.length > 0 && (
            <div className="card p-5 animate-fade-in">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                Hoy
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <div className="text-xl font-bold text-emerald-400">
                    {Object.values(estadosHoy).filter((e) => e === 'entrada').length}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Activos</div>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <div className="text-xl font-bold text-slate-300">
                    {Object.values(estadosHoy).filter((e) => e === 'completo').length}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Completos</div>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <div className="text-xl font-bold text-slate-500">
                    {Object.values(estadosHoy).filter((e) => !e).length}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Sin marcar</div>
                </div>
              </div>
            </div>
          )}
          {!cargando && <RankingWidget practicantes={practicantes} />}
        </div>
      </div>

      {/* Modal de PIN */}
      {pinTarget && pinModo && (
        <PinModal
          modo={pinModo}
          nombre={pinTarget.nombre_completo}
          onConfirmar={handlePinConfirmado}
          onCancelar={cerrarPin}
          errorExterno={pinError}
        />
      )}
    </div>
  )
}
