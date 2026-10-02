/**
 * Avatar.jsx — Avatares ilustrados estilo Quizizz
 * 12 personajes SVG únicos asignados automáticamente por el ID del practicante.
 * Sin dependencias externas, funciona offline.
 */

// ─── Definición de los 12 personajes ──────────────────────────────────────
const PERSONAJES = [
  // 0 — Zorro
  {
    nombre: 'Zorro',
    bg: 'from-orange-500 to-amber-400',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orejas */}
        <polygon points="12,38 22,14 32,38" fill="#f97316" />
        <polygon points="48,38 58,14 68,38" fill="#f97316" />
        <polygon points="16,36 22,20 28,36" fill="#fde68a" />
        <polygon points="52,36 58,20 64,36" fill="#fde68a" />
        {/* Cabeza */}
        <ellipse cx="40" cy="46" rx="24" ry="22" fill="#f97316" />
        {/* Hocico */}
        <ellipse cx="40" cy="56" rx="12" ry="9" fill="#fde68a" />
        {/* Ojos */}
        <ellipse cx="32" cy="44" rx="5" ry="5.5" fill="white" />
        <ellipse cx="48" cy="44" rx="5" ry="5.5" fill="white" />
        <circle cx="33" cy="45" r="3" fill="#1e1b4b" />
        <circle cx="49" cy="45" r="3" fill="#1e1b4b" />
        <circle cx="34" cy="44" r="1" fill="white" />
        <circle cx="50" cy="44" r="1" fill="white" />
        {/* Nariz */}
        <ellipse cx="40" cy="53" rx="3" ry="2" fill="#7c2d12" />
        {/* Boca */}
        <path d="M36 57 Q40 61 44 57" stroke="#7c2d12" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Mejillas */}
        <ellipse cx="27" cy="52" rx="4" ry="2.5" fill="#fb923c" opacity="0.5" />
        <ellipse cx="53" cy="52" rx="4" ry="2.5" fill="#fb923c" opacity="0.5" />
      </svg>
    ),
  },
  // 1 — Oso Panda
  {
    nombre: 'Panda',
    bg: 'from-slate-200 to-slate-100',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orejas */}
        <circle cx="20" cy="26" r="11" fill="#1e1b4b" />
        <circle cx="60" cy="26" r="11" fill="#1e1b4b" />
        <circle cx="20" cy="26" r="7" fill="#312e81" />
        <circle cx="60" cy="26" r="7" fill="#312e81" />
        {/* Cabeza */}
        <ellipse cx="40" cy="46" rx="26" ry="24" fill="#f1f5f9" />
        {/* Parches ojos */}
        <ellipse cx="31" cy="41" rx="9" ry="8" fill="#1e1b4b" />
        <ellipse cx="49" cy="41" rx="9" ry="8" fill="#1e1b4b" />
        {/* Ojos */}
        <circle cx="31" cy="41" r="5" fill="white" />
        <circle cx="49" cy="41" r="5" fill="white" />
        <circle cx="32" cy="42" r="3" fill="#1e1b4b" />
        <circle cx="50" cy="42" r="3" fill="#1e1b4b" />
        <circle cx="33" cy="41" r="1" fill="white" />
        <circle cx="51" cy="41" r="1" fill="white" />
        {/* Hocico */}
        <ellipse cx="40" cy="54" rx="10" ry="7" fill="#e2e8f0" />
        <ellipse cx="40" cy="51" rx="3" ry="2" fill="#64748b" />
        <path d="M36 55 Q40 59 44 55" stroke="#64748b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Mejillas */}
        <ellipse cx="27" cy="52" rx="4" ry="2.5" fill="#fda4af" opacity="0.6" />
        <ellipse cx="53" cy="52" rx="4" ry="2.5" fill="#fda4af" opacity="0.6" />
      </svg>
    ),
  },
  // 2 — Gato
  {
    nombre: 'Gato',
    bg: 'from-purple-500 to-violet-600',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orejas puntiagudas */}
        <polygon points="18,42 24,18 34,40" fill="#a855f7" />
        <polygon points="46,40 56,18 62,42" fill="#a855f7" />
        <polygon points="21,40 24,24 31,40" fill="#f3e8ff" />
        <polygon points="49,40 56,24 59,40" fill="#f3e8ff" />
        {/* Cabeza */}
        <ellipse cx="40" cy="48" rx="24" ry="22" fill="#c084fc" />
        {/* Ojos */}
        <ellipse cx="32" cy="45" rx="6" ry="6" fill="white" />
        <ellipse cx="48" cy="45" rx="6" ry="6" fill="white" />
        {/* Pupilas rasgadas */}
        <ellipse cx="32" cy="45" rx="2.5" ry="5" fill="#1e1b4b" />
        <ellipse cx="48" cy="45" rx="2.5" ry="5" fill="#1e1b4b" />
        <circle cx="32" cy="43" r="1" fill="white" />
        <circle cx="48" cy="43" r="1" fill="white" />
        {/* Nariz */}
        <polygon points="40,53 37.5,57 42.5,57" fill="#ec4899" />
        {/* Bigotes */}
        <line x1="20" y1="55" x2="36" y2="57" stroke="#7e22ce" strokeWidth="1" opacity="0.7" />
        <line x1="20" y1="59" x2="36" y2="59" stroke="#7e22ce" strokeWidth="1" opacity="0.7" />
        <line x1="44" y1="57" x2="60" y2="55" stroke="#7e22ce" strokeWidth="1" opacity="0.7" />
        <line x1="44" y1="59" x2="60" y2="59" stroke="#7e22ce" strokeWidth="1" opacity="0.7" />
        {/* Boca */}
        <path d="M37 58 Q40 62 43 58" stroke="#7e22ce" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Mejillas */}
        <ellipse cx="27" cy="53" rx="4" ry="2.5" fill="#f0abfc" opacity="0.5" />
        <ellipse cx="53" cy="53" rx="4" ry="2.5" fill="#f0abfc" opacity="0.5" />
      </svg>
    ),
  },
  // 3 — Pingüino
  {
    nombre: 'Pingüino',
    bg: 'from-cyan-500 to-blue-600',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cabeza negra */}
        <ellipse cx="40" cy="44" rx="24" ry="24" fill="#1e1b4b" />
        {/* Panza blanca */}
        <ellipse cx="40" cy="52" rx="16" ry="16" fill="#e0f2fe" />
        {/* Ojos */}
        <circle cx="33" cy="40" r="6" fill="white" />
        <circle cx="47" cy="40" r="6" fill="white" />
        <circle cx="34" cy="41" r="3.5" fill="#1e1b4b" />
        <circle cx="48" cy="41" r="3.5" fill="#1e1b4b" />
        <circle cx="35" cy="40" r="1.2" fill="white" />
        <circle cx="49" cy="40" r="1.2" fill="white" />
        {/* Pico */}
        <polygon points="40,48 36,53 44,53" fill="#f59e0b" />
        {/* Mejillas */}
        <ellipse cx="27" cy="47" rx="4" ry="2.5" fill="#67e8f9" opacity="0.5" />
        <ellipse cx="53" cy="47" rx="4" ry="2.5" fill="#67e8f9" opacity="0.5" />
      </svg>
    ),
  },
  // 4 — León
  {
    nombre: 'León',
    bg: 'from-yellow-400 to-orange-500',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Melena */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a, i) => (
          <ellipse key={i} cx={40 + 26 * Math.cos((a * Math.PI) / 180)} cy={44 + 26 * Math.sin((a * Math.PI) / 180)}
            rx="7" ry="5" fill="#b45309"
            transform={`rotate(${a}, ${40 + 26 * Math.cos((a * Math.PI) / 180)}, ${44 + 26 * Math.sin((a * Math.PI) / 180)})`}
          />
        ))}
        {/* Cabeza */}
        <circle cx="40" cy="44" r="20" fill="#fbbf24" />
        {/* Hocico */}
        <ellipse cx="40" cy="54" rx="11" ry="8" fill="#fde68a" />
        {/* Ojos */}
        <ellipse cx="33" cy="42" rx="5" ry="5" fill="white" />
        <ellipse cx="47" cy="42" rx="5" ry="5" fill="white" />
        <circle cx="34" cy="43" r="3" fill="#713f12" />
        <circle cx="48" cy="43" r="3" fill="#713f12" />
        <circle cx="35" cy="42" r="1" fill="white" />
        <circle cx="49" cy="42" r="1" fill="white" />
        {/* Nariz */}
        <ellipse cx="40" cy="52" rx="3" ry="2" fill="#92400e" />
        {/* Boca */}
        <path d="M36 56 Q40 60 44 56" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Mejillas */}
        <ellipse cx="28" cy="51" rx="4" ry="2.5" fill="#f97316" opacity="0.4" />
        <ellipse cx="52" cy="51" rx="4" ry="2.5" fill="#f97316" opacity="0.4" />
      </svg>
    ),
  },
  // 5 — Conejo
  {
    nombre: 'Conejo',
    bg: 'from-pink-400 to-rose-500',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orejas largas */}
        <ellipse cx="30" cy="22" rx="7" ry="16" fill="#f9a8d4" />
        <ellipse cx="50" cy="22" rx="7" ry="16" fill="#f9a8d4" />
        <ellipse cx="30" cy="22" rx="4" ry="12" fill="#fce7f3" />
        <ellipse cx="50" cy="22" rx="4" ry="12" fill="#fce7f3" />
        {/* Cabeza */}
        <ellipse cx="40" cy="50" rx="22" ry="20" fill="#fce7f3" />
        {/* Ojos */}
        <circle cx="33" cy="47" r="5" fill="white" />
        <circle cx="47" cy="47" r="5" fill="white" />
        <circle cx="33" cy="47" r="3" fill="#be185d" />
        <circle cx="47" cy="47" r="3" fill="#be185d" />
        <circle cx="34" cy="46" r="1" fill="white" />
        <circle cx="48" cy="46" r="1" fill="white" />
        {/* Nariz */}
        <ellipse cx="40" cy="55" rx="2.5" ry="1.8" fill="#ec4899" />
        {/* Bigotes */}
        <line x1="22" y1="55" x2="37" y2="56" stroke="#f9a8d4" strokeWidth="1" />
        <line x1="43" y1="56" x2="58" y2="55" stroke="#f9a8d4" strokeWidth="1" />
        {/* Boca */}
        <path d="M37 57 Q40 61 43 57" stroke="#be185d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Mejillas */}
        <ellipse cx="27" cy="53" rx="4" ry="2.5" fill="#f9a8d4" opacity="0.6" />
        <ellipse cx="53" cy="53" rx="4" ry="2.5" fill="#f9a8d4" opacity="0.6" />
      </svg>
    ),
  },
  // 6 — Pantera
  {
    nombre: 'Pantera',
    bg: 'from-slate-800 to-zinc-900',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orejas puntiagudas */}
        <polygon points="18,42 24,16 35,40" fill="#1c1917" />
        <polygon points="45,40 56,16 62,42" fill="#1c1917" />
        <polygon points="22,40 26,22 33,40" fill="#a855f7" opacity="0.4" />
        <polygon points="47,40 54,22 58,40" fill="#a855f7" opacity="0.4" />
        {/* Cabeza negra brillante */}
        <ellipse cx="40" cy="48" rx="25" ry="23" fill="#18181b" />
        {/* Reflejo sutil en la frente */}
        <ellipse cx="36" cy="34" rx="8" ry="4" fill="#3f3f46" opacity="0.4" transform="rotate(-20,36,34)" />
        {/* Hocico */}
        <ellipse cx="40" cy="57" rx="12" ry="8" fill="#27272a" />
        {/* Ojos — iris violeta brillante */}
        <ellipse cx="32" cy="45" rx="6.5" ry="6.5" fill="#09090b" />
        <ellipse cx="48" cy="45" rx="6.5" ry="6.5" fill="#09090b" />
        <ellipse cx="32" cy="45" rx="5" ry="5" fill="#7c3aed" />
        <ellipse cx="48" cy="45" rx="5" ry="5" fill="#7c3aed" />
        {/* Pupila rasgada */}
        <ellipse cx="32" cy="45" rx="2" ry="4.5" fill="#09090b" />
        <ellipse cx="48" cy="45" rx="2" ry="4.5" fill="#09090b" />
        {/* Brillo */}
        <circle cx="30" cy="43" r="1.5" fill="white" opacity="0.9" />
        <circle cx="46" cy="43" r="1.5" fill="white" opacity="0.9" />
        <circle cx="34" cy="47" r="0.7" fill="white" opacity="0.5" />
        <circle cx="50" cy="47" r="0.7" fill="white" opacity="0.5" />
        {/* Nariz */}
        <ellipse cx="40" cy="54" rx="3.5" ry="2.5" fill="#52525b" />
        {/* Bigotes */}
        <line x1="18" y1="56" x2="36" y2="57" stroke="#52525b" strokeWidth="1.2" />
        <line x1="18" y1="60" x2="36" y2="59" stroke="#52525b" strokeWidth="1.2" />
        <line x1="44" y1="57" x2="62" y2="56" stroke="#52525b" strokeWidth="1.2" />
        <line x1="44" y1="59" x2="62" y2="60" stroke="#52525b" strokeWidth="1.2" />
        {/* Boca */}
        <path d="M37 58 Q40 62 43 58" stroke="#52525b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Manchas de jaguar sutiles */}
        <ellipse cx="27" cy="50" rx="3.5" ry="2.5" fill="#27272a" opacity="0.8" />
        <ellipse cx="53" cy="50" rx="3.5" ry="2.5" fill="#27272a" opacity="0.8" />
        {/* Brillo violeta en mejillas */}
        <ellipse cx="26" cy="53" rx="4" ry="2.5" fill="#7c3aed" opacity="0.15" />
        <ellipse cx="54" cy="53" rx="4" ry="2.5" fill="#7c3aed" opacity="0.15" />
      </svg>
    ),
  },
  // 7 — Búho
  {
    nombre: 'Búho',
    bg: 'from-indigo-500 to-violet-700',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orejas/plumas */}
        <polygon points="26,36 30,20 36,36" fill="#4338ca" />
        <polygon points="44,36 50,20 54,36" fill="#4338ca" />
        {/* Cabeza */}
        <ellipse cx="40" cy="48" rx="24" ry="22" fill="#6366f1" />
        {/* Disco facial */}
        <ellipse cx="40" cy="50" rx="19" ry="17" fill="#e0e7ff" />
        {/* Ojos grandes */}
        <circle cx="32" cy="46" r="9" fill="#fbbf24" />
        <circle cx="48" cy="46" r="9" fill="#fbbf24" />
        <circle cx="32" cy="46" r="6" fill="#1e1b4b" />
        <circle cx="48" cy="46" r="6" fill="#1e1b4b" />
        <circle cx="30" cy="44" r="2" fill="white" />
        <circle cx="46" cy="44" r="2" fill="white" />
        {/* Pico */}
        <polygon points="40,52 37,57 43,57" fill="#f59e0b" />
        {/* Mejillas */}
        <ellipse cx="25" cy="53" rx="4" ry="2.5" fill="#a5b4fc" opacity="0.5" />
        <ellipse cx="55" cy="53" rx="4" ry="2.5" fill="#a5b4fc" opacity="0.5" />
      </svg>
    ),
  },
  // 8 — Oso polar
  {
    nombre: 'Oso',
    bg: 'from-sky-300 to-blue-400',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orejas */}
        <circle cx="22" cy="28" r="10" fill="#e0f2fe" />
        <circle cx="58" cy="28" r="10" fill="#e0f2fe" />
        <circle cx="22" cy="28" r="6" fill="#bae6fd" />
        <circle cx="58" cy="28" r="6" fill="#bae6fd" />
        {/* Cabeza */}
        <ellipse cx="40" cy="48" rx="26" ry="24" fill="#f0f9ff" />
        {/* Hocico */}
        <ellipse cx="40" cy="57" rx="12" ry="9" fill="#e0f2fe" />
        {/* Ojos */}
        <circle cx="32" cy="44" r="5.5" fill="white" />
        <circle cx="48" cy="44" r="5.5" fill="white" />
        <circle cx="32" cy="44" r="3.5" fill="#0c4a6e" />
        <circle cx="48" cy="44" r="3.5" fill="#0c4a6e" />
        <circle cx="33" cy="43" r="1.2" fill="white" />
        <circle cx="49" cy="43" r="1.2" fill="white" />
        {/* Nariz */}
        <ellipse cx="40" cy="54" rx="3.5" ry="2.5" fill="#0369a1" />
        {/* Boca */}
        <path d="M36 58 Q40 63 44 58" stroke="#0369a1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Mejillas */}
        <ellipse cx="27" cy="52" rx="4.5" ry="3" fill="#7dd3fc" opacity="0.5" />
        <ellipse cx="53" cy="52" rx="4.5" ry="3" fill="#7dd3fc" opacity="0.5" />
      </svg>
    ),
  },
  // 9 — Dragón
  {
    nombre: 'Dragón',
    bg: 'from-red-500 to-rose-700',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cuernos */}
        <polygon points="28,36 24,16 34,34" fill="#dc2626" />
        <polygon points="52,34 46,16 56,36" fill="#dc2626" />
        <polygon points="29,34 26,22 33,34" fill="#fca5a5" />
        <polygon points="51,34 47,22 54,34" fill="#fca5a5" />
        {/* Cabeza */}
        <ellipse cx="40" cy="48" rx="24" ry="22" fill="#ef4444" />
        {/* Escamas frente */}
        <ellipse cx="40" cy="32" rx="8" ry="5" fill="#dc2626" />
        {/* Ojos */}
        <ellipse cx="32" cy="44" rx="6" ry="6" fill="#fef08a" />
        <ellipse cx="48" cy="44" rx="6" ry="6" fill="#fef08a" />
        <ellipse cx="32" cy="44" rx="2.5" ry="5" fill="#1e1b4b" />
        <ellipse cx="48" cy="44" rx="2.5" ry="5" fill="#1e1b4b" />
        <circle cx="32" cy="42" r="1" fill="white" />
        <circle cx="48" cy="42" r="1" fill="white" />
        {/* Nariz */}
        <ellipse cx="37" cy="54" rx="2" ry="1.5" fill="#7f1d1d" />
        <ellipse cx="43" cy="54" rx="2" ry="1.5" fill="#7f1d1d" />
        {/* Boca/colmillos */}
        <path d="M33 58 Q40 64 47 58" stroke="#7f1d1d" strokeWidth="2" fill="none" strokeLinecap="round" />
        <polygon points="36,58 34,63 38,63" fill="white" />
        <polygon points="44,58 42,63 46,63" fill="white" />
        {/* Mejillas */}
        <ellipse cx="26" cy="52" rx="4" ry="2.5" fill="#fca5a5" opacity="0.5" />
        <ellipse cx="54" cy="52" rx="4" ry="2.5" fill="#fca5a5" opacity="0.5" />
      </svg>
    ),
  },
  // 10 — Koala
  {
    nombre: 'Koala',
    bg: 'from-slate-400 to-zinc-500',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Orejas grandes peludas */}
        <circle cx="18" cy="32" r="14" fill="#94a3b8" />
        <circle cx="62" cy="32" r="14" fill="#94a3b8" />
        <circle cx="18" cy="32" r="9" fill="#cbd5e1" />
        <circle cx="62" cy="32" r="9" fill="#cbd5e1" />
        <circle cx="18" cy="32" r="5" fill="#e2e8f0" />
        <circle cx="62" cy="32" r="5" fill="#e2e8f0" />
        {/* Cabeza */}
        <ellipse cx="40" cy="50" rx="24" ry="22" fill="#94a3b8" />
        {/* Hocico grande */}
        <ellipse cx="40" cy="57" rx="13" ry="9" fill="#475569" />
        <ellipse cx="40" cy="54" rx="9" ry="6" fill="#64748b" />
        {/* Ojos */}
        <circle cx="32" cy="45" r="6" fill="white" />
        <circle cx="48" cy="45" r="6" fill="white" />
        <circle cx="32" cy="46" r="3.5" fill="#1e293b" />
        <circle cx="48" cy="46" r="3.5" fill="#1e293b" />
        <circle cx="33" cy="45" r="1.2" fill="white" />
        <circle cx="49" cy="45" r="1.2" fill="white" />
        {/* Nariz grande */}
        <ellipse cx="40" cy="53" rx="5" ry="3.5" fill="#1e293b" />
        {/* Mejillas */}
        <ellipse cx="26" cy="53" rx="5" ry="3" fill="#cbd5e1" opacity="0.5" />
        <ellipse cx="54" cy="53" rx="5" ry="3" fill="#cbd5e1" opacity="0.5" />
      </svg>
    ),
  },
  // 11 — Unicornio
  {
    nombre: 'Unicornio',
    bg: 'from-fuchsia-400 to-pink-600',
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cuerno */}
        <polygon points="40,8 36,30 44,30" fill="#fbbf24" />
        <polygon points="40,8 37,25 40,22" fill="#f59e0b" />
        {/* Crin colorida */}
        <ellipse cx="54" cy="28" rx="8" ry="14" fill="#f472b6" transform="rotate(-20, 54, 28)" />
        <ellipse cx="58" cy="32" rx="6" ry="12" fill="#a78bfa" transform="rotate(-15, 58, 32)" />
        <ellipse cx="60" cy="38" rx="5" ry="10" fill="#34d399" transform="rotate(-10, 60, 38)" />
        {/* Orejas */}
        <polygon points="24,38 28,20 34,38" fill="#f9a8d4" />
        <polygon points="27,37 28,25 33,37" fill="#fce7f3" />
        {/* Cabeza */}
        <ellipse cx="40" cy="50" rx="24" ry="22" fill="#fce7f3" />
        {/* Ojos */}
        <ellipse cx="33" cy="46" rx="5.5" ry="6" fill="white" />
        <ellipse cx="47" cy="46" rx="5.5" ry="6" fill="white" />
        <ellipse cx="33" cy="47" rx="3.5" ry="4.5" fill="#7c3aed" />
        <ellipse cx="47" cy="47" rx="3.5" ry="4.5" fill="#7c3aed" />
        <circle cx="32" cy="45" r="1.2" fill="white" />
        <circle cx="46" cy="45" r="1.2" fill="white" />
        {/* Nariz */}
        <ellipse cx="40" cy="55" rx="3" ry="2" fill="#f472b6" />
        {/* Boca */}
        <path d="M36 58 Q40 62 44 58" stroke="#ec4899" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Mejillas con estrellas */}
        <ellipse cx="27" cy="53" rx="4.5" ry="3" fill="#f9a8d4" opacity="0.6" />
        <ellipse cx="53" cy="53" rx="4.5" ry="3" fill="#f9a8d4" opacity="0.6" />
        <text x="25" y="55" fontSize="5" textAnchor="middle" fill="#ec4899">✦</text>
        <text x="55" y="55" fontSize="5" textAnchor="middle" fill="#ec4899">✦</text>
      </svg>
    ),
  },
]

// ─── Función para asignar personaje por ÍNDICE (sin duplicados) ────────────
// El índice viene de la posición del practicante en la lista ordenada.
// Los primeros 12 tienen personaje único. A partir del 13 se reutilizan.
function getPersonajePorIndice(indice) {
  return PERSONAJES[indice % PERSONAJES.length]
}

// Mantener el hash como fallback si no se pasa índice
function getPersonaje(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  }
  return PERSONAJES[Math.abs(hash) % PERSONAJES.length]
}

// ─── Componente Avatar ─────────────────────────────────────────────────────
/**
 * Props:
 *  - id: string       — ID del practicante (fallback si no hay índice)
 *  - index: number    — posición en la lista (preferido, evita duplicados)
 *  - size: 'sm' | 'md' | 'lg' | 'xl'
 *  - className: string
 */
export default function Avatar({ id = '', index = null, size = 'md', className = '' }) {
  const personaje = index !== null ? getPersonajePorIndice(index) : getPersonaje(id)

  const sizes = {
    sm:  'h-10 w-10 rounded-xl',
    md:  'h-14 w-14 rounded-2xl',
    lg:  'h-20 w-20 rounded-2xl',
    xl:  'h-28 w-28 rounded-3xl',
  }

  const paddings = {
    sm:  'p-1',
    md:  'p-1.5',
    lg:  'p-2',
    xl:  'p-3',
  }

  return (
    <div
      className={`
        flex-shrink-0 bg-gradient-to-br ${personaje.bg}
        ${sizes[size]} ${paddings[size]}
        shadow-lg overflow-hidden
        ${className}
      `}
      title={personaje.nombre}
    >
      {personaje.svg}
    </div>
  )
}

// Exportar helper para uso externo
export { getPersonaje }
