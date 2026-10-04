import React, { useState } from 'react'
import { CYCLE_STEPS } from '../../types'
import { sound } from '../../utils/sound'
import { Sparkles, ArrowRight, RotateCcw, Eye } from 'lucide-react'

interface CycleDiagramScreenProps {
  onComplete: () => void
}

export const CycleDiagramScreen: React.FC<CycleDiagramScreenProps> = ({ onComplete }) => {
  // Number of revealed steps: 0 (only center) up to 7
  const [revealedCount, setRevealedCount] = useState<number>(1)
  const [activeStepId, setActiveStepId] = useState<number>(1)

  const handleNextStep = () => {
    sound.playStep()
    const nextCount = Math.min(revealedCount + 1, CYCLE_STEPS.length)
    setRevealedCount(nextCount)
    setActiveStepId(nextCount)
    if (nextCount === CYCLE_STEPS.length) {
      sound.playSuccess()
    }
  }

  const handleSelectStep = (stepId: number) => {
    if (stepId <= revealedCount) {
      sound.playClick()
      setActiveStepId(stepId)
    }
  }

  const handleReset = () => {
    sound.playClick()
    setRevealedCount(1)
    setActiveStepId(1)
  }

  // Calculate coordinates on a circle of radius R
  const total = CYCLE_STEPS.length
  const radius = 175
  const centerX = 230
  const centerY = 230

  const activeStep = CYCLE_STEPS.find((s) => s.id === activeStepId) || CYCLE_STEPS[0]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          La Secuencia Central
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
          El Circuito del Pensamiento Algorítmico
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-0.5">
          Programar no es tipear código de inmediato. Es este circuito de razonamiento continuo.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Dynamic Circular Diagram */}
        <div className="lg:col-span-7 flex justify-center items-center relative py-2">
          <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] flex items-center justify-center">
            {/* SVG Connecting Flow Lines & Curved Orbit */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 460 460"
            >
              <defs>
                <linearGradient id="orbitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Orbiting track */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="url(#orbitGlow)"
                strokeWidth="2"
                strokeDasharray="6 6"
                className="animate-[spin_60s_linear_infinite]"
              />

              {/* Connecting lines from center to active nodes */}
              {CYCLE_STEPS.map((step, idx) => {
                if (step.id > revealedCount) return null
                const angle = (idx / total) * 2 * Math.PI - Math.PI / 2
                const x = centerX + radius * Math.cos(angle)
                const y = centerY + radius * Math.sin(angle)
                const isSelected = step.id === activeStepId

                return (
                  <g key={`line-${step.id}`}>
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke={isSelected ? step.color : '#334155'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      strokeOpacity={isSelected ? 0.9 : 0.4}
                      strokeDasharray={isSelected ? 'none' : '4 4'}
                    />
                  </g>
                )
              })}
            </svg>

            {/* Central Node: PROBLEMA */}
            <div className="z-10 flex flex-col items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-900 border-2 border-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.35)] animate-pulse-glow text-center p-2">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
                PUNTO DE PARTIDA
              </span>
              <span className="text-sm sm:text-lg font-black text-white tracking-wide">
                PROBLEMA
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                La necesidad real
              </span>
            </div>

            {/* 7 Orbiting Nodes */}
            {CYCLE_STEPS.map((step, idx) => {
              const isRevealed = step.id <= revealedCount
              const isSelected = step.id === activeStepId

              // Angles in radians starting at top (-PI/2)
              const angle = (idx / total) * 2 * Math.PI - Math.PI / 2
              const x = centerX + radius * Math.cos(angle)
              const y = centerY + radius * Math.sin(angle)

              // Adjust position for HTML absolute elements (scale from 460px viewBox to actual container)
              const leftPercent = (x / 460) * 100
              const topPercent = (y / 460) * 100

              if (!isRevealed) {
                return (
                  <div
                    key={step.id}
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-600 text-xs font-mono opacity-40"
                  >
                    {step.id}
                  </div>
                )
              }

              return (
                <button
                  key={step.id}
                  onClick={() => handleSelectStep(step.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all duration-300 cursor-pointer shadow-lg z-20 ${
                    isSelected
                      ? 'scale-110 ring-2 ring-white/80 bg-slate-900 shadow-[0_0_25px_rgba(255,255,255,0.3)]'
                      : 'bg-slate-900/90 hover:scale-105 border hover:border-slate-400'
                  }`}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    borderColor: isSelected ? step.color : `${step.color}60`,
                    boxShadow: isSelected ? `0 0 25px ${step.color}80` : undefined,
                  }}
                  title={`Paso ${step.id}: ${step.name}`}
                >
                  <span className="text-base sm:text-xl">{step.icon}</span>
                  <div className="text-left hidden sm:block">
                    <span
                      className="text-xs font-extrabold tracking-wider block font-mono leading-none"
                      style={{ color: step.color }}
                    >
                      {step.name}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Detail Card & Teacher Step Advance */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
          {/* Active Step Spotlight Card */}
          <div
            className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border transition-all duration-300 relative overflow-hidden"
            style={{
              borderColor: `${activeStep.color}60`,
              boxShadow: `0 0 30px ${activeStep.color}20`,
            }}
          >
            <div
              className="absolute top-0 left-0 h-1.5 w-full"
              style={{ backgroundColor: activeStep.color }}
            />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" style={{ color: activeStep.color }} />
                Paso {activeStep.id} de {CYCLE_STEPS.length}
              </span>
              <span
                className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-800"
                style={{ color: activeStep.color }}
              >
                Etapa Activa
              </span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl sm:text-4xl">{activeStep.icon}</span>
              <h3 className="text-2xl font-black text-white tracking-wide">
                {activeStep.name}
              </h3>
            </div>

            <p className="text-slate-300 text-base leading-relaxed mb-4">
              {activeStep.desc}
            </p>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-mono">
              💡 <span className="text-cyan-400 font-bold">Concepto clave:</span> Cada vez que aplicás "{activeStep.name}", fortalecés tu razonamiento antes de pasar al siguiente paso.
            </div>
          </div>

          {/* Sequential Revelation Controls for Teacher */}
          <div className="space-y-2">
            {revealedCount < CYCLE_STEPS.length ? (
              <button
                onClick={handleNextStep}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all transform active:scale-98 cursor-pointer"
              >
                <span>
                  Revelar Siguiente Paso ({revealedCount + 1}/{CYCLE_STEPS.length}):{' '}
                  <span className="underline">{CYCLE_STEPS[revealedCount].name}</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playSuccess()
                  onComplete()
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-extrabold text-sm shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <span>¡Circuito Completo! Continuar a la Teoría</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Descubiertos: {revealedCount} de {CYCLE_STEPS.length}</span>
              <button
                onClick={handleReset}
                className="hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Reiniciar revelación"
              >
                <RotateCcw className="w-3 h-3" />
                Reiniciar pasos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
