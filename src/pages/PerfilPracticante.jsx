import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  db,
  practicantesRef,
  registrosRef,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from '../firebase'

// ─── Utilidades de fecha / hora ────────────────────────────────────────────
function getFechaHoy() {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const d = String(hoy.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getFechaAyer() {
  const ayer = new Date()
  ayer.setDate(ayer.getDate() - 1)
  const y = ayer.getFullYear()
  const m = String(ayer.getMonth() + 1).padStart(2, '0')
  const d = String(ayer.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getHoraActual() {
  const now = new Date()
  return (
    String(now.getHours()).padStart(2, '0') +
    ':' +
    String(now.getMinutes()).padStart(2, '0') +
    ':' +
    String(now.getSeconds()).padStart(2, '0')
  )
}

/** Convierte "HH:MM:SS" → minutos desde medianoche */
function horaAMinutos(hora) {
  if (!hora) return 0
  const [h, m, s = 0] = hora.split(':').map(Number)
  return h * 60 + m + s / 60
}

/** Calcula horas decimales entre dos strings "HH:MM:SS" */
function calcularHorasDia(entrada, salida) {
  if (!entrada || !salida) return 0
  const diff = horaAMinutos(salida) - horaAMinutos(entrada)
  return Math.max(0, diff / 60)
}

function formatHoras(horas) {
  if (!horas) return '0h 00m'
  const h = Math.floor(horas)
  const m = Math.round((horas - h) * 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  const [y, m, d] = fechaStr.split('-')
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${d} ${meses[parseInt(m, 10) - 1]} ${y}`
}

function formatFechaLarga(fechaStr) {
  if (!fechaStr) return ''
  const [y, m, d] = fechaStr.split('-')
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  return `${parseInt(d, 10)} de ${meses[parseInt(m, 10) - 1]} de ${y}`
}

// ─── Reloj en vivo ─────────────────────────────────────────────────────────
function RelojEnVivo() {
  const [hora, setHora] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setHora(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(hora.getHours()).padStart(2, '0')
  const mm = String(hora.getMinutes()).padStart(2, '0')
  const ss = String(hora.getSeconds()).padStart(2, '0')

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  const diasem = diasSemana[hora.getDay()]
  const diames = hora.getDate()
  const mes = meses[hora.getMonth()]

  return (
    <div className="text-center">
      <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-100 tabular-nums">
        {hh}
        <span className="text-emerald-400 animate-pulse">:</span>
        {mm}
        <span className="text-slate-500 text-4xl sm:text-5xl">:{ss}</span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {diasem}, {diames} de {mes}
      </p>
    </div>
  )
}

// ─── Modal de confirmación ─────────────────────────────────────────────────
function ModalConfirmacion({ tipo, onConfirmar, onCancelar }) {
  const [horaModal, setHoraModal] = useState(getHoraActual())

  useEffect(() => {
    const id = setInterval(() => setHoraModal(getHoraActual()), 1000)
    return () => clearInterval(id)
  }, [])

  const esEntrada = tipo === 'ENTRADA'

  return (
    <div className="modal-overlay animate-fade-in" onClick={onCancelar}>
      <div
        className="card w-full max-w-sm p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono */}
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full
            ${esEntrada
              ? 'bg-emerald-500/15 border-2 border-emerald-500/40'
              : 'bg-rose-500/15 border-2 border-rose-500/40'
            }`}
        >
          {esEntrada ? (
            <svg className="h-8 w-8 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          ) : (
            <svg className="h-8 w-8 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          )}
        </div>

        {/* Texto */}
        <h2 className="text-center text-lg font-bold text-slate-100 mb-2">
          Confirmar {esEntrada ? 'Entrada' : 'Salida'}
        </h2>
        <p className="text-center text-slate-400 text-sm leading-relaxed mb-4">
          ¿Estás seguro de registrar tu{' '}
          <span className={`font-bold ${esEntrada ? 'text-emerald-400' : 'text-rose-400'}`}>
            {tipo}
          </span>{' '}
          a las{' '}
          <span className="font-bold text-slate-200 tabular-nums">{horaModal}</span>?
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          <button onClick={onCancelar} className="btn-ghost flex-1">
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(horaModal)}
            className={`flex-1 ${esEntrada ? 'btn-emerald' : 'btn-rose'}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Fila del historial ────────────────────────────────────────────────────
function FilaHistorial({ registro }) {
  const esCompleto = registro.estado === 'COMPLETO'
  const tieneNota = registro.nota_admin && registro.nota_admin.trim() !== ''

  return (
    <div className={`rounded-xl p-4 border transition-colors duration-200
      ${esCompleto
        ? 'bg-slate-800/40 border-slate-700/40'
        : 'bg-amber-500/5 border-amber-500/25'
      }`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        {/* Fecha */}
        <div>
          <p className="text-sm font-semibold text-slate-200">
            {formatFecha(registro.fecha)}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Entrada: {registro.hora_entrada || '–'}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Salida: {registro.hora_salida || '–'}
            </span>
          </div>
        </div>

        {/* Horas + estado */}
        <div className="text-right flex flex-col items-end gap-1.5">
          <span className="text-base font-bold text-slate-100">
            {registro.total_dia_horas ? formatHoras(registro.total_dia_horas) : '–'}
          </span>
          {esCompleto ? (
            <span className="badge-completo">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              Completo
            </span>
          ) : (
            <span className="badge-incompleto">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
              Pendiente ajuste
            </span>
          )}
          {registro.modificado_por_admin && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded-full border border-slate-600/30">
              ✏️ Ajustado por admin
            </span>
          )}
        </div>
      </div>

      {/* Nota del admin */}
      {tieneNota && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-900/50 px-3 py-2.5 border border-slate-700/40">
          <svg className="h-3.5 w-3.5 text-slate-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
          <p className="text-xs text-slate-400 italic leading-relaxed">
            <span className="font-semibold not-italic text-slate-500">Nota admin: </span>
            {registro.nota_admin}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Vista principal del perfil ────────────────────────────────────────────
export default function PerfilPracticante() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [practicante, setPracticante] = useState(null)
  const [registros, setRegistros] = useState([])
  const [registroHoy, setRegistroHoy] = useState(null)
  const [registroAyer, setRegistroAyer] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [modalTipo, setModalTipo] = useState(null) // 'ENTRADA' | 'SALIDA' | null
  const [mensajeExito, setMensajeExito] = useState(null)

  const hoy = getFechaHoy()
  const ayer = getFechaAyer()

  // Cargar datos del practicante
  useEffect(() => {
    if (!id) return
    const ref = doc(practicantesRef, id)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setPracticante({ id: snap.id, ...snap.data() })
      } else {
        navigate('/')
      }
    })
    return () => unsub()
  }, [id, navigate])

  // Cargar historial de registros (tiempo real, ordenado por fecha desc)
  useEffect(() => {
    if (!id) return
    const q = query(
      registrosRef,
      where('id_practicante', '==', id),
      orderBy('fecha', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRegistros(lista)

      setRegistroHoy(lista.find((r) => r.fecha === hoy) || null)
      setRegistroAyer(lista.find((r) => r.fecha === ayer) || null)
      setCargando(false)
    })
    return () => unsub()
  }, [id, hoy, ayer])

  // ─── Determinar estado del día ──────────────────────────────────────────
  // ayerIncompleto: el registro de ayer existe, tiene entrada pero NO salida
  const ayerIncompleto =
    registroAyer &&
    registroAyer.hora_entrada &&
    !registroAyer.hora_salida &&
    registroAyer.estado === 'INCOMPLETO'

  // Habilitar entrada: sin registro hoy O tiene registro pero sin hora_entrada
  const puedeEntrada = !registroHoy || !registroHoy.hora_entrada

  // Habilitar salida: tiene entrada hoy pero no tiene salida
  const puedeSalida =
    registroHoy &&
    registroHoy.hora_entrada &&
    !registroHoy.hora_salida

  // ─── Registrar marcaje ──────────────────────────────────────────────────
  const confirmarMarcaje = useCallback(
    async (horaConfirmada) => {
      if (!practicante || procesando) return
      setProcesando(true)
      setModalTipo(null)

      try {
        if (modalTipo === 'ENTRADA') {
          if (registroHoy) {
            // Actualizar registro existente (sin hora_entrada)
            await updateDoc(doc(registrosRef, registroHoy.id), {
              hora_entrada: horaConfirmada,
              estado: 'INCOMPLETO',
            })
          } else {
            // Crear nuevo registro del día
            await addDoc(registrosRef, {
              id_practicante: practicante.id,
              fecha: hoy,
              hora_entrada: horaConfirmada,
              hora_salida: null,
              total_dia_horas: null,
              estado: 'INCOMPLETO',
              nota_admin: '',
              modificado_por_admin: false,
            })
          }
          setMensajeExito('✅ Entrada registrada correctamente')
        } else if (modalTipo === 'SALIDA') {
          if (!registroHoy || !registroHoy.hora_entrada) return

          const horasDia = calcularHorasDia(registroHoy.hora_entrada, horaConfirmada)

          // Actualizar registro con salida
          await updateDoc(doc(registrosRef, registroHoy.id), {
            hora_salida: horaConfirmada,
            total_dia_horas: horasDia,
            estado: 'COMPLETO',
          })

          // Sumar horas al total acumulado del practicante
          const nuevasHoras = (practicante.total_horas_acumuladas || 0) + horasDia
          await updateDoc(doc(practicantesRef, practicante.id), {
            total_horas_acumuladas: nuevasHoras,
          })

          setMensajeExito(`✅ Salida registrada · ${formatHoras(horasDia)} trabajadas hoy`)
        }
      } catch (err) {
        console.error('Error al registrar marcaje:', err)
        setMensajeExito('❌ Error al guardar. Intenta de nuevo.')
      } finally {
        setProcesando(false)
        setTimeout(() => setMensajeExito(null), 4000)
      }
    },
    [practicante, procesando, modalTipo, registroHoy, hoy]
  )

  // ─── Render ─────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 text-sm">Cargando perfil…</p>
        </div>
      </div>
    )
  }

  if (!practicante) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 animate-slide-up">
      {/* ── Botón volver ── */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200"
      >
        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Volver al kiosco
      </button>

      {/* ── Card: Reloj + nombre ── */}
      <div className="card p-6 mb-4">
        <RelojEnVivo />
        <div className="mt-5 text-center border-t border-slate-700/50 pt-5">
          <h1 className="text-xl font-bold text-slate-100">
            {practicante.nombre_completo}
          </h1>
          <div className="mt-1 flex items-center justify-center gap-2">
            <svg className="h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-sm text-slate-400">
              Total acumulado:{' '}
              <span className="font-bold text-slate-200">
                {formatHoras(practicante.total_horas_acumuladas || 0)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Alerta: turno incompleto del día anterior ── */}
      {ayerIncompleto && (
        <div className="alerta-amber mb-4 animate-fade-in">
          <svg className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-300">Marcaje pendiente</p>
            <p className="text-sm text-amber-400/80 mt-0.5">
              Tienes un marcaje pendiente del{' '}
              <span className="font-semibold">{formatFechaLarga(ayer)}</span>. Notifica al
              administrador para regularizar tus horas.
            </p>
          </div>
        </div>
      )}

      {/* ── Mensaje de éxito / error ── */}
      {mensajeExito && (
        <div className="mb-4 rounded-xl bg-slate-800/80 border border-slate-600/50 px-4 py-3 text-sm text-slate-200 animate-fade-in">
          {mensajeExito}
        </div>
      )}

      {/* ── Card: Botones de marcaje ── */}
      <div className="card p-6 mb-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Marcaje de hoy · {formatFecha(hoy)}
        </h2>

        {/* Estado del registro actual */}
        {registroHoy && (
          <div className="flex flex-wrap gap-4 mb-5 p-3 rounded-xl bg-slate-900/50 border border-slate-700/40">
            <div className="flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${registroHoy.hora_entrada ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span className="text-slate-400">Entrada:</span>
              <span className={`font-mono font-semibold ${registroHoy.hora_entrada ? 'text-emerald-400' : 'text-slate-600'}`}>
                {registroHoy.hora_entrada || 'pendiente'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${registroHoy.hora_salida ? 'bg-rose-400' : 'bg-slate-600'}`} />
              <span className="text-slate-400">Salida:</span>
              <span className={`font-mono font-semibold ${registroHoy.hora_salida ? 'text-rose-400' : 'text-slate-600'}`}>
                {registroHoy.hora_salida || 'pendiente'}
              </span>
            </div>
            {registroHoy.total_dia_horas && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Total:</span>
                <span className="font-bold text-slate-200">{formatHoras(registroHoy.total_dia_horas)}</span>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setModalTipo('ENTRADA')}
            disabled={!puedeEntrada || procesando}
            className="btn-emerald flex-1 text-base py-4"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Marcar Entrada
          </button>

          <button
            onClick={() => setModalTipo('SALIDA')}
            disabled={!puedeSalida || procesando}
            className="btn-rose flex-1 text-base py-4"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            Marcar Salida
          </button>
        </div>

        {/* Textos de ayuda contextuales */}
        <div className="mt-3 min-h-[1.25rem]">
          {!puedeEntrada && !puedeSalida && registroHoy?.estado === 'COMPLETO' && (
            <p className="text-xs text-center text-slate-500">
              ✅ Turno completado hoy. ¡Hasta mañana!
            </p>
          )}
          {puedeSalida && (
            <p className="text-xs text-center text-slate-500">
              Ya tienes entrada registrada. Marca tu salida cuando termines.
            </p>
          )}
          {puedeEntrada && !puedeSalida && !registroHoy && (
            <p className="text-xs text-center text-slate-500">
              Registra tu entrada al comenzar tu jornada.
            </p>
          )}
        </div>
      </div>

      {/* ── Historial de registros ── */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          Historial de asistencia
          {registros.length > 0 && (
            <span className="ml-auto text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full border border-slate-600/30">
              {registros.length} {registros.length === 1 ? 'día' : 'días'}
            </span>
          )}
        </h2>

        {registros.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-slate-500 text-sm">Sin registros aún.</p>
            <p className="text-slate-600 text-xs mt-1">Los marcajes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registros.map((r) => (
              <FilaHistorial key={r.id} registro={r} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal de confirmación ── */}
      {modalTipo && (
        <ModalConfirmacion
          tipo={modalTipo}
          onConfirmar={confirmarMarcaje}
          onCancelar={() => setModalTipo(null)}
        />
      )}
    </div>
  )
}
