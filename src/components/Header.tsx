import React, { useState } from 'react'
import { SCREENS, type ScreenId, type AppViewMode } from '../types'
import { sound } from '../utils/sound'
import { Volume2, VolumeX, ListOrdered, Sparkles, ChevronDown, Zap, GraduationCap, BookOpen } from 'lucide-react'

interface HeaderProps {
  currentScreen: ScreenId
  onSelectScreen: (id: ScreenId) => void
  score: number
  soundEnabled: boolean
  onToggleSound: () => void
  viewMode: AppViewMode
  onSelectViewMode: (mode: AppViewMode) => void
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onSelectScreen,
  score,
  soundEnabled,
  onToggleSound,
  viewMode,
  onSelectViewMode,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const currentIndex = SCREENS.findIndex((s) => s.id === currentScreen)
  const currentScreenMeta = SCREENS[currentIndex]
  const progressPercent = Math.round(((currentIndex) / (SCREENS.length - 1)) * 100)

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Logo & Section indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={() => {
              sound.playClick()
              onSelectViewMode('LESSON')
              onSelectScreen('HERO')
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              &lt;/&gt;
            </span>
            <div className="hidden sm:block">
              <span className="font-extrabold tracking-wider text-xs uppercase text-cyan-400 block font-mono">
                CODE
              </span>
              <span className="text-xs text-slate-400 font-medium leading-none block">
                Del Problema al Programa
              </span>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-800 hidden md:block" />

          {/* Quick Menu for Stages (when in lesson mode) */}
          {viewMode === 'LESSON' && (
            <div className="relative">
              <button
                onClick={() => {
                  sound.playClick()
                  setMenuOpen(!menuOpen)
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-cyan-500/50 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Índice de navegación rápida"
              >
                <ListOrdered className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline text-slate-400">Etapa:</span>
                <span className="font-semibold text-slate-200">
                  {currentScreenMeta?.shortLabel || 'Inicio'}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div 
                  className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1 flex justify-between items-center">
                    <span>Índice de Etapas</span>
                    <span className="text-cyan-400 font-mono">{currentIndex + 1} de {SCREENS.length}</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1 custom-scrollbar">
                    {SCREENS.map((sc, idx) => {
                      const active = sc.id === currentScreen
                      return (
                        <button
                          key={sc.id}
                          onClick={() => {
                            sound.playClick()
                            onSelectScreen(sc.id)
                            setMenuOpen(false)
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            active
                              ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] ${active ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                              {idx + 1}
                            </span>
                            <span className="truncate">{sc.title}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* If inside live mode, show Back to Lesson button */}
          {viewMode !== 'LESSON' && (
            <button
              onClick={() => {
                sound.playClick()
                onSelectViewMode('LESSON')
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>← Volver a la Clase</span>
            </button>
          )}
        </div>

        {/* Central mini progress dots (on desktop, during lesson mode) */}
        {viewMode === 'LESSON' && (
          <div className="hidden md:flex flex-col items-center flex-1 max-w-sm mx-4">
            <div className="w-full flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Progreso
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Right Tools: Live Challenge Buttons, Points & Audio */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mode switch buttons */}
          <button
            onClick={() => {
              sound.playClick()
              onSelectViewMode(viewMode === 'LIVE_STUDENT' ? 'LESSON' : 'LIVE_STUDENT')
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'LIVE_STUDENT'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
            title="Ingresar como estudiante al Desafío en Vivo"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desafío en Vivo</span>
          </button>

          <button
            onClick={() => {
              sound.playClick()
              onSelectViewMode(viewMode === 'LIVE_TEACHER' ? 'LESSON' : 'LIVE_TEACHER')
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'LIVE_TEACHER'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Panel de control para docentes"
          >
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Modo Docente</span>
          </button>

          {/* Score pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PUNTOS:</span>
            <span className="text-amber-300 font-bold">{score}</span>
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => {
              sound.playClick()
              onToggleSound()
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            aria-label="Silenciar o activar sonido"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
