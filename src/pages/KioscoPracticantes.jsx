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

// ─── Utilidades ─────────────────────────────────────────────────────────
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
          {/* Avatar ilustrado — usa ID para consistencia */}
          <div className="relative group-hover:scale-105 transition-transform duration-200 animate-float"
               style={{ animationDelay: `${index * 0.15}s` }}>
            <Avatar id={practicante.id} size="md" />
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
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3c0-2.071-1.679-3.75-3.75-3.75S8.25 4.429 8.25 6.5v3h7.5Z" />
                  </svg>
                : <svg className="h-3 w-3 flex-shrink-0 text-amber-500/60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9-2.35-5.25-5.25-5.25S8.25 3.6 8.25 6.5v.75a.75.75 0 0 1-1.5 0V6.5C6.75 3.175 9.175.75 12 .75s5.25 2.425 5.25 5.75v3h.75Z" />
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

// ─── Widget Ranking (Mejorado) ─────────────────────────────────────────────
function RankingWidget({ practicantes }) {
  const ordenados = [...practicantes]
    .sort((a,b) => (b.total_horas_acumuladas||0) - (a.total_horas_acumuladas||0))
  if (!ordenados.length) return null
  const medallas = ['🥇','🥈','🥉']

  return (
    <div className="card p-6 animate-fade-in">
      {/* Encabezado del ranking */}
      <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2"
          style={{color:'#9ca3af'}}>
        <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.126 0-2.25.189-3.345.557a.75.75 0 0 0-.549.754v.718c0 .447.293.85.702 1.024.355.15.75.225 1.125.225H12a.75.75 0 0 0 .75-.75v-.357c0-.804.6-1.486 1.378-1.592a6.75 6.75 0 0 0 3.978-2.456 6.732 6.732 0 0 0 2.602-7.095.75.75 0 0 0-.583-.85c-1.012-.213-2.036-.395-3.071-.543v-.858a.75.75 0 0 0-.735-.735h-5.5a.75.75 0 0 0-.735.735zm4.084 6.667a.75.75 0 0 0 1.5 0 2.25 2.25 0 1 1 1.5 0 .75.75 0 0 0 1.5 0 3.75 3.75 0 1 0-4.5 0z" clipRule="evenodd" />
        </svg>
        Top 5 - Ranking
      </h3>

      <div className="space-y-4">
        {ordenados.slice(0,5).map((p, i) => {
          const posicion = i + 1
          const esTop3 = i < 3
          
          return (
            <div 
              key={p.id} 
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300
                ${esTop3 
                  ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 shadow-lg' 
                  : 'bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50'
                }`}
            >
              {/* Posición con medalla o número */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl"
                   style={{
                     background: esTop3 
                       ? ['linear-gradient(135deg, #fbbf24, #f59e0b)', 'linear-gradient(135deg, #a3a3a3, #727272)', 'linear-gradient(135deg, #b45309, #92400e)'][i]
                       : 'rgba(107, 114, 128, 0.1)',
                   }}>
                <span className="text-lg font-black">{medallas[i] || posicion}</span>
              </div>

              {/* Avatar Premium */}
              <div className="flex-shrink-0 relative">
                <Avatar id={p.id} size="sm" />
                {/* Brillo sutil para top 3 */}
                {esTop3 && (
                  <div className="absolute inset-0 rounded-xl opacity-40"
                       style={{
                         boxShadow: `0 0 16px ${['rgba(251, 191, 36, 0.6)', 'rgba(163, 163, 163, 0.5)', 'rgba(180, 83, 9, 0.5)'][i]}`
                       }} />
                )}
              </div>

              {/* Nombre y info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${esTop3 ? 'text-slate-100' : 'text-slate-300'}`}>
                  {p.nombre_completo.split(' ')[0]}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatHoras(p.total_horas_acumuladas || 0)}
                </p>
              </div>

              {/* Horas destacadas */}
              <div className="flex-shrink-0 text-right">
                <div className={`text-sm font-bold tabular-nums ${
                  esTop3 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {formatHoras(p.total_horas_acumuladas || 0)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Barra de progreso visual */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="grid grid-cols-5 gap-1.5">
          {ordenados.slice(0, 5).map((p, i) => {
            const max = ordenados[0].total_horas_acumuladas || 1
            const porcentaje = ((p.total_horas_acumuladas || 0) / max) * 100
            
            return (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <div className="w-full h-8 rounded-lg overflow-hidden" style={{background:'rgba(51, 65, 85, 0.5)'}}>
                  <div
                    className="h-full transition-all duration-500 rounded-lg"
                    style={{
                      width: `${porcentaje}%`,
                      background: i === 0 
                        ? 'linear-gradient(180deg, #fbbf24, #f59e0b)' 
                        : i === 1 
                        ? 'linear-gradient(180deg, #a3a3a3, #727272)' 
                        : i === 2 
                        ? 'linear-gradient(180deg, #b45309, #92400e)' 
                        : 'linear-gradient(180deg, #06b6d4, #0d9488)'
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-400">{i + 1}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Stats del día ────────────────────────────────────────────────────────
function StatsHoy({ estadosHoy, total }) {
  const activos   = Object.values(estadosHoy).filter(e => e==='entrada').length
  const completos = Object.values(estadosHoy).filter(e => e==='completo').length
  const sinMarcar = Object.values(estadosHoy).filter(e => !e).length

  return (
    <div className="card p-5 animate-fade-in">
      <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{color:'#6b7280'}}>
        <svg className="h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75" />
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
