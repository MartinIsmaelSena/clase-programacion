import React, { useEffect } from 'react'
import { sound } from '../../utils/sound'
import { CYCLE_STEPS } from '../../types'
import { Trophy, RotateCcw, BookOpen, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

interface SummaryScreenProps {
  score: number
  onRestart: () => void
  onReview: () => void
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  score,
  onRestart,
  onReview,
}) => {
  useEffect(() => {
    sound.playSuccess()
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    })
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full text-center">
      {/* Top Trophy Banner */}
      <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)]">
        <Trophy className="w-4 h-4 text-amber-400" />
        <span>¡CLASE COMPLETADA EXITOSAMENTE!</span>
      </div>

      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
        DEL <span className="text-cyan-400">PROBLEMA</span> AL <span className="text-indigo-400">PROGRAMA</span>
      </h1>

      <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-6">
        Recorriste todas las etapas del pensamiento computacional.
      </p>

      {/* Recorrido Horizontal / Grid de los 7 Pasos */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-3">
          El Camino del Pensamiento Algorítmico
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {CYCLE_STEPS.map((s, idx) => (
            <div
              key={s.id}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center hover:border-slate-700 transition-colors"
            >
              <span className="text-2xl mb-1">{s.icon}</span>
              <span className="text-xs font-extrabold font-mono tracking-wider text-slate-200">
                {s.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                0{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Frases Finales de Impacto */}
      <div className="w-full max-w-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-purple-950/40 border border-cyan-500/30 rounded-2xl p-6 mb-6 text-center space-y-3 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <blockquote className="text-lg sm:text-xl font-bold text-white italic leading-snug">
          “Programar no comienza escribiendo código.
          <br className="hidden sm:inline" /> Comienza pensando cómo resolver un problema.”
        </blockquote>
        <div className="h-0.5 w-16 bg-cyan-500/40 mx-auto" />
        <p className="text-sm sm:text-base font-extrabold text-cyan-300">
          “Programar no comienza con una computadora. Comienza con una idea.”
        </p>
      </div>

      {/* Score Summary Badge */}
      <div className="flex items-center gap-4 mb-8">
        <div className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-amber-500/40 flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div className="text-left font-mono">
            <span className="text-[10px] text-slate-400 block leading-none">PUNTUACIÓN FINAL</span>
            <span className="text-lg font-black text-amber-300">{score} PUNTOS</span>
          </div>
        </div>
      </div>

      {/* Final Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => {
            sound.playClick()
            onRestart()
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>VOLVER A JUGAR</span>
        </button>

        <button
          onClick={() => {
            sound.playClick()
            onReview()
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>REPASAR CONCEPTOS</span>
        </button>
      </div>
    </div>
  )
}
