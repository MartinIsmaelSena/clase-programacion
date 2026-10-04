import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { ChevronRight, MessageSquareText, Compass, ArrowRight } from 'lucide-react'

interface IntroQuestionsScreenProps {
  onComplete: () => void
}

export const IntroQuestionsScreen: React.FC<IntroQuestionsScreenProps> = ({ onComplete }) => {
  // Step 1: Question 1, Step 2: Question 2, Step 3: Question 3
  const [revealedCount, setRevealedCount] = useState<number>(1)

  const handleNextQuestion = () => {
    sound.playStep()
    setRevealedCount((prev) => Math.min(prev + 1, 3))
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Top Section Tag */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
          <Compass className="w-3.5 h-3.5" />
          Momento de Reflexión Inicial
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Antes de programar...
        </h2>
        <p className="text-slate-400 text-lg font-medium mt-1">
          Pensemos en un problema.
        </p>
      </div>

      {/* Questions Stack */}
      <div className="w-full space-y-4 mb-8">
        {/* Question 1 */}
        <div
          className={`p-6 rounded-2xl border transition-all duration-300 ${
            revealedCount >= 1
              ? 'bg-slate-900/90 border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.1)]'
              : 'opacity-0'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 font-bold font-mono">
              01
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono font-semibold">
                Pregunta Disparadora
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
                ¿Una computadora puede resolver un problema si no le explicamos exactamente qué hacer?
              </h3>
              <p className="text-sm text-cyan-300/80 pt-1">
                ¿Qué pensás al respecto? Tomate un momento para responderte mentalmente.
              </p>
            </div>
          </div>
        </div>

        {/* Question 2 */}
        {revealedCount >= 2 && (
          <div className="p-6 rounded-2xl border bg-slate-900/90 border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.1)] transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-400 font-bold font-mono">
                02
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-indigo-400 font-mono font-semibold">
                  Profundización
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
                  ¿Qué significa dar instrucciones?
                </h3>
                <p className="text-sm text-slate-400 pt-1">
                  ¿Es lo mismo darle una orden a una persona que a un procesador electrónico?
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question 3 */}
        {revealedCount >= 3 && (
          <div className="p-6 rounded-2xl border bg-slate-900/90 border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.1)] transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 text-purple-400 font-bold font-mono">
                03
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-purple-400 font-mono font-semibold">
                  El Núcleo del Problema
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
                  ¿Todas las instrucciones son suficientemente claras para una computadora?
                </h3>
                <p className="text-sm text-slate-400 pt-1">
                  Las personas completan información implícita con su sentido común. ¿Las máquinas pueden hacer eso?
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Teacher Action Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {revealedCount < 3 ? (
          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-sm transition-all hover:scale-105 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <span>Revelar Siguiente Pregunta ({revealedCount}/3)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playSuccess()
              onComplete()
            }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-base transition-all hover:scale-105 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.3)]"
          >
            <span>Ver la Secuencia del Pensamiento</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-mono">
        <MessageSquareText className="w-3.5 h-3.5 text-cyan-400/70" />
        <span>Avanzá a tu propio ritmo para reflexionar sobre cada pregunta</span>
      </div>
    </div>
  )
}
