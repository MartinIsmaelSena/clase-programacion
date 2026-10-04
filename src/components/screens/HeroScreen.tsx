import React from 'react'
import { sound } from '../../utils/sound'
import { Sparkles, Terminal, Cpu, ArrowRight } from 'lucide-react'

interface HeroScreenProps {
  onStart: () => void
}

export const HeroScreen: React.FC<HeroScreenProps> = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full relative">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Badges */}
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          Secundaria Técnica • Laboratorio Digital
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-800 border border-slate-700 text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          10–12 min
        </span>
      </div>

      {/* Main Title Section */}
      <div className="space-y-3 mb-8">
        <div className="inline-block">
          <span className="font-mono text-cyan-400 tracking-widest font-black text-sm uppercase px-3 py-1 rounded bg-cyan-950/60 border border-cyan-800/60">
            CODE
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
          DEL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">PROBLEMA</span> AL <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">PROGRAMA</span>
        </h1>
        <h2 className="text-lg sm:text-2xl font-medium text-slate-300 max-w-2xl mx-auto">
          Introducción al pensamiento algorítmico
        </h2>
      </div>

      {/* Central Hook Question in Glowing Card */}
      <div className="w-full max-w-2xl mb-10 p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.12)] backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/50 transition-all">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500" />
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Pregunta Disparadora
        </p>
        <blockquote className="text-xl sm:text-2xl font-semibold text-slate-100 italic leading-snug">
          “¿Cómo podemos transformar un problema en instrucciones que una computadora pueda ejecutar?”
        </blockquote>
      </div>

      {/* Big Action Button */}
      <button
        onClick={() => {
          sound.playSuccess()
          onStart()
        }}
        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 font-extrabold text-lg tracking-wide hover:from-cyan-400 hover:to-indigo-500 shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
      >
        <span>COMENZAR</span>
        <ArrowRight className="w-5 h-5 text-slate-950 transition-transform group-hover:translate-x-1" />
      </button>

      {/* Sub note */}
      <p className="mt-6 text-xs text-slate-500 font-mono">
        Laboratorio interactivo de pensamiento computacional
      </p>
    </div>
  )
}
