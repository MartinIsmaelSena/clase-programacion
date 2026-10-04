import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { Bug, Search, Wrench, CheckCircle2, ArrowRight, AlertOctagon } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ChallengeDebugProps {
  onAddScore: (points: number) => void
  onComplete: () => void
}

const BUGGY_STEPS = [
  { id: 1, name: 'RECIBIR TARJETA', isBug: false, desc: 'El sensor detecta la presencia de la tarjeta.' },
  { id: 2, name: 'PERMITIR ACCESO', isBug: true, desc: 'Se abre el molinete antes de comprobar credenciales.' },
  { id: 3, name: 'VERIFICAR TARJETA', isBug: false, desc: 'Se consulta si el estudiante está matriculado.' },
]

export const ChallengeDebugScreen: React.FC<ChallengeDebugProps> = ({
  onAddScore,
  onComplete,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null)
  const [isBugFound, setIsBugFound] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [hasScored, setHasScored] = useState(false)

  const handleSelectStep = (stepId: number) => {
    setSelectedStepId(stepId)
    if (stepId === 2) {
      sound.playSuccess()
      setIsBugFound(true)
      if (!hasScored) {
        onAddScore(10)
        setHasScored(true)
      }
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } })
    } else {
      sound.playError()
      setIsBugFound(false)
    }
  }

  const handleFixAndRetest = () => {
    sound.playSuccess()
    setIsFixed(true)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-2">
          <Bug className="w-3.5 h-3.5" />
          Desafío 2: Detección y Depuración (+10 pts)
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          DESAFÍO 2: Rompé el Programa
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto mt-1">
          Un programador descuidado dejó un error grave en este algoritmo.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Buggy Flow Column */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              Algoritmo en Ejecución
            </span>
            <span className="text-xs font-mono text-amber-400">
              ¿Dónde está el error?
            </span>
          </div>

          <div className="space-y-3">
            {(isFixed
              ? [
                  { id: 1, name: '1. RECIBIR TARJETA', isBug: false, fixed: true },
                  { id: 3, name: '2. VERIFICAR TARJETA', isBug: false, fixed: true },
                  { id: 2, name: '3. PERMITIR ACCESO', isBug: false, fixed: true },
                ]
              : BUGGY_STEPS
            ).map((step, idx) => {
              const isSelected = selectedStepId === step.id
              const isError = !isFixed && isSelected && !step.isBug
              const isTargetBug = !isFixed && isSelected && step.isBug

              return (
                <div key={step.id} className="relative">
                  <button
                    onClick={() => !isFixed && handleSelectStep(step.id)}
                    disabled={isFixed}
                    className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isFixed
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : isTargetBug
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                        : isError
                        ? 'bg-slate-900 border-amber-500/50 text-slate-300'
                        : 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/50 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
                        0{idx + 1}
                      </span>
                      <div>
                        <span className="font-mono font-bold text-sm tracking-wide block">
                          {step.name}
                        </span>
                        {!isFixed && isTargetBug && (
                          <span className="text-[11px] text-rose-400 font-sans font-medium">
                            ⚠️ ¡Este paso ejecuta la acción antes de tiempo!
                          </span>
                        )}
                      </div>
                    </div>

                    {!isFixed && (
                      <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                        {isSelected ? (isTargetBug ? 'BUG DETECTADO' : 'PASO OK') : 'Elegir'}
                      </span>
                    )}

                    {isFixed && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  </button>

                  {idx < 2 && (
                    <div className="w-0.5 h-3 bg-slate-800 mx-auto my-0.5" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Feedback prompt */}
          {!isBugFound && !isFixed && (
            <p className="mt-4 text-xs text-center text-slate-400 italic">
              Hacé clic sobre el bloque que contiene la falla lógica fundamental.
            </p>
          )}

          {isBugFound && !isFixed && (
            <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <button
                onClick={handleFixAndRetest}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                <Wrench className="w-4 h-4" />
                <span>CORREGIR SECUENCIA Y VOLVER A PROBAR</span>
              </button>
            </div>
          )}
        </div>

        {/* Diagnostic & Pedagogical Theory Column: DEPURAR */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Debug explanation card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Concepto de Depuración (Debugging)
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              ¿QUÉ SIGNIFICA DEPURAR?
            </h3>

            <blockquote className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs sm:text-sm italic leading-relaxed mb-4">
              “<span className="text-cyan-300 font-bold">Depurar</span> significa encontrar y corregir errores en un algoritmo o programa antes de que causen daños o resultados inesperados.”
            </blockquote>

            {/* Debug Cycle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                El Ciclo de Corrección:
              </span>
              <div className="flex items-center justify-between text-center gap-1 text-[11px] font-mono font-bold">
                <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  ERROR
                </span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DETECTAR
                </span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  CORREGIR
                </span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PROBAR
                </span>
              </div>
            </div>

            {/* Found Message */}
            {isBugFound && !isFixed && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed animate-in fade-in duration-200">
                <p className="font-bold text-sm text-rose-300 mb-1 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  🔎 ¡Encontraste el error!
                </p>
                El sistema abrió el molinete en el paso 2 <span className="underline font-semibold">antes</span> de verificar si la tarjeta era válida en el paso 3. ¡Cualquiera podía entrar!
              </div>
            )}

            {isFixed && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs leading-relaxed animate-in fade-in duration-200">
                <p className="font-bold text-sm text-emerald-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ✅ ¡Algoritmo depurado con éxito!
                </p>
                Invertimos el orden: ahora se verifica primero y se permite el acceso al final. ¡El programa es seguro!
              </div>
            )}
          </div>

          {/* Continue button */}
          {isFixed && (
            <button
              onClick={() => {
                sound.playClick()
                onComplete()
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer transition-all"
            >
              <span>IR AL DESAFÍO 3: SISTEMA DE ACCESO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
