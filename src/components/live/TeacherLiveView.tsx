import React, { useState, useEffect } from 'react'
import { sound } from '../../utils/sound'
import { liveClient } from '../../services/liveClient'
import { LIVE_CHALLENGES } from '../../data/liveChallenges'
import type { LiveSessionState } from '../../types'
import { Lock, Play, Trophy, Users, Clock, CheckCircle2, ArrowLeft, Copy, Check, RefreshCw } from 'lucide-react'
import confetti from 'canvas-confetti'

interface TeacherLiveViewProps {
  onBackToLesson: () => void
}

export const TeacherLiveView: React.FC<TeacherLiveViewProps> = ({ onBackToLesson }) => {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('teacher_authenticated') === 'true'
  })
  const [passcode, setPasscode] = useState<string>('')
  const [authError, setAuthError] = useState<string | null>(null)

  // Session state
  const [session, setSession] = useState<LiveSessionState | null>(null)
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(LIVE_CHALLENGES[0].id)
  const [copiedCode, setCopiedCode] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0)

  // Teacher Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    const valid = await liveClient.verifyTeacher(passcode)
    if (valid) {
      sound.playSuccess()
      setIsAuthenticated(true)
      sessionStorage.setItem('teacher_authenticated', 'true')
    } else {
      sound.playError()
      setAuthError('Clave de acceso incorrecta.')
    }
  }

  // Subscribe to real-time session updates
  useEffect(() => {
    const unsubscribe = liveClient.subscribeSession((updated) => {
      setSession({ ...updated })
    })
    return () => unsubscribe()
  }, [])

  // Synchronized timer when session is ACTIVE
  useEffect(() => {
    if (!session || session.status !== 'ACTIVE' || !session.startedAt) return

    const interval = setInterval(() => {
      const now = Date.now()
      const diff = Math.max(0, Math.floor((now - session.startedAt!) / 1000))
      setElapsedSeconds(diff)
    }, 500)

    return () => clearInterval(interval)
  }, [session])

  // Fire confetti and chime when winner is announced
  useEffect(() => {
    if (session?.winnerName) {
      sound.playSuccess()
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } })
    }
  }, [session?.winnerName])

  // Create Challenge
  const handleCreateChallenge = async () => {
    sound.playClick()
    const newSession = await liveClient.createSession(selectedChallengeId)
    setSession(newSession)
  }

  // Start Challenge
  const handleStartChallenge = async () => {
    if (!session) return
    sound.playSuccess()
    await liveClient.startSession(session.code)
  }

  // Finish Challenge
  const handleFinishChallenge = async () => {
    if (!session) return
    sound.playSuccess()
    await liveClient.finishSession(session.code)
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopyCode = () => {
    if (!session) return
    sound.playClick()
    navigator.clipboard.writeText(session.code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // View: Login required
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Panel del Docente</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Ingresá tu clave de acceso para administrar desafíos en vivo.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Clave docente..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-sm font-mono text-white tracking-widest focus:border-cyan-500 focus:outline-none"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-rose-400 mt-1.5">{authError}</p>
              )}
            </div>

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
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
              >
                Ingresar
              </button>
            </div>
          </form>

          <p className="text-[11px] text-slate-500 mt-4 font-mono">
            Clave predeterminada: <span className="text-slate-400 font-bold">docente2026</span>
          </p>
        </div>
      </div>
    )
  }

  // View: Create Session screen
  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-2xl mx-auto w-full">
        <div className="w-full flex items-center justify-between mb-6">
          <button
            onClick={onBackToLesson}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la clase</span>
          </button>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            Modo Docente Activo
          </span>
        </div>

        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-1">Crear Desafío en Vivo</h2>
          <p className="text-xs text-slate-400 mb-5">
            Seleccioná la misión lógica que querés habilitar para tus estudiantes:
          </p>

          <div className="space-y-3 mb-6">
            {LIVE_CHALLENGES.map((ch) => (
              <label
                key={ch.id}
                onClick={() => setSelectedChallengeId(ch.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedChallengeId === ch.id
                    ? 'bg-cyan-500/10 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="challengeSelect"
                  checked={selectedChallengeId === ch.id}
                  onChange={() => setSelectedChallengeId(ch.id)}
                  className="mt-1 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-white">{ch.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{ch.description}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleCreateChallenge}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer transition-all"
          >
            <span>🚀 HABILITAR DESAFÍO Y GENERAR CÓDIGO</span>
          </button>
        </div>
      </div>
    )
  }

  // Sort participants by rank (completed first, then solving)
  const sortedParticipants = [...session.participants].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank
    if (a.rank) return -1
    if (b.rank) return 1
    return 0
  })

  const completedCount = session.participants.filter((p) => p.status === 'COMPLETED').length
  const reviewingCount = session.participants.filter((p) => p.status === 'ERROR' || p.tries > 0 && p.status !== 'COMPLETED').length

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <button
          onClick={onBackToLesson}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la clase</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Desafío: <strong className="text-slate-200">{session.challengeTitle}</strong>
          </span>
          <button
            onClick={() => {
              sound.playClick()
              setSession(null)
            }}
            className="text-xs font-mono text-slate-400 hover:text-rose-400 cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Nuevo Desafío</span>
          </button>
        </div>
      </div>

      {/* Code & Session Status Banner */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        {/* Short Access Code */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/40 shadow-xl flex flex-col items-center justify-center text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">
            Código para Estudiantes
          </span>
          <div className="flex items-center gap-2 my-1">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              {session.code}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="Copiar código"
            >
              {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Los estudiantes ingresan en "⚡ Desafío en Vivo" con este código.
          </p>
        </div>

        {/* State & Timer Control */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Estado:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                session.status === 'WAITING'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : session.status === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {session.status === 'WAITING' && '🟡 SALA DE ESPERA'}
                {session.status === 'ACTIVE' && '🟢 EN CURSO'}
                {session.status === 'FINISHED' && '🏁 FINALIZADO'}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-sm font-bold text-white bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>⏱️ {formatTimer(elapsedSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {session.status === 'WAITING' && (
              <button
                onClick={handleStartChallenge}
                disabled={session.participants.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-40"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>INICIAR DESAFÍO ({session.participants.length} conectados)</span>
              </button>
            )}

            {session.status === 'ACTIVE' && (
              <button
                onClick={handleFinishChallenge}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer"
              >
                <span>🏁 FINALIZAR DESAFÍO Y MOSTRAR PODIO</span>
              </button>
            )}

            {session.status === 'FINISHED' && (
              <div className="text-xs font-mono text-slate-300 text-center w-full">
                Desafío concluido • Revisá el podio y las soluciones registradas debajo.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Winner Spotlight Banner if First Place Finished */}
      {session.winnerName && (
        <div className="w-full p-4 mb-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)] flex items-center justify-between animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
              🥇
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block leading-none">
                ¡TENEMOS GANADOR EN VIVO!
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                {session.winnerName}
              </h3>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-xs text-slate-400 block">Tiempo récord:</span>
            <span className="text-xl font-black text-amber-300">{session.winnerTime}</span>
          </div>
        </div>
      )}

      {/* Finished Podium View */}
      {session.status === 'FINISHED' && (
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-6 shadow-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold mb-4">
            <Trophy className="w-4 h-4" />
            <span>PODIO OFICIAL DEL DESAFÍO</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* 1st Place */}
            <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)] order-1 md:order-2">
              <span className="text-4xl block mb-1">🥇</span>
              <span className="text-xs font-mono uppercase text-amber-400 font-bold block">1° Lugar</span>
              <h4 className="text-lg font-black text-white mt-0.5">
                {sortedParticipants[0] ? `${sortedParticipants[0].firstName} ${sortedParticipants[0].lastName}` : '—'}
              </h4>
              <span className="text-xs font-mono text-amber-200 mt-1 block">
                {sortedParticipants[0]?.finishTimeFormatted || '—'}
              </span>
            </div>

            {/* 2nd Place */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-700 order-2 md:order-1">
              <span className="text-3xl block mb-1">🥈</span>
              <span className="text-xs font-mono uppercase text-slate-400 font-bold block">2° Lugar</span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {sortedParticipants[1] ? `${sortedParticipants[1].firstName} ${sortedParticipants[1].lastName}` : '—'}
              </h4>
              <span className="text-xs font-mono text-slate-400 mt-1 block">
                {sortedParticipants[1]?.finishTimeFormatted || '—'}
              </span>
            </div>

            {/* 3rd Place */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-700 order-3 md:order-3">
              <span className="text-3xl block mb-1">🥉</span>
              <span className="text-xs font-mono uppercase text-slate-400 font-bold block">3° Lugar</span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {sortedParticipants[2] ? `${sortedParticipants[2].firstName} ${sortedParticipants[2].lastName}` : '—'}
              </h4>
              <span className="text-xs font-mono text-slate-400 mt-1 block">
                {sortedParticipants[2]?.finishTimeFormatted || '—'}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-around gap-3 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL PARTICIPANTES</span>
              <strong className="text-base text-white">{session.participants.length}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SOLUCIONES CORRECTAS</span>
              <strong className="text-base text-emerald-400">{completedCount}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">NECESITAN REVISIÓN</span>
              <strong className="text-base text-amber-400">{reviewingCount}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Participants Live Table */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Participantes ({session.participants.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Actualización en tiempo real
          </span>
        </div>

        {session.participants.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-mono text-xs">
            Aún no hay estudiantes conectados. Compartí el código <strong className="text-cyan-400">{session.code}</strong>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 pl-2">Posición</th>
                  <th className="pb-2">Estudiante</th>
                  <th className="pb-2">Estado</th>
                  <th className="pb-2">Intentos</th>
                  <th className="pb-2 text-right pr-2">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 pl-2">
                      {p.rank ? (
                        <span className={`px-2 py-0.5 rounded font-black ${
                          p.rank === 1 ? 'bg-amber-500 text-slate-950' : p.rank === 2 ? 'bg-slate-300 text-slate-950' : p.rank === 3 ? 'bg-amber-700 text-white' : 'text-slate-400'
                        }`}>
                          {p.rank}°
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 font-bold text-slate-200">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="py-2.5">
                      {p.status === 'COMPLETED' && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completado</span>
                        </span>
                      )}
                      {p.status === 'SOLVING' && (
                        <span className="text-amber-400 font-medium">🟡 Resolviendo</span>
                      )}
                      {p.status === 'JOINED' && (
                        <span className="text-cyan-400 font-medium">🟢 En espera</span>
                      )}
                      {p.status === 'ERROR' && (
                        <span className="text-rose-400 font-medium">⚠️ En revisión</span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {p.tries} {p.tries === 1 ? 'intento' : 'intentos'}
                    </td>
                    <td className="py-2.5 text-right pr-2 text-slate-300 font-bold">
                      {p.finishTimeFormatted || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
