import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { CheckCircle2, HelpCircle, Sparkles, GlassWater, ArrowRight, XCircle } from 'lucide-react'

interface AlgorithmTheoryScreenProps {
  onAddScore: (points: number) => void
  onComplete: () => void
}

const JUICE_STEPS = [
  { step: 1, text: 'Tomar un vaso.', icon: '🥛' },
  { step: 2, text: 'Agregar agua.', icon: '💧' },
  { step: 3, text: 'Agregar jugo concentrado o polvo.', icon: '🍊' },
  { step: 4, text: 'Mezclar con una cuchara.', icon: '🥄' },
  { step: 5, text: 'Servir y disfrutar.', icon: '🍹' },
]

export const AlgorithmTheoryScreen: React.FC<AlgorithmTheoryScreenProps> = ({
  onAddScore,
  onComplete,
}) => {
  const [userAnswer, setUserAnswer] = useState<'SI' | 'NO' | null>(null)
  const [hasScored, setHasScored] = useState(false)
  const [activeStepSimulation, setActiveStepSimulation] = useState<number>(0)
  const [simulating, setSimulating] = useState(false)

  const handleAnswer = (ans: 'SI' | 'NO') => {
    setUserAnswer(ans)
    if (ans === 'SI') {
      sound.playSuccess()
      if (!hasScored) {
        onAddScore(5)
        setHasScored(true)
      }
    } else {
      sound.playError()
    }
  }

  const runSimulation = () => {
    if (simulating) return
    setSimulating(true)
    setActiveStepSimulation(1)
    sound.playStep()

    const interval = setInterval(() => {
      setActiveStepSimulation((prev) => {
        if (prev >= JUICE_STEPS.length) {
          clearInterval(interval)
          setSimulating(false)
          sound.playSuccess()
          return JUICE_STEPS.length
        }
        sound.playStep()
        return prev + 1
      })
    }, 700)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Concepto Fundamental
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          ¿Qué es un Algoritmo?
        </h2>
      </div>

      {/* Main Definition Card */}
      <div className="w-full p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)] mb-6 text-center">
        <blockquote className="text-lg sm:text-2xl font-semibold text-slate-100 max-w-2xl mx-auto leading-relaxed">
          “Un <span className="text-cyan-400 font-extrabold">algoritmo</span> es una serie de{' '}
          <span className="text-indigo-300 font-bold underline decoration-cyan-400">pasos ordenados</span>{' '}
          que seguimos para resolver un problema o alcanzar un objetivo.”
        </blockquote>
      </div>

      {/* Everyday Example: Juice */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
        <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <GlassWater className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-200 text-sm">
                Ejemplo Cotidiano: Preparar un vaso de jugo
              </h3>
            </div>
            <button
              onClick={runSimulation}
              disabled={simulating}
              className="px-2.5 py-1 text-xs font-mono bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 cursor-pointer"
            >
              {simulating ? 'Ejecutando...' : '▶ Probar pasos'}
            </button>
          </div>

          <div className="space-y-2">
            {JUICE_STEPS.map((s) => {
              const isCurrent = activeStepSimulation === s.step
              const isPassed = activeStepSimulation > s.step

              return (
                <div
                  key={s.step}
                  className={`flex items-center gap-3 p-2.5 rounded-xl text-sm transition-all ${
                    isCurrent
                      ? 'bg-amber-500/20 border border-amber-500/50 text-white font-medium scale-[1.02]'
                      : isPassed
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-slate-950/50 border border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono text-xs font-bold shrink-0 text-cyan-400">
                    {s.step}
                  </span>
                  <span className="text-lg">{s.icon}</span>
                  <span className="flex-1">{s.text}</span>
                  {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Interactive Question Panel */}
        <div className="md:col-span-5 flex flex-col justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2 font-semibold">
              <HelpCircle className="w-4 h-4" />
              Pregunta de verificación
            </div>
            <h4 className="text-lg font-bold text-white mb-4">
              ¿Esto podría considerarse un algoritmo?
            </h4>

            {/* Answer buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => handleAnswer('SI')}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  userAnswer === 'SI'
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                [ SÍ ]
              </button>
              <button
                onClick={() => handleAnswer('NO')}
                className={`py-3 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  userAnswer === 'NO'
                    ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                [ NO ]
              </button>
            </div>
          </div>

          {/* Feedback Box */}
          {userAnswer && (
            <div
              className={`p-3.5 rounded-xl text-sm border animate-in fade-in duration-200 ${
                userAnswer === 'SI'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {userAnswer === 'SI' ? (
                <div>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>¡Exacto!</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Hay un <span className="font-bold">objetivo claro</span> y una <span className="font-bold">serie ordenada de pasos</span> consecutivos. ¡Eso es exactamente un algoritmo!
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Pensalo un segundo:</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    Aunque sea de la vida diaria, tiene un objetivo y pasos que no podés alterar sin alterar el resultado. ¡Por lo tanto, sí es un algoritmo!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Proceed */}
      {userAnswer === 'SI' && (
        <button
          onClick={() => {
            sound.playClick()
            onComplete()
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
        >
          <span>Siguiente Concepto: La Precisión</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
