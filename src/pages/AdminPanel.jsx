import { useState, useEffect, useCallback } from 'react'
import {
  db,
  practicantesRef,
  registrosRef,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from '../firebase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── PIN hardcodeado ────────────────────────────────────────────────────────
const PIN_ADMIN = '7007'

// ─── Utilidades ────────────────────────────────────────────────────────────
function formatHoras(horas) {
  if (!horas && horas !== 0) return '–'
  const h = Math.floor(horas)
  const m = Math.round((horas - h) * 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  const [y, m, d] = fechaStr.split('-')
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${d} ${meses[parseInt(m,10)-1]} ${y}`
}

function calcularHorasDia(entrada, salida) {
  if (!entrada || !salida) return 0
  const toMin = (t) => {
    const [h, mi, s = 0] = t.split(':').map(Number)
    return h * 60 + mi + s / 60
  }
  return Math.max(0, (toMin(salida) - toMin(entrada)) / 60)
}

// ─── Pantalla de login con PIN ──────────────────────────────────────────────
function LoginPin({ onLogin }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  // Auto-verificar al completar 4 dígitos
  useEffect(() => {
    if (pin.length === 4) {
      const id = setTimeout(() => {
        // Comparamos directamente con el valor actual del estado (no closure)
        if (pin === PIN_ADMIN) {
          sessionStorage.setItem('admin_auth', '1')
          onLogin()
        } else {
          setError(true)
          setShake(true)
          setPin('')
          setTimeout(() => setShake(false), 600)
        }
      }, 300)
      return () => clearTimeout(id)
    }
  }, [pin, onLogin])

  const verificar = () => {
    if (pin === PIN_ADMIN) {
      sessionStorage.setItem('admin_auth', '1')
      onLogin()
    } else {
      setError(true)
      setShake(true)
      setPin('')
      setTimeout(() => setShake(false), 600)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') verificar()
    if (error) setError(false)
  }

  // Teclado numérico
  const teclas = ['1','2','3','4','5','6','7','8','9','←','0','↵']

  const presionarTecla = (t) => {
    if (t === '←') { setPin((p) => p.slice(0, -1)); setError(false) }
    else if (t === '↵') verificar()
    else if (pin.length < 4) { setPin((p) => p + t); setError(false) }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className={`card w-full max-w-xs p-8 text-center animate-slide-up ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {/* Icono */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-700/60 border border-slate-600/50">
          <svg className="h-8 w-8 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-slate-100 mb-1">Panel de Administración</h2>
        <p className="text-sm text-slate-500 mb-6">Ingresa el PIN de acceso</p>

        {/* Indicadores de dígitos */}
        <div className="flex justify-center gap-3 mb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full border-2 transition-all duration-150 ${
                i < pin.length
                  ? error
                    ? 'bg-red-500 border-red-500'
                    : 'bg-emerald-400 border-emerald-400'
                  : 'bg-transparent border-slate-600'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-400 mb-3 animate-fade-in">PIN incorrecto</p>
        )}

        {/* Campo oculto para teclado nativo en desktop */}
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => { if (/^\d*$/.test(e.target.value) && e.target.value.length <= 4) { setPin(e.target.value); setError(false) }}}
          onKeyDown={handleKey}
          className="sr-only"
          autoFocus
          id="pin-input"
        />

        {/* Teclado numérico visual */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {teclas.map((t) => (
            <button
              key={t}
              onClick={() => presionarTecla(t)}
              className={`h-12 rounded-xl text-lg font-semibold transition-all duration-150 active:scale-95
                ${t === '↵'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : t === '←'
                  ? 'bg-slate-700/40 text-slate-400 border border-slate-600/40 hover:bg-slate-700'
                  : 'bg-slate-800/60 text-slate-200 border border-slate-700/40 hover:bg-slate-700'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-600">
          También puedes escribir desde el teclado
        </p>
      </div>

      {/* Animación shake personalizada */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}

// ─── Modal genérico de confirmación destructiva ─────────────────────────────
function ModalConfirmarEliminar({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="modal-overlay animate-fade-in" onClick={onCancelar}>
      <div className="card w-full max-w-sm p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 border-2 border-red-500/30">
          <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h3 className="text-center font-bold text-slate-100 mb-2">¿Estás seguro?</h3>
        <p className="text-center text-sm text-slate-400 mb-5">{mensaje}</p>
        <div className="flex gap-3">
          <button onClick={onCancelar} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={onConfirmar} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sección CRUD de Practicantes ───────────────────────────────────────────
function SeccionPracticantes({ practicantes }) {
  const [nombre, setNombre] = useState('')
  const [editando, setEditando] = useState(null)      // { id, nombre_completo }
  const [eliminar, setEliminar] = useState(null)      // practicante a eliminar
  const [resetPin, setResetPin] = useState(null)      // practicante al que resetear PIN
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState(null)

  const mostrarMsg = (texto) => {
    setMsg(texto)
    setTimeout(() => setMsg(null), 3500)
  }

  const crearPracticante = async () => {
    if (!nombre.trim()) return
    setGuardando(true)
    try {
      await addDoc(practicantesRef, {
        nombre_completo: nombre.trim(),
        total_horas_acumuladas: 0,
        pin: '',                          // sin PIN al crear → lo establece el practicante
        creado_en: new Date().toISOString(),
      })
      setNombre('')
      mostrarMsg('✅ Practicante creado')
    } catch (e) {
      mostrarMsg('❌ Error al crear')
    } finally { setGuardando(false) }
  }

  const guardarEdicion = async () => {
    if (!editando?.nombre_completo?.trim()) return
    setGuardando(true)
    try {
      await updateDoc(doc(practicantesRef, editando.id), {
        nombre_completo: editando.nombre_completo.trim(),
      })
      setEditando(null)
      mostrarMsg('✅ Nombre actualizado')
    } catch (e) {
      mostrarMsg('❌ Error al actualizar')
    } finally { setGuardando(false) }
  }

  const confirmarEliminar = async () => {
    if (!eliminar) return
    try {
      const q = query(registrosRef, where('id_practicante', '==', eliminar.id))
      const snap = await getDocs(q)
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
      await deleteDoc(doc(practicantesRef, eliminar.id))
      setEliminar(null)
      mostrarMsg('✅ Practicante eliminado')
    } catch (e) {
      mostrarMsg('❌ Error al eliminar')
    }
  }

  // Resetear PIN → poner a "" para que el practicante lo cree de nuevo
  const confirmarResetPin = async () => {
    if (!resetPin) return
    try {
      await updateDoc(doc(practicantesRef, resetPin.id), { pin: '' })
      setResetPin(null)
      mostrarMsg(`🔑 PIN de ${resetPin.nombre_completo.split(' ')[0]} reseteado. Deberá crear uno nuevo.`)
    } catch (e) {
      mostrarMsg('❌ Error al resetear PIN')
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
        Practicantes
      </h2>

      {msg && (
        <div className="mb-4 rounded-lg bg-slate-700/50 border border-slate-600/40 px-4 py-2 text-sm text-slate-200 animate-fade-in">
          {msg}
        </div>
      )}

      {/* Formulario crear */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="Nombre completo del nuevo practicante"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && crearPracticante()}
          className="form-input flex-1"
        />
        <button onClick={crearPracticante} disabled={!nombre.trim() || guardando} className="btn-emerald px-4 py-2.5 whitespace-nowrap">
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar
        </button>
      </div>

      {/* Lista */}
      {practicantes.length === 0 ? (
        <p className="text-center text-slate-500 text-sm py-6">No hay practicantes registrados.</p>
      ) : (
        <ul className="space-y-2">
          {practicantes.map((p) => {
            const tienePIN = !!(p.pin && p.pin.trim() !== '')
            return (
              <li key={p.id} className="rounded-xl bg-slate-900/50 border border-slate-700/40 px-4 py-3">
                {editando?.id === p.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      className="form-input flex-1 py-1.5 text-sm"
                      value={editando.nombre_completo}
                      onChange={(e) => setEditando({ ...editando, nombre_completo: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && guardarEdicion()}
                    />
                    <button onClick={guardarEdicion} disabled={guardando} className="btn-emerald px-3 py-1.5 text-xs">Guardar</button>
                    <button onClick={() => setEditando(null)} className="btn-ghost px-3 py-1.5 text-xs">Cancelar</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{p.nombre_completo}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-slate-500">{formatHoras(p.total_horas_acumuladas || 0)} acumuladas</p>
                        {/* Badge de estado del PIN */}
                        {tienePIN ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500/80 font-medium">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                            </svg>
                            PIN activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-500/80 font-medium">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 0 1-1.5 0V6.75a3.75 3.75 0 1 0-7.5 0v3a3 3 0 0 1 3 3v6.75a3 3 0 0 1-3 3H3.75a3 3 0 0 1-3-3v-6.75a3 3 0 0 1 3-3h9v-3c0-2.9 2.35-5.25 5.25-5.25Z" />
                            </svg>
                            Sin PIN
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      {/* Resetear PIN (solo si tiene uno) */}
                      {tienePIN && (
                        <button
                          onClick={() => setResetPin(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Resetear PIN"
                        >
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                          </svg>
                        </button>
                      )}
                      {/* Editar nombre */}
                      <button
                        onClick={() => setEditando({ id: p.id, nombre_completo: p.nombre_completo })}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 transition-colors"
                        title="Editar nombre"
                      >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      {/* Eliminar */}
                      <button
                        onClick={() => setEliminar(p)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Eliminar practicante"
                      >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Modal eliminar practicante */}
      {eliminar && (
        <ModalConfirmarEliminar
          mensaje={`Se eliminará a "${eliminar.nombre_completo}" junto con TODOS sus registros de horas. Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminar}
          onCancelar={() => setEliminar(null)}
        />
      )}

      {/* Modal resetear PIN */}
      {resetPin && (
        <div className="modal-overlay animate-fade-in" onClick={() => setResetPin(null)}>
          <div className="card w-full max-w-sm p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 border-2 border-amber-500/30">
              <svg className="h-6 w-6 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
              </svg>
            </div>
            <h3 className="text-center font-bold text-slate-100 mb-1">Resetear PIN</h3>
            <p className="text-center text-sm text-slate-400 mb-1">
              ¿Resetear el PIN de{' '}
              <span className="font-semibold text-slate-200">{resetPin.nombre_completo}</span>?
            </p>
            <p className="text-center text-xs text-slate-500 mb-5">
              La próxima vez que inicie sesión deberá crear un nuevo PIN.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setResetPin(null)} className="btn-ghost flex-1">Cancelar</button>
              <button
                onClick={confirmarResetPin}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/25"
              >
                Resetear PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sección de incidencias y ajuste manual ─────────────────────────────────
function SeccionAjusteHoras({ practicantes }) {
  const [todos, setTodos] = useState([])
  const [seleccionado, setSeleccionado] = useState(null) // { practicante, registros }
  const [editReg, setEditReg] = useState(null)  // registro en edición
  const [form, setForm] = useState({ hora_entrada: '', hora_salida: '', total_dia_horas: '', nota_admin: '' })
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState(null)
  const [filtro, setFiltro] = useState('incompletos') // 'incompletos' | 'todos'

  const mostrarMsg = (t) => { setMsg(t); setTimeout(() => setMsg(null), 3000) }

  // Suscribir a todos los registros incompletos
  useEffect(() => {
    const q = query(registrosRef, orderBy('fecha', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setTodos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  // Al seleccionar practicante, cargar sus registros
  const abrirPracticante = (p) => {
    const regs = todos
      .filter((r) => r.id_practicante === p.id)
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    setSeleccionado({ practicante: p, registros: regs })
    setEditReg(null)
  }

  // Iniciar edición de un registro
  const iniciarEdicion = (reg) => {
    setEditReg(reg)
    const entrada = reg.hora_entrada || ''
    const salida = reg.hora_salida || ''
    const calculado = entrada && salida ? calcularHorasDia(entrada, salida).toFixed(2) : reg.total_dia_horas?.toFixed(2) || ''
    setForm({
      hora_entrada: entrada,
      hora_salida: salida,
      total_dia_horas: calculado,
      nota_admin: reg.nota_admin || '',
    })
  }

  // Recalcular cuando cambian las horas
  const handleHoraChange = (campo, valor) => {
    const next = { ...form, [campo]: valor }
    if (next.hora_entrada && next.hora_salida) {
      const calculado = calcularHorasDia(next.hora_entrada, next.hora_salida)
      next.total_dia_horas = calculado > 0 ? calculado.toFixed(2) : ''
    }
    setForm(next)
  }

  const guardarAjuste = async () => {
    if (!editReg) return
    if (!form.nota_admin.trim()) {
      mostrarMsg('⚠️ La nota de justificación es obligatoria.')
      return
    }
    setGuardando(true)
    try {
      const entrada = form.hora_entrada || null
      const salida = form.hora_salida || null
      const horas = parseFloat(form.total_dia_horas) || 0
      const completo = !!(entrada && salida)

      // 1. Guardar el registro ajustado
      await updateDoc(doc(registrosRef, editReg.id), {
        hora_entrada: entrada,
        hora_salida: salida,
        total_dia_horas: horas || null,
        estado: completo ? 'COMPLETO' : 'INCOMPLETO',
        nota_admin: form.nota_admin.trim(),
        modificado_por_admin: true,
      })

      // 2. Recalcular total acumulado sumando TODOS los registros del practicante
      //    (más robusto que usar diferencias — siempre da el valor exacto)
      const qTodos = query(registrosRef, where('id_practicante', '==', editReg.id_practicante))
      const snapTodos = await getDocs(qTodos)
      const totalReal = snapTodos.docs.reduce((acc, d) => {
        const data = d.data()
        // Usar el valor recién guardado para el registro editado
        if (d.id === editReg.id) return acc + (horas || 0)
        return acc + (data.total_dia_horas || 0)
      }, 0)

      await updateDoc(doc(practicantesRef, editReg.id_practicante), {
        total_horas_acumuladas: Math.max(0, totalReal),
      })

      setEditReg(null)
      mostrarMsg('✅ Registro ajustado correctamente')

      // Refrescar vista del practicante
      if (seleccionado) {
        const regs = todos
          .filter((r) => r.id_practicante === seleccionado.practicante.id)
          .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
        setSeleccionado({ ...seleccionado, registros: regs })
      }
    } catch (e) {
      mostrarMsg('❌ Error al guardar ajuste')
    } finally { setGuardando(false) }
  }

  // Incompletos por practicante
  const incompletosPorPract = (pId) =>
    todos.filter((r) => r.id_practicante === pId && r.estado === 'INCOMPLETO').length

  const practicantesFiltrados =
    filtro === 'incompletos'
      ? practicantes.filter((p) => incompletosPorPract(p.id) > 0)
      : practicantes

  return (
    <div className="space-y-4">
      {/* Alertas globales de incompletos */}
      {practicantes.some((p) => incompletosPorPract(p.id) > 0) && (
        <div className="alerta-amber">
          <svg className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="font-semibold text-amber-300 text-sm">Registros incompletos detectados</p>
            <p className="text-amber-400/80 text-xs mt-0.5">
              Hay practicantes con turnos que no cerraron su marcaje. Selecciónalos para ajustar manualmente.
            </p>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Ajuste Manual de Horas
          </h2>
          {/* Filtro */}
          <div className="flex rounded-xl overflow-hidden border border-slate-700/50 text-xs font-medium">
            <button
              onClick={() => { setFiltro('incompletos'); setSeleccionado(null) }}
              className={`px-3 py-1.5 transition-colors duration-150 ${filtro === 'incompletos' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
            >
              Con incidencias
            </button>
            <button
              onClick={() => { setFiltro('todos'); setSeleccionado(null) }}
              className={`px-3 py-1.5 transition-colors duration-150 ${filtro === 'todos' ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
            >
              Todos
            </button>
          </div>
        </div>

        {msg && <div className="mb-4 rounded-lg bg-slate-700/50 border border-slate-600/40 px-4 py-2 text-sm text-slate-200 animate-fade-in">{msg}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Panel izquierdo: lista de practicantes */}
          <div className="space-y-2">
            {practicantesFiltrados.length === 0 && (
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-6 text-center">
                <p className="text-sm text-emerald-400">✅ Sin incidencias pendientes</p>
              </div>
            )}
            {practicantesFiltrados.map((p) => {
              const nInc = incompletosPorPract(p.id)
              const activo = seleccionado?.practicante.id === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => abrirPracticante(p)}
                  className={`w-full text-left rounded-xl px-4 py-3 border transition-all duration-200
                    ${activo
                      ? 'bg-slate-700/80 border-slate-500/50 ring-1 ring-slate-500/30'
                      : 'bg-slate-900/50 border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/60'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200 truncate">{p.nombre_completo}</p>
                    {nInc > 0 && (
                      <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                        {nInc}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{formatHoras(p.total_horas_acumuladas || 0)} acumuladas</p>
                </button>
              )
            })}
          </div>

          {/* Panel derecho: registros del practicante seleccionado */}
          <div>
            {!seleccionado ? (
              <div className="flex h-full min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-700/50 text-slate-600 text-sm">
                Selecciona un practicante
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Registros de {seleccionado.practicante.nombre_completo.split(' ')[0]}
                </p>
                {seleccionado.registros.length === 0 && (
                  <p className="text-sm text-slate-500">Sin registros aún.</p>
                )}
                {seleccionado.registros.map((reg) => (
                  <div key={reg.id} className={`rounded-xl p-3 border text-sm ${reg.estado === 'INCOMPLETO' ? 'bg-amber-500/5 border-amber-500/25' : 'bg-slate-800/40 border-slate-700/40'}`}>
                    {editReg?.id === reg.id ? (
                      /* Formulario de edición */
                      <div className="space-y-3">
                        <p className="font-semibold text-slate-200 text-xs">{formatFecha(reg.fecha)}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="form-label text-xs">Entrada</label>
                            <input
                              type="time"
                              step="1"
                              value={form.hora_entrada}
                              onChange={(e) => handleHoraChange('hora_entrada', e.target.value)}
                              className="form-input py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="form-label text-xs">Salida</label>
                            <input
                              type="time"
                              step="1"
                              value={form.hora_salida}
                              onChange={(e) => handleHoraChange('hora_salida', e.target.value)}
                              className="form-input py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="form-label text-xs">Total horas</label>
                          {/* Solo lectura — se calcula automáticamente desde entrada/salida */}
                          <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border
                            ${parseFloat(form.total_dia_horas) > 0
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-slate-900/50 border-slate-700/40'
                            }`}>
                            <svg className="h-4 w-4 text-emerald-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className={`text-lg font-bold tabular-nums ${parseFloat(form.total_dia_horas) > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                              {parseFloat(form.total_dia_horas) > 0 ? formatHoras(parseFloat(form.total_dia_horas)) : '–'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {parseFloat(form.total_dia_horas) > 0 ? 'calculado automáticamente' : 'ingresa entrada y salida'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="form-label text-xs">
                            Nota de justificación
                            <span className="ml-1 text-red-400">*</span>
                          </label>
                          <textarea
                            rows={2}
                            value={form.nota_admin}
                            onChange={(e) => setForm({ ...form, nota_admin: e.target.value })}
                            className="form-input py-2 text-sm resize-none"
                            placeholder="Ej: Se asignan 4h por olvido de marcaje de salida"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditReg(null)} className="btn-ghost flex-1 py-2 text-xs">Cancelar</button>
                          <button onClick={guardarAjuste} disabled={guardando} className="btn-emerald flex-1 py-2 text-xs">
                            {guardando ? 'Guardando…' : 'Guardar ajuste'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Vista normal del registro */
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-200">{formatFecha(reg.fecha)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {reg.hora_entrada || '–'} → {reg.hora_salida || '–'}
                            {' · '}
                            <span className="font-semibold text-slate-300">{reg.total_dia_horas ? formatHoras(reg.total_dia_horas) : '–'}</span>
                          </p>
                          {reg.nota_admin && (
                            <p className="text-[11px] text-slate-500 italic mt-1">"{reg.nota_admin}"</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {reg.estado === 'INCOMPLETO' && <span className="badge-incompleto">Pendiente</span>}
                          <button
                            onClick={() => iniciarEdicion(reg)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 transition-colors"
                            title="Editar"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sección de reportes PDF ────────────────────────────────────────────────
function SeccionReportes({ practicantes }) {
  const [generando, setGenerando] = useState(null)

  const generarPDF = async (practicante) => {
    setGenerando(practicante.id)
    try {
      // Cargar todos los registros del practicante
      const q = query(
        registrosRef,
        where('id_practicante', '==', practicante.id),
        orderBy('fecha', 'asc')
      )
      const snap = await getDocs(q)
      const registros = snap.docs.map((d) => d.data())

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      // ── Cabecera ──
      pdf.setFillColor(15, 23, 42)       // slate-950
      pdf.rect(0, 0, 210, 45, 'F')

      pdf.setTextColor(16, 185, 129)     // emerald-500
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Reporte de Horas', 14, 18)

      pdf.setTextColor(226, 232, 240)    // slate-200
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(practicante.nombre_completo, 14, 28)

      pdf.setTextColor(100, 116, 139)    // slate-500
      pdf.setFontSize(9)
      pdf.text(`Generado el ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 37)
      pdf.text(`Total acumulado: ${formatHoras(practicante.total_horas_acumuladas || 0)}`, 140, 37)

      // ── Tabla de registros ──
      const filas = registros.map((r) => [
        formatFecha(r.fecha),
        r.hora_entrada || '–',
        r.hora_salida || '–',
        r.total_dia_horas ? formatHoras(r.total_dia_horas) : '–',
        r.estado === 'COMPLETO' ? 'Completo' : 'Incompleto',
        r.nota_admin || '',
      ])

      autoTable(pdf, {
        startY: 52,
        head: [['Fecha', 'Entrada', 'Salida', 'Total', 'Estado', 'Nota Admin']],
        body: filas,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59],     // slate-800
          textColor: [148, 163, 184],  // slate-400
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],     // slate-700
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],  // slate-50
        },
        columnStyles: {
          0: { cellWidth: 26 },
          1: { cellWidth: 20 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 24 },
          5: { cellWidth: 'auto' },
        },
        didParseCell: (data) => {
          // Filas incompletas en color amber
          if (data.section === 'body' && data.row.raw[4] === 'Incompleto') {
            data.cell.styles.textColor = [180, 120, 0]
          }
        },
        margin: { left: 14, right: 14 },
      })

      // ── Resumen final ──
      const finalY = pdf.lastAutoTable.finalY + 8
      pdf.setFontSize(9)
      pdf.setTextColor(100, 116, 139)
      pdf.text(`Total de días registrados: ${registros.length}`, 14, finalY)
      pdf.text(`Días completos: ${registros.filter((r) => r.estado === 'COMPLETO').length}`, 14, finalY + 6)
      pdf.text(`Días con incidencia: ${registros.filter((r) => r.estado === 'INCOMPLETO').length}`, 14, finalY + 12)

      pdf.setFontSize(10)
      pdf.setTextColor(16, 185, 129)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`TOTAL HORAS: ${formatHoras(practicante.total_horas_acumuladas || 0)}`, 140, finalY + 6)

      // ── Pie de página ──
      const pageCount = pdf.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(148, 163, 184)
        pdf.text(`Página ${i} de ${pageCount}`, 196, 290, { align: 'right' })
        pdf.text('Sistema de Control de Horas · Practicantes', 14, 290)
      }

      const nombreArchivo = practicante.nombre_completo.replace(/\s+/g, '_').toLowerCase()
      pdf.save(`reporte_${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (e) {
      console.error('Error generando PDF:', e)
    } finally {
      setGenerando(null)
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
        <svg className="h-5 w-5 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        Reportes PDF
      </h2>
      <p className="text-xs text-slate-500 mb-5">Genera y descarga el reporte individual de cada practicante con desglose completo de días y horas.</p>

      {practicantes.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No hay practicantes registrados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {practicantes.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl bg-slate-900/50 border border-slate-700/40 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{p.nombre_completo}</p>
                <p className="text-xs text-slate-500">{formatHoras(p.total_horas_acumuladas || 0)}</p>
              </div>
              <button
                onClick={() => generarPDF(p)}
                disabled={generando === p.id}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  bg-rose-500/15 text-rose-400 border border-rose-500/25
                  hover:bg-rose-500/25 transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generando === p.id ? (
                  <>
                    <span className="h-3 w-3 rounded-full border border-rose-400 border-t-transparent animate-spin" />
                    Generando…
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Descargar PDF
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Panel de administración principal ─────────────────────────────────────
export default function AdminPanel() {
  const [autenticado, setAutenticado] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const [tab, setTab] = useState('practicantes') // 'practicantes' | 'ajustes' | 'reportes'
  const [practicantes, setPracticantes] = useState([])

  // Suscripción en tiempo real a practicantes
  useEffect(() => {
    if (!autenticado) return
    const q = query(practicantesRef, orderBy('nombre_completo'))
    const unsub = onSnapshot(q, (snap) => {
      setPracticantes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [autenticado])

  const cerrarSesion = () => {
    sessionStorage.removeItem('admin_auth')
    setAutenticado(false)
  }

  if (!autenticado) {
    return <LoginPin onLogin={() => setAutenticado(true)} />
  }

  const tabs = [
    { id: 'practicantes', label: 'Practicantes', icon: (
      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    )},
    { id: 'ajustes', label: 'Ajuste de Horas', icon: (
      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
      </svg>
    )},
    { id: 'reportes', label: 'Reportes', icon: (
      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    )},
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-slate-500">Gestión de practicantes y registros de horas</p>
        </div>
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-700/50 hover:border-red-500/30 transition-all duration-200"
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          Cerrar sesión
        </button>
      </div>

      {/* Tabs de navegación */}
      <div className="mb-6 flex overflow-x-auto gap-1 rounded-2xl bg-slate-900/60 border border-slate-800/60 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200
              ${tab === t.id
                ? 'bg-slate-700 text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
              }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido según tab */}
      <div className="animate-fade-in" key={tab}>
        {tab === 'practicantes' && <SeccionPracticantes practicantes={practicantes} />}
        {tab === 'ajustes' && <SeccionAjusteHoras practicantes={practicantes} />}
        {tab === 'reportes' && <SeccionReportes practicantes={practicantes} />}
      </div>
    </div>
  )
}
