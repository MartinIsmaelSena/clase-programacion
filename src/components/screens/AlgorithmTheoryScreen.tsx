import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { CheckCircle2, Sparkles, GlassWater, ArrowRight, ArrowUp, ArrowDown, Play, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'

interface AlgorithmTheoryScreenProps {
  onAddScore: (points: number) => void
  onComplete: () => void
}

interface JuiceStep {
  id: string
  text: string
  icon: string
  correctOrder: number
}

const SHUFFLED_JUICE_STEPS: JuiceStep[] = [
  { id: 'jugo', text: 'Agregar jugo concentrado o polvo.', icon: '🍊', correctOrder: 3 },
  { id: 'servir', text: 'Servir y disfrutar.', icon: '🍹', correctOrder: 5 },
  { id: 'vaso', text: 'Tomar un vaso.', icon: '🥛', correctOrder: 1 },
  { id: 'mezclar', text: 'Mezclar con una cuchara.', icon: '🥄', correctOrder: 4 },
  { id: 'agua', text: 'Agregar agua.', icon: '💧', correctOrder: 2 },
]

export const AlgorithmTheoryScreen: React.FC<AlgorithmTheoryScreenProps> = ({
  onAddScore,
  onComplete,
}) => {
  const [steps, setSteps] = useState<JuiceStep[]>(() => [...SHUFFLED_JUICE_STEPS])
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [isOrdered, setIsOrdered] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [hasScored, setHasScored] = useState(false)
  const [activeStepSimulation, setActiveStepSimulation] = useState<number>(0)
  const [simulating, setSimulating] = useState(false)

  const moveStep = (index: number, direction: 'up' | 'down') => {
    sound.playClick()
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= steps.length) return
    const updated = [...steps]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setSteps(updated)
    setIsOrdered(false)
    setErrorMessage(null)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    sound.playClick()
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === index) return
    const updated = [...steps]
    const item = updated[draggedIdx]
    updated.splice(draggedIdx, 1)
    updated.splice(index, 0, item)
    setDraggedIdx(index)
    setSteps(updated)
    setIsOrdered(false)
    setErrorMessage(null)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
  }

  const handleReset = () => {
    sound.playClick()
    setSteps([...SHUFFLED_JUICE_STEPS])
    setIsOrdered(false)
    setErrorMessage(null)
    setActiveStepSimulation(0)
  }

  const handleVerifyAlgorithm = () => {
    const isCorrect = steps.every((s, idx) => s.correctOrder === idx + 1)
    if (isCorrect) {
      sound.playSuccess()
      setIsOrdered(true)
      setErrorMessage(null)
      if (!hasScored) {
        onAddScore(5)
        setHasScored(true)
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })
      runSimulation()
    } else {
      sound.playError()
      setIsOrdered(false)
      // Specific diagnostic
      if (steps[0].id !== 'vaso') {
        setErrorMessage('¡Primero necesitás tener el vaso antes de agregar ingredientes!')
      } else if (steps[steps.length - 1].id !== 'servir') {
        setErrorMessage('El paso de servir debe ir al final, cuando el jugo ya esté listo.')
      } else {
        setErrorMessage('Casi lo tenés. Pensá el orden natural: vaso, agua, jugo, mezclar y servir.')
      }
    }
  }

  const runSimulation = () => {
    if (simulating) return
    setSimulating(true)
    setActiveStepSimulation(1)
    sound.playStep()

    const interval = setInterval(() => {
      setActiveStepSimulation((prev) => {
        if (prev >= steps.length) {
          clearInterval(interval)
          setSimulating(false)
          sound.playSuccess()
          return steps.length
        }
        sound.playStep()
        return prev + 1
      })
    }, 600)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-5">
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

      {/* Interactive Activity: Order the Juice Steps */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GlassWater className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-slate-200 text-sm sm:text-base">
                Ejemplo Cotidiano: Preparar un vaso de jugo
              </h3>
              <p className="text-xs text-slate-400">
                Las instrucciones están desordenadas. Arrastralas o usá las flechas para colocarlas en el orden lógico.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mezclar de nuevo</span>
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-2 mb-4">
          {steps.map((s, idx) => {
            const isCurrentSim = activeStepSimulation === idx + 1
            const isPassedSim = activeStepSimulation > idx + 1

            return (
              <div
                key={s.id}
                draggable={!isOrdered}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all select-none ${
                  isCurrentSim
                    ? 'bg-amber-500/20 border-amber-400 scale-[1.01] shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : isPassedSim
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : isOrdered
                    ? 'bg-slate-950/70 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
                    {idx + 1}
                  </span>
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-sm font-medium">{s.text}</span>
                </div>

                {!isOrdered && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveStep(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Subir"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveStep(idx, 'down')}
                      disabled={idx === steps.length - 1}
                      className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Bajar"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {isOrdered && isPassedSim && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>
            )
          })}
        </div>

        {/* Verification result & feedback */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
            ⚠️ {errorMessage}
          </div>
        )}

        {isOrdered && (
          <div className="p-4 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-sm animate-in fade-in flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-base text-emerald-300">
                🎉 ¡Acabás de construir un algoritmo!
              </p>
              <p className="text-xs text-emerald-200/90 mt-1">
                Tenías un objetivo concreto (preparar el jugo) y estableciste una secuencia ordenada de pasos sin ambigüedades. ¡Eso es exactamente la base de la programación!
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400">
            {isOrdered ? 'Secuencia verificada' : 'Ordená todos los pasos y comprobá'}
          </span>

          {!isOrdered ? (
            <button
              onClick={handleVerifyAlgorithm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>COMPROBAR ORDEN</span>
            </button>
          ) : (
            <button
              onClick={runSimulation}
              disabled={simulating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-slate-200" />
              <span>{simulating ? 'Simulando...' : 'Volver a simular'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Proceed */}
      {isOrdered && (
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
