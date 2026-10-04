import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { GripVertical, Play, RotateCcw, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown, ArrowRight, ShieldCheck } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ChallengeOrderProps {
  onAddScore: (points: number) => void
  onComplete: () => void
}

interface StepItem {
  id: string
  text: string
  icon: string
}

const INITIAL_SHUFFLED_STEPS: StepItem[] = [
  { id: 'permitir', text: 'Permitir el acceso.', icon: '🚪' },
  { id: 'recibir', text: 'Recibir la tarjeta.', icon: '💳' },
  { id: 'verificar', text: 'Verificar la tarjeta.', icon: '✅' },
  { id: 'leer', text: 'Leer la tarjeta.', icon: '🔎' },
  { id: 'rechazar', text: 'Rechazar el acceso si no es válida.', icon: '⛔' },
]

export const ChallengeOrderScreen: React.FC<ChallengeOrderProps> = ({
  onAddScore,
  onComplete,
}) => {
  const [items, setItems] = useState<StepItem[]>(INITIAL_SHUFFLED_STEPS)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [simStep, setSimStep] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [hasScored, setHasScored] = useState(false)

  // Move item up/down (accessible for touch/mobile)
  const moveItem = (index: number, direction: 'up' | 'down') => {
    sound.playClick()
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return
    const newItems = [...items]
    const [moved] = newItems.splice(index, 1)
    newItems.splice(targetIndex, 0, moved)
    setItems(newItems)
    setSimulationState('idle')
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    sound.playClick()
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === index) return
    const newItems = [...items]
    const draggedItem = newItems[draggedIdx]
    newItems.splice(draggedIdx, 1)
    newItems.splice(index, 0, draggedItem)
    setDraggedIdx(index)
    setItems(newItems)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
    setSimulationState('idle')
  }

  // Validate the algorithm and diagnose specific errors
  const handleRunAlgorithm = () => {
    const ids = items.map((i) => i.id)
    const idxRecibir = ids.indexOf('recibir')
    const idxLeer = ids.indexOf('leer')
    const idxVerificar = ids.indexOf('verificar')
    const idxPermitir = ids.indexOf('permitir')
    const idxRechazar = ids.indexOf('rechazar')

    // Check specific logical flaws
    if (idxLeer < idxRecibir) {
      sound.playError()
      setSimulationState('error')
      setErrorMessage('❌ El sistema intentó leer los datos antes de que el estudiante apoyara la tarjeta. ¡No hay nada para leer en el lector!')
      return
    }

    if (idxVerificar < idxLeer) {
      sound.playError()
      setSimulationState('error')
      setErrorMessage('❌ Intentaste verificar la tarjeta antes de leerla. El procesador no puede validar un dato que aún no extrajo.')
      return
    }

    if (idxPermitir < idxVerificar) {
      sound.playError()
      setSimulationState('error')
      setErrorMessage('❌ El sistema intentó permitir el acceso antes de verificar la tarjeta. ¡Cualquiera podría ingresar al colegio sin autorización!')
      return
    }

    if (idxRechazar < idxVerificar) {
      sound.playError()
      setSimulationState('error')
      setErrorMessage('❌ El sistema intentó evaluar el rechazo antes de la verificación. La decisión debe ocurrir con los datos validados.')
      return
    }

    if (idxRecibir !== 0) {
      sound.playError()
      setSimulationState('error')
      setErrorMessage('❌ El primer paso indispensable siempre debe ser recibir la tarjeta.')
      return
    }

    // Order is correct! Run interactive simulation
    setSimulationState('running')
    setSimStep(1)
    sound.playStep()

    setTimeout(() => {
      setSimStep(2)
      sound.playStep()
      setTimeout(() => {
        setSimStep(3)
        sound.playStep()
        setTimeout(() => {
          setSimStep(4)
          sound.playSuccess()
          setSimulationState('success')
          if (!hasScored) {
            onAddScore(10)
            setHasScored(true)
          }
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } })
        }, 800)
      }, 800)
    }, 800)
  }

  const handleReset = () => {
    sound.playClick()
    setItems(INITIAL_SHUFFLED_STEPS)
    setSimulationState('idle')
    setErrorMessage('')
    setSimStep(0)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Desafío Práctico 1 (+10 pts)
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          DESAFÍO 1: Ordená el Algoritmo
        </h2>
        <div className="mt-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-sm max-w-2xl mx-auto">
          🏫 <span className="font-bold text-white">Situación:</span> Un sistema escolar debe controlar el ingreso seguro de un estudiante al edificio.
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Drag & Drop Card Column */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
            <span>Arrastrá o usá las flechas para ordenar:</span>
            <span>{items.length} instrucciones</span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all select-none ${
                  draggedIdx === idx
                    ? 'opacity-40 border-cyan-400 bg-cyan-950/40 scale-95'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs text-cyan-400 font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing hidden sm:block" />
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>

                {/* Touch/accessible reordering arrows */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Subir"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Bajar"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer orden inicial</span>
            </button>

            <button
              onClick={handleRunAlgorithm}
              disabled={simulationState === 'running'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>EJECUTAR ALGORITMO</span>
            </button>
          </div>
        </div>

        {/* Right Simulation & Diagnostic Column */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-1.5">
              <span>Simulación del Sistema Escolar</span>
            </h3>

            {/* Simulation steps animation */}
            <div className="space-y-2.5 mb-4">
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                  simStep >= 1 ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200' : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <span>💳</span>
                <span className="font-mono">Paso 1: Tarjeta recibida en sensor</span>
                {simStep >= 1 && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 ml-auto" />}
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                  simStep >= 2 ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200' : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <span>🔎</span>
                <span className="font-mono">Paso 2: Leyendo código de tarjeta...</span>
                {simStep >= 2 && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 ml-auto" />}
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                  simStep >= 3 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <span>✅</span>
                <span className="font-mono">Paso 3: Tarjeta verificada (Válida)</span>
                {simStep >= 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
              </div>

              <div
                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                  simStep >= 4 ? 'bg-emerald-500/30 border-emerald-400 text-white font-bold' : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <span>🚪</span>
                <span className="font-mono">Paso 4: Molinete habilitado (Acceso permitido)</span>
                {simStep >= 4 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 ml-auto" />}
              </div>
            </div>

            {/* Error diagnostic state */}
            {simulationState === 'error' && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-sm mb-1 text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Fallo en la Lógica Algorítmica</span>
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed mb-3">
                  {errorMessage}
                </p>
                <button
                  onClick={() => setSimulationState('idle')}
                  className="w-full py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-bold cursor-pointer transition-colors"
                >
                  INTENTAR NUEVAMENTE
                </button>
              </div>
            )}

            {/* Success state */}
            {simulationState === 'success' && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-extrabold text-sm mb-1 text-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>🟢 ¡Algoritmo correcto! (+10 pts)</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed mb-4">
                  El sistema cumplió la secuencia estricta: recibir el medio físico, leer la información, validarla en la base de datos y recién luego abrir la puerta.
                </p>
                <button
                  onClick={() => {
                    sound.playClick()
                    onComplete()
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <span>IR AL DESAFÍO 2: ROMPÉ EL PROGRAMA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
