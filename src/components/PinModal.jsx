import { useState, useEffect } from 'react'

/**
 * PinModal — Componente reutilizable de PIN de 4 dígitos
 *
 * Props:
 *  - modo: 'establecer' | 'verificar'
 *      'establecer' → el practicante crea su PIN por primera vez (pide confirmación)
 *      'verificar'  → el practicante ingresa su PIN existente
 *  - nombre: string — nombre del practicante (para personalizar el texto)
 *  - onConfirmar: (pin: string) => void — se llama con el PIN cuando es correcto
 *  - onCancelar: () => void
 *  - errorExterno: string | null — mensaje de error desde el padre (PIN incorrecto)
 */
export default function PinModal({ modo, nombre, onConfirmar, onCancelar, errorExterno }) {
  const [paso, setPaso] = useState(1)          // 1 = ingresar, 2 = confirmar (solo en 'establecer')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [errorLocal, setErrorLocal] = useState(null)
  const [shake, setShake] = useState(false)

  // Limpiar error externo al empezar a escribir
  const errorVisible = errorLocal || errorExterno

  const pinActual = paso === 1 ? pin : pinConfirm
  const setPinActual = paso === 1 ? setPin : setPinConfirm

  // Animación de shake al recibir error externo
  useEffect(() => {
    if (errorExterno) {
      setShake(true)
      setPin('')
      setTimeout(() => setShake(false), 600)
    }
  }, [errorExterno])

  const handleTecla = (t) => {
    setErrorLocal(null)

    if (t === '←') {
      setPinActual((p) => p.slice(0, -1))
      return
    }

    if (t === '↵') {
      confirmar()
      return
    }

    if (pinActual.length < 4) {
      setPinActual((p) => p + t)
    }
  }

  // Cuando se completan 4 dígitos automáticamente avanza
  useEffect(() => {
    if (pinActual.length === 4) {
      // Pequeño delay para que el usuario vea el último punto
      const id = setTimeout(() => confirmar(), 300)
      return () => clearTimeout(id)
    }
  }, [pinActual]) // eslint-disable-line react-hooks/exhaustive-deps

  const confirmar = () => {
    if (modo === 'establecer') {
      if (paso === 1) {
        if (pin.length < 4) { setErrorLocal('Ingresa los 4 dígitos'); return }
        setPaso(2)
      } else {
        // Paso 2: confirmar
        if (pinConfirm.length < 4) { setErrorLocal('Ingresa los 4 dígitos'); return }
        if (pin !== pinConfirm) {
          setErrorLocal('Los PINs no coinciden. Intenta de nuevo.')
          setShake(true)
          setPinConfirm('')
          setTimeout(() => setShake(false), 600)
          return
        }
        onConfirmar(pin)
      }
    } else {
      // modo verificar
      if (pin.length < 4) { setErrorLocal('Ingresa los 4 dígitos'); return }
      onConfirmar(pin)
    }
  }

  const volverPaso1 = () => {
    setPaso(1)
    setPin('')
    setPinConfirm('')
    setErrorLocal(null)
  }

  // Teclas del teclado numérico
  const teclas = ['1','2','3','4','5','6','7','8','9','←','0','↵']

  // Textos según modo y paso
  const titulo = modo === 'establecer'
    ? paso === 1 ? 'Crea tu PIN' : 'Confirma tu PIN'
    : 'Ingresa tu PIN'

  const subtitulo = modo === 'establecer'
    ? paso === 1
      ? 'Elige un PIN de 4 dígitos. Lo usarás cada vez que marques asistencia.'
      : 'Vuelve a ingresar el PIN para confirmarlo.'
    : `Bienvenido, ${nombre?.split(' ')[0]}. Ingresa tu PIN para continuar.`

  const icono = modo === 'establecer' ? (
    <svg className="h-7 w-7 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
    </svg>
  ) : (
    <svg className="h-7 w-7 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  )

  return (
    <div className="modal-overlay animate-fade-in" onClick={onCancelar}>
      <div
        className={`card w-full max-w-xs p-7 text-center animate-slide-up ${shake ? '[animation:shake_0.5s_ease-in-out]' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícono */}
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2
          ${modo === 'establecer'
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-slate-700/50 border-slate-600/50'
          }`}
        >
          {icono}
        </div>

        {/* Textos */}
        <h2 className="text-lg font-bold text-slate-100 mb-1">{titulo}</h2>
        <p className="text-sm text-slate-400 mb-5 leading-relaxed">{subtitulo}</p>

        {/* Indicadores de dígitos */}
        <div className="flex justify-center gap-4 mb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-150
                ${i < pinActual.length
                  ? errorVisible
                    ? 'bg-red-500 border-red-500 scale-110'
                    : 'bg-emerald-400 border-emerald-400 scale-110'
                  : 'bg-transparent border-slate-600'
                }`}
            />
          ))}
        </div>

        {/* Error */}
        <div className="min-h-[1.25rem] mb-3">
          {errorVisible && (
            <p className="text-xs text-red-400 animate-fade-in">{errorVisible}</p>
          )}
        </div>

        {/* Teclado numérico */}
        <div className="grid grid-cols-3 gap-2">
          {teclas.map((t) => (
            <button
              key={t}
              onClick={() => handleTecla(t)}
              className={`h-12 rounded-xl text-lg font-semibold transition-all duration-150 active:scale-95 select-none
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

        {/* Progreso para modo establecer */}
        {modo === 'establecer' && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${paso >= 1 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${paso >= 2 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          </div>
        )}

        {/* Acciones secundarias */}
        <div className="mt-4 flex justify-center gap-4">
          {modo === 'establecer' && paso === 2 && (
            <button onClick={volverPaso1} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Volver
            </button>
          )}
          <button onClick={onCancelar} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Cancelar
          </button>
        </div>
      </div>

      {/* Animación shake */}
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
