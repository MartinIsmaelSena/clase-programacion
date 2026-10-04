import { SCREENS, type ScreenId } from '../types'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { sound } from '../utils/sound'

interface FooterNavProps {
  currentScreen: ScreenId
  onPrev: () => void
  onNext: () => void
  canGoNext?: boolean
  nextLabel?: string
  hideNext?: boolean
}

export const FooterNav: React.FC<FooterNavProps> = ({
  currentScreen,
  onPrev,
  onNext,
  canGoNext = true,
  nextLabel,
  hideNext = false,
}) => {
  const currentIndex = SCREENS.findIndex((s) => s.id === currentScreen)
  const isFirst = currentIndex === 0
  const isLast = currentIndex === SCREENS.length - 1

  const defaultNextLabel = isLast ? 'Finalizar Experiencia' : 'Continuar'

  return (
    <footer className="w-full py-4 px-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/80 mt-auto">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Previous Button */}
        <button
          onClick={() => {
            sound.playClick()
            onPrev()
          }}
          disabled={isFirst}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            isFirst
              ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
              : 'border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer hover:border-slate-600 shadow-sm'
          }`}
          title="Regresar a la etapa anterior"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Center note for teacher */}
        <div className="text-center hidden sm:block">
          <span className="text-[11px] font-mono text-slate-400">
            Navegación interactiva • Etapa {currentIndex + 1} de {SCREENS.length}
          </span>
        </div>

        {/* Next Button */}
        {!hideNext && (
          <button
            onClick={() => {
              if (canGoNext) {
                sound.playClick()
                onNext()
              }
            }}
            disabled={!canGoNext || isLast}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              !canGoNext || isLast
                ? 'opacity-40 border border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transform active:scale-95'
            }`}
            title={canGoNext ? 'Avanzar a la siguiente etapa' : 'Completá la actividad para continuar'}
          >
            <span>{nextLabel || defaultNextLabel}</span>
            {isLast ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        )}
      </div>
    </footer>
  )
}
