import React from 'react'
import { sound } from '../../utils/sound'
import { PenTool, ArrowRight } from 'lucide-react'

interface PaperFirstScreenProps {
  onComplete: () => void
}

const FLOW_STEPS = [
  {
    step: '1',
    title: 'SIN TECNOLOGÍA',
    subtitle: 'Papel, lápiz o razonamiento puro',
    desc: 'Desconectarse de la pantalla. Aislar la situación y entender el problema real.',
    icon: '📝',
    color: '#06b6d4',
  },
  {
    step: '2',
    title: 'PENSAMIENTO',
    subtitle: 'Razonamiento lógico y deductivo',
    desc: 'Descomponer el problema en partes manejables. Preguntarse: ¿qué debe pasar primero?',
    icon: '🧠',
    color: '#8b5cf6',
  },
  {
    step: '3',
    title: 'ALGORITMO',
    subtitle: 'Secuencia ordenada y precisa',
    desc: 'Escribir las instrucciones paso a paso sin ambigüedades ni saltos mágicos.',
    icon: '🧩',
    color: '#f59e0b',
  },
  {
    step: '4',
    title: 'TECNOLOGÍA',
    subtitle: 'La computadora recién entra aquí',
    desc: 'La máquina sólo ejecuta fielmente lo que ya pensamos y ordenamos previamente.',
    icon: '💻',
    color: '#10b981',
  },
]

export const PaperFirstScreen: React.FC<PaperFirstScreenProps> = ({ onComplete }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Badge */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
          <PenTool className="w-3.5 h-3.5" />
          El Camino Lógico
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          AHORA TE TOCA A VOS
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto mt-2">
          Antes de utilizar una computadora, <span className="text-cyan-400 font-bold">primero vamos a pensar</span> la solución.
        </p>
      </div>

      {/* Pedagogical Sequence Card */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {FLOW_STEPS.map((item) => (
          <div
            key={item.step}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all"
          >
            <div
              className="absolute top-0 left-0 h-1 w-full"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{item.icon}</span>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.step}
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-white tracking-wide mb-0.5">
                {item.title}
              </h3>
              <p className="text-[11px] font-mono text-slate-400 mb-2">
                {item.subtitle}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Student Tip Box */}
      <div className="w-full max-w-2xl p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 text-center mb-8 shadow-[0_0_25px_rgba(99,102,241,0.15)]">
        <p className="text-sm font-semibold text-indigo-300 mb-1">
          💡 Clave para resolver:
        </p>
        <p className="text-slate-200 text-sm leading-relaxed">
          En los siguientes desafíos, antes de mover cualquier tarjeta en pantalla, 
          <span className="text-white font-bold"> imaginate la situación en tu cabeza</span> o anotala en papel. 
          ¡Descubrí la lógica antes de probar!
        </p>
      </div>

      {/* Button to Challenge 1 */}
      <button
        onClick={() => {
          sound.playSuccess()
          onComplete()
        }}
        className="flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <span>ENTRAR AL DESAFÍO 1: ORDENAR</span>
        <ArrowRight className="w-5 h-5 text-slate-950" />
      </button>
    </div>
  )
}
