import React, { useState, useEffect } from 'react'
import { sound } from '../../utils/sound'
import { liveClient } from '../../services/liveClient'
import { LIVE_CHALLENGES } from '../../data/liveChallenges'
import type { LiveSessionState, LiveParticipant, LiveChallengeConfig, LiveCard } from '../../types'
import { ArrowLeft, Clock, Play, Plus, Trash2, CheckCircle2, AlertTriangle, Sparkles, Send, ArrowUp, ArrowDown } from 'lucide-react'
import confetti from 'canvas-confetti'

interface StudentLiveViewProps {
  onBackToLesson: () => void
}

export const StudentLiveView: React.FC<StudentLiveViewProps> = ({ onBackToLesson }) => {
  // Join form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [code, setCode] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  // Current session & participant
  const [participant, setParticipant] = useState<LiveParticipant | null>(null)
  const [session, setSession] = useState<LiveSessionState | null>(null)

  // Board / Logic circuit builder state
  const [selectedCards, setSelectedCards] = useState<LiveCard[]>([])
  const [testResult, setTestResult] = useState<{ isValid: boolean; message: string } | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)

  // Active challenge config
  const challengeConfig: LiveChallengeConfig = LIVE_CHALLENGES.find(
    (c) => c.id === session?.challengeId
  ) || LIVE_CHALLENGES[0]

  // Subscribe to real-time session updates
  useEffect(() => {
    const unsubscribe = liveClient.subscribeSession((updated) => {
      setSession({ ...updated })
      // Update our participant status from session
      if (participant) {
        const found = updated.participants.find((p) => p.id === participant.id)
        if (found) setParticipant(found)
      }
    })
    return () => unsubscribe()
  }, [participant])

  // Synchronized timer
  useEffect(() => {
    if (!session || session.status !== 'ACTIVE' || !session.startedAt) return

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.max(0, Math.floor((now - session.startedAt!) / 1000))
      setElapsedSeconds(diff)
    }, 500)

    return () => clearInterval(interval)
  }, [session])

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle Join
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !code.trim()) {
      setJoinError('Por favor completá todos los campos.')
      return
    }

    setIsJoining(true)
    setJoinError(null)

    const res = await liveClient.joinSession(code, firstName, lastName)
    setIsJoining(false)

    if (res.success && res.participant) {
      sound.playSuccess()
      setParticipant(res.participant)
    } else {
      sound.playError()
      setJoinError(res.error || 'No se pudo conectar a la sala.')
    }
  }

  // Add card to pipeline
  const handleAddCard = (card: LiveCard) => {
    sound.playClick()
    setSelectedCards([...selectedCards, card])
    setTestResult(null)
  }

  // Remove card from pipeline
  const handleRemoveCard = (index: number) => {
    sound.playClick()
    const updated = [...selectedCards]
    updated.splice(index, 1)
    setSelectedCards(updated)
    setTestResult(null)
  }

  // Move card
  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    sound.playClick()
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= selectedCards.length) return
    const updated = [...selectedCards]
    const [moved] = updated.splice(index, 1)
    updated.splice(target, 0, moved)
    setSelectedCards(updated)
    setTestResult(null)
  }

  // Test solution locally
  const handleTestAlgorithm = () => {
    setIsTesting(true)
    sound.playClick()

    setTimeout(() => {
      const solution = { steps: selectedCards.map((c) => c.id) }
      const res = challengeConfig.validateSolution(solution)
      setTestResult(res)
      setIsTesting(false)
      if (res.isValid) {
        sound.playSuccess()
      } else {
        sound.playError()
      }
    }, 400)
  }

  // Submit solution to server
  const handleSubmitSolution = async () => {
    if (!session || !participant) return
    setIsSubmitting(true)
    sound.playClick()

    const solution = { steps: selectedCards.map((c) => c.id) }
    const res = await liveClient.submitSolution(session.code, participant.id, solution)
    setIsSubmitting(false)

    if (res.isValid) {
      sound.playSuccess()
      setSubmissionSuccess(true)
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } })
    } else {
      sound.playError()
      setTestResult({ isValid: false, message: res.message })
    }
  }

  // View: Join Form
  if (!participant || !session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white text-center">Desafío en Vivo</h2>
          <p className="text-xs text-slate-400 text-center mt-1 mb-5">
            Ingresá tus datos y el código compartido por tu docente:
          </p>

          <form onSubmit={handleJoin} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej: Martina"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej: Gómez"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Código del Desafío</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ej: CODE-42"
                className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-3.5 py-2 text-center text-base font-mono font-bold text-cyan-300 tracking-wider uppercase focus:border-cyan-400 focus:outline-none"
                required
              />
            </div>

            {joinError && (
              <p className="text-xs text-rose-400 text-center font-medium">{joinError}</p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onBackToLesson}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isJoining}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer disabled:opacity-50"
              >
                {isJoining ? 'Conectando...' : 'Entrar a la Sala'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // View: Waiting Room (Before teacher starts)
  if (session.status === 'WAITING') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full text-center">
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-4">
            <span>SALA DE ESPERA</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            ¡Hola, {participant.firstName}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6">
            Te uniste a la sala <strong className="text-cyan-400 font-mono">{session.code}</strong> para el desafío:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6 text-left">
            <h3 className="font-bold text-sm text-white mb-1">{challengeConfig.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{challengeConfig.mission}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 py-2.5 px-4 rounded-xl mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Esperando que el docente inicie el desafío...</span>
          </div>

          <button
            onClick={onBackToLesson}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            ← Salir y volver a la clase
          </button>
        </div>
      </div>
    )
  }

  // View: Completed or Podium
  if (participant.status === 'COMPLETED' || submissionSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full text-center">
        <div className="w-full bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-3xl">
            🎉
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
            ¡SOLUCIÓN CORRECTA!
          </h2>
          <p className="text-xs text-emerald-300 font-mono mb-6">
            Tu algoritmo superó todas las pruebas del servidor.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">TIEMPO REGISTRADO</span>
              <strong className="text-lg text-cyan-300">{participant.finishTimeFormatted || formatTimer(elapsedSeconds)}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block mb-1">POSICIÓN</span>
              <strong className="text-lg text-amber-300">
                {participant.rank ? `${participant.rank}° PUESTO` : 'Registrado'}
              </strong>
            </div>
          </div>

          {session.winnerName && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs mb-6">
              🥇 <strong>Primer lugar:</strong> {session.winnerName} ({session.winnerTime})
            </div>
          )}

          <button
            onClick={onBackToLesson}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Volver a la clase
          </button>
        </div>
      </div>
    )
  }

  // View: Active Challenge Logic Board
  return (
    <div className="flex-1 flex flex-col p-3 sm:p-5 max-w-5xl mx-auto w-full">
      {/* Active Header with Timer */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToLesson}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {challengeConfig.title}
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">
              Participante: {participant.firstName} {participant.lastName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-sm font-black text-amber-300 bg-slate-950 px-3 py-1 rounded-xl border border-amber-500/30">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>⏱️ {formatTimer(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Mission description */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mb-4">
        🎯 <strong className="text-white">Misión:</strong> {challengeConfig.mission}
      </div>

      {/* Logic Board Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-start mb-4">
        {/* Available Cards Palette */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <span className="text-xs font-mono uppercase text-slate-400 font-bold block mb-2.5 pb-1 border-b border-slate-800">
            Tarjetas de Acción y Decisiones
          </span>

          <div className="space-y-1.5">
            {challengeConfig.availableCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleAddCard(card)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{card.icon}</span>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                    {card.label}
                  </span>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Constructed Logic Circuit Flow */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col min-h-[320px]">
          <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-300 font-bold">
              Tu Flujo Lógico ({selectedCards.length} pasos)
            </span>
            {selectedCards.length > 0 && (
              <button
                onClick={() => setSelectedCards([])}
                className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer text-[11px]"
              >
                Vaciar
              </button>
            )}
          </div>

          {/* Cards Sequence */}
          <div className="flex-1 space-y-1.5 mb-3">
            {selectedCards.length === 0 ? (
              <div className="h-40 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-center p-3 text-slate-400">
                <span className="text-2xl mb-1">⚡</span>
                <p className="text-xs font-semibold text-slate-300">
                  El tablero está vacío.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hacé clic en las tarjetas de la izquierda para armar el circuito.
                </p>
              </div>
            ) : (
              selectedCards.map((card, idx) => (
                <div
                  key={`${card.id}-${idx}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-cyan-400 font-bold">
                      {idx + 1}
                    </span>
                    <span>{card.icon}</span>
                    <span className="font-bold text-slate-100">{card.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveCard(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Subir"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveCard(idx, 'down')}
                      disabled={idx === selectedCards.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Bajar"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveCard(idx)}
                      className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer ml-1"
                      title="Quitar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Test Feedback Diagnostic */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs mb-3 flex items-start gap-2 animate-in fade-in ${
                testResult.isValid
                  ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleTestAlgorithm}
              disabled={isTesting || selectedCards.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5 fill-slate-200" />
              <span>{isTesting ? 'Probando...' : '🧪 Probar'}</span>
            </button>

            <button
              onClick={handleSubmitSolution}
              disabled={isSubmitting || selectedCards.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Enviando...' : '🚀 Enviar Solución Final'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
