import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { Plus, Trash2, Play, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ChallengeBuildProps {
  onAddScore: (points: number) => void
  onComplete: () => void
}

interface ActionBlock {
  id: string
  name: string
  icon: string
  category: 'sensor' | 'proceso' | 'salida'
  color: string
}

const AVAILABLE_BLOCKS: ActionBlock[] = [
  { id: 'recibir', name: 'Recibir tarjeta', icon: '💳', category: 'sensor', color: '#06b6d4' },
  { id: 'leer', name: 'Leer tarjeta', icon: '🔎', category: 'sensor', color: '#3b82f6' },
  { id: 'verificar', name: 'Verificar tarjeta', icon: '🛡️', category: 'proceso', color: '#8b5cf6' },
  { id: 'permitir', name: 'Permitir acceso', icon: '🚪', category: 'salida', color: '#10b981' },
  { id: 'rechazar', name: 'Rechazar acceso', icon: '⛔', category: 'salida', color: '#ef4444' },
  { id: 'mostrar', name: 'Mostrar mensaje', icon: '💬', category: 'salida', color: '#f59e0b' },
]

export const ChallengeBuildScreen: React.FC<ChallengeBuildProps> = ({
  onAddScore,
  onComplete,
}) => {
  const [pipeline, setPipeline] = useState<ActionBlock[]>([])
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [activeSimIndex, setActiveSimIndex] = useState<number>(-1)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasScored, setHasScored] = useState(false)

  const handleAddBlock = (block: ActionBlock) => {
    sound.playClick()
    setPipeline([...pipeline, block])
    setStatus('idle')
  }

  const handleRemoveBlock = (index: number) => {
    sound.playClick()
    const updated = [...pipeline]
    updated.splice(index, 1)
    setPipeline(updated)
    setStatus('idle')
  }

  const handleReset = () => {
    sound.playClick()
    setPipeline([])
    setStatus('idle')
    setActiveSimIndex(-1)
    setErrorMessage('')
  }

  const handleExecute = () => {
    if (pipeline.length === 0) {
      sound.playError()
      setStatus('error')
      setErrorMessage('Tu algoritmo está vacío. Añadí las acciones necesarias desde la paleta izquierda.')
      return
    }

    const ids = pipeline.map((b) => b.id)
    const idxRecibir = ids.indexOf('recibir')
    const idxLeer = ids.indexOf('leer')
    const idxVerificar = ids.indexOf('verificar')
    const idxPermitir = ids.indexOf('permitir')

    // Validations
    if (idxRecibir === -1) {
      sound.playError()
      setStatus('error')
      setErrorMessage('Falta la acción fundamental: "Recibir tarjeta".')
      return
    }

    if (idxLeer === -1) {
      sound.playError()
      setStatus('error')
      setErrorMessage('Falta la acción "Leer tarjeta" para procesar el chip del estudiante.')
      return
    }

    if (idxVerificar === -1) {
      sound.playError()
      setStatus('error')
      setErrorMessage('Falta la acción "Verificar tarjeta" para saber si el alumno está matriculado.')
      return
    }

    if (idxPermitir === -1) {
      sound.playError()
      setStatus('error')
      setErrorMessage('Falta la acción final de éxito: "Permitir acceso".')
      return
    }

    if (idxRecibir > idxLeer) {
      sound.playError()
      setStatus('error')
      setErrorMessage('No se puede leer la tarjeta antes de recibirla.')
      return
    }

    if (idxLeer > idxVerificar) {
      sound.playError()
      setStatus('error')
      setErrorMessage('No se puede verificar la tarjeta antes de leer sus datos.')
      return
    }

    if (idxVerificar > idxPermitir) {
      sound.playError()
      setStatus('error')
      setErrorMessage('No se puede permitir el acceso antes de verificar la validez de la credencial.')
      return
    }

    // Pipeline is valid! Execute simulation step by step
    setStatus('running')
    setActiveSimIndex(0)
    sound.playStep()

    let current = 0
    const interval = setInterval(() => {
      current++
      if (current < pipeline.length) {
        setActiveSimIndex(current)
        sound.playStep()
      } else {
        clearInterval(interval)
        setStatus('success')
        sound.playSuccess()
        if (!hasScored) {
          onAddScore(20)
          setHasScored(true)
        }
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
      }
    }, 650)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Desafío Final: Construcción (+20 pts)
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          DESAFÍO FINAL: Creá la Solución
        </h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto mt-1">
          🏫 <span className="text-cyan-400 font-semibold">Situación:</span> Una escuela quiere un sistema que permita ingresar <span className="underline">solamente a estudiantes autorizados</span>.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mb-4">
        {/* Available Action Palette */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>Acciones disponibles:</span>
            <span>Clic para agregar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {AVAILABLE_BLOCKS.map((block) => (
              <button
                key={block.id}
                onClick={() => handleAddBlock(block)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{block.icon}</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                    {block.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {block.category}
                  </span>
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:scale-110" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-[11px] font-mono text-slate-400 mt-3 text-center">
            Podés combinar las acciones que consideres necesarias para el algoritmo.
          </p>
        </div>

        {/* Algorithm Builder Pipeline */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col min-h-[340px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-300 font-bold">
              Tu Algoritmo ({pipeline.length} pasos)
            </span>
            {pipeline.length > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Vaciar</span>
              </button>
            )}
          </div>

          {/* Steps slot */}
          <div className="flex-1 space-y-2 mb-4">
            {pipeline.length === 0 ? (
              <div className="h-44 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <span className="text-2xl mb-1">🧩</span>
                <p className="text-xs font-semibold text-slate-400">
                  El algoritmo aún no tiene instrucciones.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hacé clic en los bloques de la izquierda para armar la secuencia.
                </p>
              </div>
            ) : (
              pipeline.map((block, idx) => {
                const isActive = activeSimIndex === idx
                return (
                  <div
                    key={`${block.id}-${idx}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 scale-[1.02] shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-950/70 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
                        {idx + 1}
                      </span>
                      <span className="text-lg">{block.icon}</span>
                      <span className="text-xs font-bold text-slate-100">{block.name}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveBlock(idx)}
                      disabled={status === 'running'}
                      className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer transition-colors"
                      title="Eliminar paso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <div className="p-3 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {status === 'success' && (
            <div className="p-4 mb-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs animate-in fade-in">
              <p className="font-black text-sm text-emerald-300 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                🎉 ¡ALGORITMO COMPLETADO! (+20 pts)
              </p>
              <blockquote className="italic text-emerald-200/90 leading-relaxed">
                “Pensaste el problema, escribiste los pasos, los ordenaste y comprobaste el resultado.”
              </blockquote>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={handleExecute}
              disabled={status === 'running' || pipeline.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{status === 'running' ? 'EJECUTANDO SIMULACIÓN...' : 'EJECUTAR'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Button to Code Bridge */}
      {status === 'success' && (
        <button
          onClick={() => {
            sound.playClick()
            onComplete()
          }}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer transition-all"
        >
          <span>¿Y DÓNDE APARECE EL CÓDIGO? DAR EL SALTO</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
