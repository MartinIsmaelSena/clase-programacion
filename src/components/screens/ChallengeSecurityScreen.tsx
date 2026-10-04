import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { ShieldAlert, Play, CheckCircle2, XCircle, ArrowRight, GitFork, Users, Clock, CreditCard, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ChallengeSecurityProps {
  onAddScore: (points: number) => void
  onComplete: () => void
}

interface TreeDecisions {
  node1_no: 'RECHAZAR' | 'PERMITIR'
  node1_si: 'HORARIO' | 'PERMITIR' | 'RECHAZAR'
  node2_no: 'RECHAZAR' | 'PERMITIR'
  node2_si: 'CAPACIDAD' | 'PERMITIR' | 'RECHAZAR'
  node3_si_llena: 'RECHAZAR' | 'PERMITIR'
  node3_no_llena: 'PERMITIR' | 'RECHAZAR'
}

interface SecurityTestCase {
  id: number
  desc: string
  card: boolean
  schedule: boolean
  occupancy: number // max 30
  expected: 'PERMITIR' | 'RECHAZAR'
  actual?: 'PERMITIR' | 'RECHAZAR'
  passed?: boolean
}

const INITIAL_SECURITY_TESTS: SecurityTestCase[] = [
  { id: 1, desc: 'Tarjeta no registrada en el sistema', card: false, schedule: true, occupancy: 12, expected: 'RECHAZAR' },
  { id: 2, desc: 'Tarjeta válida pero fuera de horario (21:30)', card: true, schedule: false, occupancy: 8, expected: 'RECHAZAR' },
  { id: 3, desc: 'Tarjeta y horario OK, pero sala al tope (30 personas)', card: true, schedule: true, occupancy: 30, expected: 'RECHAZAR' },
  { id: 4, desc: 'Estudiante autorizado, horario correcto y sala con 15 personas', card: true, schedule: true, occupancy: 15, expected: 'PERMITIR' },
]

export const ChallengeSecurityScreen: React.FC<ChallengeSecurityProps> = ({
  onAddScore,
  onComplete,
}) => {
  const [decisions, setDecisions] = useState<TreeDecisions>({
    node1_no: 'RECHAZAR',
    node1_si: 'HORARIO',
    node2_no: 'RECHAZAR',
    node2_si: 'CAPACIDAD',
    node3_si_llena: 'RECHAZAR',
    node3_no_llena: 'PERMITIR',
  })

  const [testCases, setTestCases] = useState<SecurityTestCase[]>(INITIAL_SECURITY_TESTS)
  const [testing, setTesting] = useState(false)
  const [activeTestIdx, setActiveTestIdx] = useState<number>(-1)
  const [passedCount, setPassedCount] = useState<number>(0)
  const [allPassed, setAllPassed] = useState<boolean>(false)
  const [hasScored, setHasScored] = useState(false)

  // Trace through tree decisions
  const traceAlgorithm = (cardValid: boolean, scheduleValid: boolean, occupancy: number): 'PERMITIR' | 'RECHAZAR' => {
    // Node 1: Card
    if (!cardValid) {
      return decisions.node1_no
    }
    if (decisions.node1_si === 'PERMITIR') return 'PERMITIR'
    if (decisions.node1_si === 'RECHAZAR') return 'RECHAZAR'

    // Node 2: Schedule
    if (!scheduleValid) {
      return decisions.node2_no
    }
    if (decisions.node2_si === 'PERMITIR') return 'PERMITIR'
    if (decisions.node2_si === 'RECHAZAR') return 'RECHAZAR'

    // Node 3: Capacity
    const isFull = occupancy >= 30
    if (isFull) {
      return decisions.node3_si_llena
    } else {
      return decisions.node3_no_llena
    }
  }

  const handleRunSecurityTests = () => {
    if (testing) return
    setTesting(true)
    setActiveTestIdx(0)
    setPassedCount(0)
    setAllPassed(false)
    sound.playClick()

    let runningPassed = 0
    const updated = [...INITIAL_SECURITY_TESTS]

    const runStep = (idx: number) => {
      if (idx >= updated.length) {
        setTesting(false)
        setActiveTestIdx(-1)
        if (runningPassed === updated.length) {
          setAllPassed(true)
          sound.playSuccess()
          if (!hasScored) {
            onAddScore(20)
            setHasScored(true)
          }
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } })
        } else {
          sound.playError()
        }
        return
      }

      setActiveTestIdx(idx)
      const tc = updated[idx]
      const actual = traceAlgorithm(tc.card, tc.schedule, tc.occupancy)
      const passed = actual === tc.expected
      if (passed) runningPassed++

      updated[idx] = { ...tc, actual, passed }
      setTestCases([...updated])
      setPassedCount(runningPassed)

      if (passed) sound.playStep()
      else sound.playError()

      setTimeout(() => {
        runStep(idx + 1)
      }, 550)
    }

    runStep(0)
  }

  const handleReset = () => {
    sound.playClick()
    setDecisions({
      node1_no: 'PERMITIR',
      node1_si: 'PERMITIR',
      node2_no: 'PERMITIR',
      node2_si: 'PERMITIR',
      node3_si_llena: 'PERMITIR',
      node3_no_llena: 'PERMITIR',
    })
    setTestCases(INITIAL_SECURITY_TESTS)
    setPassedCount(0)
    setAllPassed(false)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          Desafío Final Individual (+20 pts)
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          DESAFÍO FINAL: Sistema de Seguridad
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mt-0.5">
          Construí el árbol de decisiones completo controlando tres condiciones críticas: <span className="text-cyan-400 font-bold">tarjeta</span>, <span className="text-indigo-400 font-bold">horario</span> y <span className="text-amber-400 font-bold">aforo de sala (máx 30)</span>.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mb-4">
        {/* Visual Node Flow & Branches */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-cyan-400" />
              Árbol Lógico de Decisiones
            </span>
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar ramas</span>
            </button>
          </div>

          {/* Node 1: Card */}
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Nodo 1: ¿TARJETA VÁLIDA?
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">
                  Condición Inicial
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">Ruta 🔴 NO:</span>
                  <select
                    value={decisions.node1_no}
                    onChange={(e) => {
                      sound.playClick()
                      setDecisions({ ...decisions, node1_no: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs cursor-pointer"
                  >
                    <option value="RECHAZAR">⛔ RECHAZAR</option>
                    <option value="PERMITIR">🚪 PERMITIR</option>
                  </select>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">Ruta 🟢 SÍ:</span>
                  <select
                    value={decisions.node1_si}
                    onChange={(e) => {
                      sound.playClick()
                      setDecisions({ ...decisions, node1_si: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs cursor-pointer"
                  >
                    <option value="HORARIO">⏰ Pasar a ¿Horario?</option>
                    <option value="PERMITIR">🚪 PERMITIR</option>
                    <option value="RECHAZAR">⛔ RECHAZAR</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="w-0.5 h-2 bg-slate-800 mx-auto" />

            {/* Node 2: Schedule */}
            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Nodo 2: ¿HORARIO VÁLIDO?
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">
                  Segunda Verificación
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">Ruta 🔴 NO:</span>
                  <select
                    value={decisions.node2_no}
                    onChange={(e) => {
                      sound.playClick()
                      setDecisions({ ...decisions, node2_no: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs cursor-pointer"
                  >
                    <option value="RECHAZAR">⛔ RECHAZAR</option>
                    <option value="PERMITIR">🚪 PERMITIR</option>
                  </select>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">Ruta 🟢 SÍ:</span>
                  <select
                    value={decisions.node2_si}
                    onChange={(e) => {
                      sound.playClick()
                      setDecisions({ ...decisions, node2_si: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs cursor-pointer"
                  >
                    <option value="CAPACIDAD">👥 Pasar a ¿Sala Llena?</option>
                    <option value="PERMITIR">🚪 PERMITIR</option>
                    <option value="RECHAZAR">⛔ RECHAZAR</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="w-0.5 h-2 bg-slate-800 mx-auto" />

            {/* Node 3: Room Capacity */}
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Nodo 3: ¿SALA LLENA? (30 personas)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300">
                  Aforo Máximo
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">Ruta ⚠️ SÍ (Está llena):</span>
                  <select
                    value={decisions.node3_si_llena}
                    onChange={(e) => {
                      sound.playClick()
                      setDecisions({ ...decisions, node3_si_llena: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs cursor-pointer"
                  >
                    <option value="RECHAZAR">⛔ RECHAZAR</option>
                    <option value="PERMITIR">🚪 PERMITIR</option>
                  </select>
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block mb-1">Ruta 🟢 NO (Hay espacio):</span>
                  <select
                    value={decisions.node3_no_llena}
                    onChange={(e) => {
                      sound.playClick()
                      setDecisions({ ...decisions, node3_no_llena: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs cursor-pointer"
                  >
                    <option value="PERMITIR">🚪 PERMITIR</option>
                    <option value="RECHAZAR">⛔ RECHAZAR</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleRunSecurityTests}
              disabled={testing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{testing ? 'PROBANDO SEGURIDAD...' : '🧪 PROBAR ALGORITMO COMPLETO'}</span>
            </button>
          </div>
        </div>

        {/* Right: Security Test Scenarios */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                Casos de Seguridad
              </span>
              <span className={`px-2 py-0.5 rounded font-mono text-xs font-black ${
                passedCount === 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-cyan-300'
              }`}>
                {passedCount}/4
              </span>
            </div>

            <div className="space-y-2.5 mb-4">
              {testCases.map((tc, idx) => {
                const isCurrent = activeTestIdx === idx
                return (
                  <div
                    key={tc.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/20 border-cyan-400 scale-[1.01]'
                        : tc.passed === true
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : tc.passed === false
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        Caso {tc.id}: {tc.desc}
                      </span>
                      {tc.passed === true && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {tc.passed === false && <XCircle className="w-4 h-4 text-rose-400" />}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Esperado: <strong className="text-white">{tc.expected}</strong></span>
                      {tc.actual && (
                        <span>Obtenido: <strong className={tc.passed ? 'text-emerald-400' : 'text-rose-400'}>{tc.actual}</strong></span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {allPassed && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs animate-in fade-in mb-3">
              <p className="font-black text-sm text-emerald-200 flex items-center gap-1.5 mb-0.5">
                <CheckCircle2 className="w-4 h-4" />
                🎉 ¡SISTEMA DE SEGURIDAD VALIDADO! (+20 pts)
              </p>
              Tu algoritmo cubre de forma perfecta todas las combinaciones de condiciones posibles.
            </div>
          )}

          {!allPassed && passedCount > 0 && !testing && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in mb-3">
              ⚠️ Una de las reglas de seguridad no se cumplió. Asegurate de que el aforo rechace cuando la sala está llena.
            </div>
          )}
        </div>
      </div>

      {/* Button to Code Bridge */}
      {allPassed && (
        <button
          onClick={() => {
            sound.playClick()
            onComplete()
          }}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer transition-all"
        >
          <span>¿Y DÓNDE APARECE LA PROGRAMACIÓN? VER EL CÓDIGO</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
