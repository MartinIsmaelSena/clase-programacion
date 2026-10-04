import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { Terminal, Code, ArrowRight, Play, Split } from 'lucide-react'

interface CodeBridgeProps {
  onComplete: () => void
}

export const CodeBridgeScreen: React.FC<CodeBridgeProps> = ({ onComplete }) => {
  const [tarjetaValida, setTarjetaValida] = useState<boolean>(true)
  const [activeLine, setActiveLine] = useState<number | null>(null)
  const [terminalOutput, setTerminalOutput] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState<boolean>(false)

  const handleToggleCard = (val: boolean) => {
    sound.playClick()
    setTarjetaValida(val)
    setActiveLine(null)
    setTerminalOutput(null)
  }

  const handleRunCode = () => {
    if (isRunning) return
    setIsRunning(true)
    sound.playClick()
    setActiveLine(1) // tarjeta_valida = ...

    setTimeout(() => {
      setActiveLine(3) // if tarjeta_valida:
      sound.playStep()

      setTimeout(() => {
        if (tarjetaValida) {
          setActiveLine(4) // print("Acceso permitido")
          setTerminalOutput('>> Acceso permitido ✅ [Molinete Abierto]')
          sound.playSuccess()
        } else {
          setActiveLine(6) // print("Acceso rechazado")
          setTerminalOutput('>> Acceso rechazado ⛔ [Alarma de Bloqueo]')
          sound.playError()
        }
        setIsRunning(false)
      }, 700)
    }, 700)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2">
          <Code className="w-3.5 h-3.5" />
          El Puente Hacia el Software
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          ¿Y dónde aparece la programación?
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mt-1">
          La computadora no entiende intenciones; sólo traduce la lógica que vos pensaste.
        </p>
      </div>

      {/* 3 Steps Pipeline: PROBLEMA -> ALGORITMO -> CODIGO */}
      <div className="w-full flex items-center justify-center gap-2 sm:gap-4 mb-6 text-center">
        <div className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-mono font-bold text-red-400">
          PROBLEMA
        </div>
        <span className="text-slate-600 font-bold">→</span>
        <div className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-mono font-bold text-cyan-400">
          ALGORITMO
        </div>
        <span className="text-slate-600 font-bold">→</span>
        <div className="px-3 sm:px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/50 text-xs sm:text-sm font-mono font-bold text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          CÓDIGO REAL
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch mb-6">
        {/* Left: Interactive Python IDE */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Editor Header */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">control_acceso.py</span>
            </div>

            {/* Variable toggle */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-400 hidden sm:inline">Tarjeta:</span>
              <button
                onClick={() => handleToggleCard(true)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                  tarjetaValida ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Válida (True)
              </button>
              <button
                onClick={() => handleToggleCard(false)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                  !tarjetaValida ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Inválida (False)
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 font-mono text-sm leading-relaxed space-y-1 bg-slate-950 flex-1">
            <div className={`px-2 py-0.5 rounded ${activeLine === 1 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300'}`}>
              <span className="text-slate-600 select-none mr-3">1</span>
              <span className="text-cyan-400">tarjeta_valida</span> = <span className={tarjetaValida ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{tarjetaValida ? 'True' : 'False'}</span>
            </div>
            <div className="text-slate-600 select-none px-2 py-0.5">2</div>
            <div className={`px-2 py-0.5 rounded ${activeLine === 3 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300'}`}>
              <span className="text-slate-600 select-none mr-3">3</span>
              <span className="text-purple-400 font-bold">if</span> <span className="text-cyan-400">tarjeta_valida</span>:
            </div>
            <div className={`px-2 py-0.5 rounded pl-8 ${activeLine === 4 ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300'}`}>
              <span className="text-slate-600 select-none mr-3">4</span>
              <span className="text-blue-400">print</span>(<span className="text-amber-300">"Acceso permitido"</span>)
            </div>
            <div className={`px-2 py-0.5 rounded ${activeLine === 5 ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300'}`}>
              <span className="text-slate-600 select-none mr-3">5</span>
              <span className="text-purple-400 font-bold">else</span>:
            </div>
            <div className={`px-2 py-0.5 rounded pl-8 ${activeLine === 6 ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-300'}`}>
              <span className="text-slate-600 select-none mr-3">6</span>
              <span className="text-blue-400">print</span>(<span className="text-amber-300">"Acceso rechazado"</span>)
            </div>
          </div>

          {/* Terminal Output */}
          <div className="bg-slate-900 border-t border-slate-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Salida de la consola (Terminal)
              </span>
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-slate-950" />
                <span>Ejecutar Código</span>
              </button>
            </div>
            <div className="font-mono text-xs p-2 rounded bg-slate-950 text-cyan-300 min-h-[32px] flex items-center">
              {terminalOutput || <span className="text-slate-600 italic">Presioná "Ejecutar Código" para ver la salida...</span>}
            </div>
          </div>
        </div>

        {/* Right: Pedagogical Insight Card */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Split className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                Conexión Clave
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              El <span className="text-purple-400 font-mono">if</span> es tu decisión algorítmica
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              Notá que el código no inventó nada nuevo: sólo tradujo la bifurcación lógica que vos resolviste antes en tu mente:
            </p>

            <div className="space-y-2 text-xs font-mono mb-4">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                <span className="text-cyan-400 font-bold">En el algoritmo:</span>
                <span className="text-slate-300">¿La tarjeta es válida?</span>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center gap-2">
                <span className="text-purple-400 font-bold">En Python:</span>
                <span className="text-purple-200">if tarjeta_valida:</span>
              </div>
            </div>

            <blockquote className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 italic">
              “El algoritmo que pensamos puede transformarse posteriormente en código utilizando cualquier lenguaje de programación.”
            </blockquote>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => {
                sound.playClick()
                onComplete()
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <span>PASAR AL RESUMEN FINAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
