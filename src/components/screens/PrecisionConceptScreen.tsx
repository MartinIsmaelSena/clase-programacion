import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { AlertCircle, CheckCircle2, Cpu, ArrowRight, Layers } from 'lucide-react'

interface PrecisionConceptProps {
  onAddScore: (points: number) => void
  onComplete: () => void
}

const PRECISE_PIZZA_STEPS = [
  { num: 1, text: 'Preparar la masa.', tag: 'Base' },
  { num: 2, text: 'Colocar salsa.', tag: 'Sabor' },
  { num: 3, text: 'Agregar queso.', tag: 'Relleno' },
  { num: 4, text: 'Agregar ingredientes.', tag: 'Detalle' },
  { num: 5, text: 'Cocinar en horno a 220°C por 15 min.', tag: 'Ejecución' },
  { num: 6, text: 'Empaquetar o servir en porciones.', tag: 'Salida' },
]

export const PrecisionConceptScreen: React.FC<PrecisionConceptProps> = ({
  onAddScore,
  onComplete,
}) => {
  const [answered, setAnswered] = useState<'SI' | 'NO' | null>(null)
  const [hasScored, setHasScored] = useState(false)

  const handleSelect = (choice: 'SI' | 'NO') => {
    setAnswered(choice)
    if (choice === 'NO') {
      sound.playSuccess()
      if (!hasScored) {
        onAddScore(5)
        setHasScored(true)
      }
    } else {
      sound.playError()
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
          <Cpu className="w-3.5 h-3.5" />
          Regla de Oro en Computación
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          LA COMPUTADORA NO ADIVINA
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-1">
          La diferencia entre el lenguaje humano y el rigor algorítmico.
        </p>
      </div>

      {/* Ambiguity Test Card */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
              🍕
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                Instrucción cotidiana
              </span>
              <p className="text-2xl font-bold text-white italic">
                “Prepará una pizza.”
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-xs text-slate-400 font-medium block mb-2">
              ¿Es suficientemente precisa para una máquina?
            </span>
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <button
                onClick={() => handleSelect('SI')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  answered === 'SI'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                [ SÍ ]
              </button>
              <button
                onClick={() => handleSelect('NO')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  answered === 'NO'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                [ NO ]
              </button>
            </div>
          </div>
        </div>

        {/* Feedback on answer */}
        {answered && (
          <div className="mt-4 p-4 rounded-xl text-sm border animate-in fade-in duration-200">
            {answered === 'NO' ? (
              <div className="flex items-start gap-3 text-emerald-300">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <p className="font-bold text-base text-emerald-200">
                    ¡Exacto! Una computadora necesita instrucciones claras, detalladas y ordenadas.
                  </p>
                  <p className="text-xs text-emerald-300/80 mt-1">
                    Los humanos asumimos presupuestos (dónde están los ingredientes, qué temperatura usar). Una computadora no tiene intuición ni sentido común.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <p className="font-bold text-base text-rose-200">
                    Para un ser humano sí, pero para una computadora es totalmente ambigua.
                  </p>
                  <p className="text-xs text-rose-300/80 mt-1">
                    La máquina no sabe qué ingredientes usar, cómo amasar ni cuándo sacarla del horno. ¡Fallaría inmediatamente!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Comparison: Ambiguous vs Precise */}
      {answered === 'NO' && (
        <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 mb-6 animate-in fade-in slide-in-from-bottom-3 duration-300 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono">
              La versión algorítmica precisa:
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {PRECISE_PIZZA_STEPS.map((s) => (
              <div
                key={s.num}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 hover:border-cyan-500/40 transition-colors"
              >
                <span className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                  {s.num}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-200">{s.text}</p>
                  <span className="text-[10px] font-mono text-slate-400">{s.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-300 font-medium">
              ✨ <span className="text-cyan-400 font-bold">Regla fundamental:</span> Cada paso debe ser inequívoco y no dejar lugar a la improvisación.
            </p>
          </div>
        </div>
      )}

      {/* Proceed */}
      {answered === 'NO' && (
        <button
          onClick={() => {
            sound.playClick()
            onComplete()
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
        >
          <span>Paso a la Práctica: Ahora te Toca a Vos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
