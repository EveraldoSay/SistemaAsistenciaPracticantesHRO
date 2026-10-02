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
import Avatar from '../components/Avatar'

// ─── Utilidades ────────────────────────────────────────────────────────────
function getFechaHoy() {
  const hoy = new Date()
  return `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`
}

function formatHoras(horas) {
  if (!horas) return '0h 00m'
  const h = Math.floor(horas)
  const m = Math.round((horas - h) * 60)
  return `${h}h ${String(m).padStart(2,'0')}m`
}

// ─── Tarjeta de practicante ────────────────────────────────────────────────
function TarjetaPracticante({ practicante, index, estadoHoy, onClick }) {
  const tienePIN = !!(practicante.pin?.trim())

  // Badge de estado
  const estadoBadge = estadoHoy === 'entrada' ? (
    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{color:'#2dd4bf'}}>
      <span className="dot-active" />
      Trabajando
    </span>
  ) : estadoHoy === 'completo' ? (
    <span className="flex items-center gap-1.5 text-xs font-semibold" style={{color:'#6b7280'}}>
      <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
      Turno completo
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-xs font-medium" style={{color:'#374151'}}>
      <span className="h-1.5 w-1.5 rounded-full" style={{background:'#1f2937'}} />
      Sin marcar hoy
    </span>
  )

  return (
    <button
      onClick={() => onClick(practicante)}
      className="group w-full text-left animate-fade-in transition-all duration-200
                 active:scale-[0.98] focus:outline-none"
    >
      <div className="card p-4 h-full transition-all duration-200"
           style={{ ['--hover-border']: 'rgba(20,184,166,0.25)' }}
           onMouseEnter={e => e.currentTarget.style.borderColor='rgba(20,184,166,0.2)'}
           onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}
      >
        <div className="flex items-center gap-3">
          {/* Avatar ilustrado — index evita duplicados entre los primeros 12 */}
          <div className="relative group-hover:scale-105 transition-transform duration-200 animate-float"
               style={{ animationDelay: `${index * 0.15}s` }}>
            <Avatar id={practicante.id} index={index} size="md" />
            {/* Indicador activo */}
            {estadoHoy === 'entrada' && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full"
                style={{ background:'#2dd4bf', border:'2px solid #0d0d0d', boxShadow:'0 0 8px rgba(45,212,191,0.8)' }} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-sm font-bold text-slate-100 truncate
                             group-hover:text-white transition-colors duration-200">
                {practicante.nombre_completo}
              </h3>
              {/* Candado */}
              {tienePIN
                ? <svg className="h-3 w-3 flex-shrink-0 text-emerald-500/60" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd"/>
                  </svg>
                : <svg className="h-3 w-3 flex-shrink-0 text-amber-500/60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9 2.35-5.25 5.25-5.25Z"/>
                  </svg>
              }
            </div>
            {estadoBadge}
          </div>

          {/* Flecha */}
          <svg className="h-4 w-4 flex-shrink-0 text-violet-500/40
                          group-hover:text-violet-400 group-hover:translate-x-1
                          transition-all duration-200"
               xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
          </svg>
        </div>

        {/* Barra de progreso de horas */}
        <div className="mt-3 pt-3" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px]" style={{color:'#374151'}}>Horas acumuladas</span>
            <span className="text-xs font-bold" style={{color:'#2dd4bf'}}>
              {formatHoras(practicante.total_horas_acumuladas || 0)}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.05)'}}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, ((practicante.total_horas_acumuladas || 0) / 480) * 100)}%`,
                background: 'linear-gradient(90deg, #0d9488, #06b6d4)',
              }}
            />
          </div>
        </div>

        {!tienePIN && (
          <p className="mt-2 text-[10px] flex items-center gap-1" style={{color:'rgba(251,191,36,0.7)'}}>
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
            </svg>
            Primera vez: deberás crear tu PIN
          </p>
        )}
      </div>
    </button>
  )
}

// ─── Widget Ranking ────────────────────────────────────────────────────────
function RankingWidget({ practicantes }) {
  const ordenados = [...practicantes]
    .sort((a,b) => (b.total_horas_acumuladas||0) - (a.total_horas_acumuladas||0))
  if (!ordenados.length) return null
  const medallas = ['🥇','🥈','🥉']

  return (
    <div className="card p-5 animate-fade-in">
      <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
          style={{color:'#6b7280'}}>
        <svg className="h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.798 49.798 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z" clipRule="evenodd"/>
        </svg>
        Ranking
      </h3>
      <div className="space-y-3">
        {ordenados.slice(0,5).map((p,i) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <span className="text-base w-5 flex-shrink-0 text-center">
              {medallas[i] ?? <span className="text-xs font-bold text-slate-600">{i+1}</span>}
            </span>
            <Avatar id={p.id} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300 truncate font-medium">
                  {p.nombre_completo.split(' ')[0]}
                </span>
                <span className="text-[11px] ml-1 flex-shrink-0" style={{color:'#2dd4bf'}}>
                  {formatHoras(p.total_horas_acumuladas||0)}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{background:'rgba(109,40,217,0.15)'}}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${ordenados[0].total_horas_acumuladas > 0
                      ? ((p.total_horas_acumuladas||0)/ordenados[0].total_horas_acumuladas)*100 : 0}%`,
                    background: i===0
                      ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                      : i===1 ? 'linear-gradient(90deg,#6b7280,#9ca3af)'
                      : i===2 ? 'linear-gradient(90deg,#92400e,#b45309)'
                      : 'linear-gradient(90deg,#0d9488,#06b6d4)',
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

// ─── Stats del día ─────────────────────────────────────────────────────────
function StatsHoy({ estadosHoy, total }) {
  const activos   = Object.values(estadosHoy).filter(e => e==='entrada').length
  const completos = Object.values(estadosHoy).filter(e => e==='completo').length
  const sinMarcar = Object.values(estadosHoy).filter(e => !e).length

  return (
    <div className="card p-5 animate-fade-in">
      <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{color:'#6b7280'}}>
        <svg className="h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>
        </svg>
        Hoy
      </h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { val: activos,   label: 'Activos',   color: '#2dd4bf', glow: 'rgba(45,212,191,0.3)' },
          { val: completos, label: 'Completos', color: '#e2e8f0', glow: 'transparent' },
          { val: sinMarcar, label: 'Sin marcar', color: '#374151', glow: 'transparent' },
        ].map(({ val, label, color, glow }) => (
          <div key={label} className="rounded-xl py-3"
               style={{background:'rgba(15,10,30,0.6)', border:'1px solid rgba(139,92,246,0.1)'}}>
            <div className="text-2xl font-black" style={{color, textShadow:`0 0 12px ${glow}`}}>
              {val}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Kiosco principal ──────────────────────────────────────────────────────
export default function KioscoPracticantes() {
  const navigate = useNavigate()
  const [practicantes, setPracticantes]   = useState([])
  const [estadosHoy,   setEstadosHoy]     = useState({})
  const [cargando,     setCargando]       = useState(true)
  const [busqueda,     setBusqueda]       = useState('')
  const [pinTarget,    setPinTarget]      = useState(null)
  const [pinModo,      setPinModo]        = useState(null)
  const [pinError,     setPinError]       = useState(null)

  useEffect(() => {
    const q = query(practicantesRef, orderBy('nombre_completo'))
    const unsub = onSnapshot(q, async (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setPracticantes(lista)

      const hoy = getFechaHoy()
      const estados = {}
      await Promise.all(lista.map(async (p) => {
        const q2 = query(registrosRef,
          where('id_practicante','==', p.id),
          where('fecha','==', hoy))
        const snap2 = await getDocs(q2)
        if (!snap2.empty) {
          const reg = snap2.docs[0].data()
          estados[p.id] = reg.hora_entrada && reg.hora_salida ? 'completo'
            : reg.hora_entrada ? 'entrada' : null
        } else { estados[p.id] = null }
      }))
      setEstadosHoy(estados)
      setCargando(false)
    })
    return () => unsub()
  }, [])

  const handleSeleccionar = (practicante) => {
    setPinError(null)
    setPinTarget(practicante)
    setPinModo(!!(practicante.pin?.trim()) ? 'verificar' : 'establecer')
  }

  const handlePinConfirmado = async (pinIngresado) => {
    if (!pinTarget) return
    if (pinModo === 'establecer') {
      try {
        await updateDoc(doc(practicantesRef, pinTarget.id), { pin: pinIngresado })
        cerrarPin()
        navigate(`/perfil/${pinTarget.id}`)
      } catch { setPinError('Error al guardar. Intenta de nuevo.') }
    } else {
      if (pinIngresado === pinTarget.pin) {
        cerrarPin(); navigate(`/perfil/${pinTarget.id}`)
      } else { setPinError('PIN incorrecto. Intenta de nuevo.') }
    }
  }

  const cerrarPin = () => { setPinTarget(null); setPinModo(null); setPinError(null) }

  const filtrados = practicantes.filter(p =>
    p.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          <span className="text-gradient">Kiosco</span>
          <span className="text-white"> de Marcaje</span>
        </h1>
        <p className="mt-2 text-sm" style={{color:'#4b5563'}}>
          Selecciona tu nombre e ingresa tu PIN para registrar entrada o salida.
        </p>
        <div className="divider mt-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Listado */}
        <div className="lg:col-span-2 space-y-4">
          {/* Buscador */}
          <div className="relative">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
                 style={{color:'rgba(139,92,246,0.5)'}}
                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
            </svg>
            <input type="text" placeholder="Buscar practicante..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="form-input pl-10" />
          </div>

          {cargando && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-t-transparent animate-spin"
                   style={{borderColor:'rgba(139,92,246,0.4)', borderTopColor:'#7c3aed'}} />
              <p className="text-sm text-slate-500">Cargando practicantes…</p>
            </div>
          )}

          {!cargando && !practicantes.length && (
            <div className="card p-10 text-center">
              <p className="text-slate-400 font-medium">No hay practicantes registrados</p>
              <p className="text-sm mt-1 text-slate-600">El administrador debe añadir practicantes primero.</p>
            </div>
          )}

          {!cargando && practicantes.length > 0 && !filtrados.length && (
            <div className="card p-8 text-center">
              <p className="text-slate-400">No se encontró "{busqueda}"</p>
            </div>
          )}

          {!cargando && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtrados.map((p, i) => (
                <TarjetaPracticante key={p.id} practicante={p} index={i}
                  estadoHoy={estadosHoy[p.id]} onClick={handleSeleccionar} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {!cargando && practicantes.length > 0 && (
            <StatsHoy estadosHoy={estadosHoy} total={practicantes.length} />
          )}
          {!cargando && <RankingWidget practicantes={practicantes} />}
        </div>
      </div>

      {/* Modal PIN */}
      {pinTarget && pinModo && (
        <PinModal modo={pinModo} nombre={pinTarget.nombre_completo}
          onConfirmar={handlePinConfirmado} onCancelar={cerrarPin}
          errorExterno={pinError} />
      )}
    </div>
  )
}
