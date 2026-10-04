import React, { useState } from 'react'
import { sound } from '../../utils/sound'
import { ShieldCheck, Play, CheckCircle2, XCircle, ArrowRight, Clock, CreditCard, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'

interface ChallengeAccessProps {
  onAddScore: (points: number) => void
  onComplete: () => void
}

interface AccessRuleConfig {
  validCardAction: 'PERMITIR' | 'EVALUAR_HORARIO' | 'RECHAZAR'
  invalidCardAction: 'PERMITIR' | 'RECHAZAR'
  validScheduleAction: 'PERMITIR' | 'RECHAZAR'
  invalidScheduleAction: 'PERMITIR' | 'RECHAZAR'
}

interface TestCase {
  id: number
  card: 'Válida' | 'Inválida'
  cardValid: boolean
  time: string
  timeValid: boolean
  expected: 'Permitir' | 'Rechazar'
  actual?: 'Permitir' | 'Rechazar'
  passed?: boolean
}

const INITIAL_TEST_CASES: TestCase[] = [
  { id: 1, card: 'Válida', cardValid: true, time: '10:00', timeValid: true, expected: 'Permitir' },
  { id: 2, card: 'Inválida', cardValid: false, time: '10:00', timeValid: true, expected: 'Rechazar' },
  { id: 3, card: 'Válida', cardValid: true, time: '20:00', timeValid: false, expected: 'Rechazar' },
  { id: 4, card: 'Inválida', cardValid: false, time: '20:00', timeValid: false, expected: 'Rechazar' },
]

export const ChallengeAccessScreen: React.FC<ChallengeAccessProps> = ({
  onAddScore,
  onComplete,
}) => {
  // Decision configuration built by student
  const [config, setConfig] = useState<AccessRuleConfig>({
    validCardAction: 'EVALUAR_HORARIO',
    invalidCardAction: 'RECHAZAR',
    validScheduleAction: 'PERMITIR',
    invalidScheduleAction: 'RECHAZAR',
  })

  const [testCases, setTestCases] = useState<TestCase[]>(INITIAL_TEST_CASES)
  const [testing, setTesting] = useState(false)
  const [currentTestIdx, setCurrentTestIdx] = useState<number>(-1)
  const [passedCount, setPassedCount] = useState<number>(0)
  const [allPassed, setAllPassed] = useState<boolean>(false)
  const [hasScored, setHasScored] = useState(false)

  // Evaluation logic according to student's rule configuration
  const evaluateInput = (isCardValid: boolean, isTimeValid: boolean): 'Permitir' | 'Rechazar' => {
    if (!isCardValid) {
      return config.invalidCardAction === 'PERMITIR' ? 'Permitir' : 'Rechazar'
    }

    // Card is valid
    if (config.validCardAction === 'PERMITIR') {
      return 'Permitir'
    }
    if (config.validCardAction === 'RECHAZAR') {
      return 'Rechazar'
    }

    // Evaluates schedule
    if (isTimeValid) {
      return config.validScheduleAction === 'PERMITIR' ? 'Permitir' : 'Rechazar'
    } else {
      return config.invalidScheduleAction === 'PERMITIR' ? 'Permitir' : 'Rechazar'
    }
  }

  const handleRunTests = () => {
    if (testing) return
    setTesting(true)
    setCurrentTestIdx(0)
    setPassedCount(0)
    setAllPassed(false)
    sound.playClick()

    let runningPassed = 0
    const updatedCases: TestCase[] = [...INITIAL_TEST_CASES]

    const runCase = (idx: number) => {
      if (idx >= updatedCases.length) {
        setTesting(false)
        setCurrentTestIdx(-1)
        if (runningPassed === updatedCases.length) {
          setAllPassed(true)
          sound.playSuccess()
          if (!hasScored) {
            onAddScore(15)
            setHasScored(true)
          }
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } })
        } else {
          sound.playError()
        }
        return
      }

      setCurrentTestIdx(idx)
      const tc = updatedCases[idx]
      const actualResult = evaluateInput(tc.cardValid, tc.timeValid)
      const passed = actualResult === tc.expected
      if (passed) runningPassed++

      updatedCases[idx] = {
        ...tc,
        actual: actualResult,
        passed,
      }
      setTestCases([...updatedCases])
      setPassedCount(runningPassed)

      if (passed) {
        sound.playStep()
      } else {
        sound.playError()
      }

      setTimeout(() => {
        runCase(idx + 1)
      }, 550)
    }

    runCase(0)
  }

  const handleResetConfig = () => {
    sound.playClick()
    setConfig({
      validCardAction: 'PERMITIR',
      invalidCardAction: 'PERMITIR',
      validScheduleAction: 'PERMITIR',
      invalidScheduleAction: 'PERMITIR',
    })
    setTestCases(INITIAL_TEST_CASES)
    setPassedCount(0)
    setAllPassed(false)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Title */}
      <div className="text-center mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Desafío 3: Dos Condiciones (+15 pts)
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          DESAFÍO 3: Sistema de Acceso
        </h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto mt-1">
          Un algoritmo debe tomar decisiones combinando dos condiciones independientes: <span className="text-cyan-400 font-bold">tarjeta válida</span> y <span className="text-indigo-400 font-bold">horario permitido</span>.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mb-6">
        {/* Left: Logic Rule Builder */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <span className="text-xs font-mono uppercase text-slate-300 font-bold">
              Diseño de Decisiones Algorítmicas
            </span>
            <button
              onClick={handleResetConfig}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Condition 1: Card validity */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
                <CreditCard className="w-4 h-4" />
                <span>Condición 1: ¿La tarjeta es válida?</span>
              </div>

              <div className="space-y-2 pl-2 border-l-2 border-cyan-500/30 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Si es <strong className="text-emerald-400">VÁLIDA</strong>:</span>
                  <select
                    value={config.validCardAction}
                    onChange={(e) => {
                      sound.playClick()
                      setConfig({ ...config, validCardAction: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value="EVALUAR_HORARIO">Evaluar Horario ➔</option>
                    <option value="PERMITIR">Permitir Acceso</option>
                    <option value="RECHAZAR">Rechazar Acceso</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Si es <strong className="text-rose-400">INVÁLIDA</strong>:</span>
                  <select
                    value={config.invalidCardAction}
                    onChange={(e) => {
                      sound.playClick()
                      setConfig({ ...config, invalidCardAction: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value="RECHAZAR">Rechazar Acceso</option>
                    <option value="PERMITIR">Permitir Acceso</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Condition 2: Schedule */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold">
                <Clock className="w-4 h-4" />
                <span>Condición 2: ¿Está dentro del horario escolar (08:00 a 18:00)?</span>
              </div>

              <div className="space-y-2 pl-2 border-l-2 border-indigo-500/30 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Si el horario es <strong className="text-emerald-400">CORRECTO</strong>:</span>
                  <select
                    value={config.validScheduleAction}
                    onChange={(e) => {
                      sound.playClick()
                      setConfig({ ...config, validScheduleAction: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value="PERMITIR">Permitir Acceso</option>
                    <option value="RECHAZAR">Rechazar Acceso</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-300">Si el horario es <strong className="text-rose-400">INCORRECTO</strong>:</span>
                  <select
                    value={config.invalidScheduleAction}
                    onChange={(e) => {
                      sound.playClick()
                      setConfig({ ...config, invalidScheduleAction: e.target.value as any })
                      setAllPassed(false)
                    }}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    <option value="RECHAZAR">Rechazar Acceso</option>
                    <option value="PERMITIR">Permitir Acceso</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleRunTests}
              disabled={testing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{testing ? 'PROBANDO CASOS...' : '🧪 PROBAR ALGORITMO'}</span>
            </button>
          </div>
        </div>

        {/* Right: Test Suite Simulation Runner */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                Banco de Pruebas Automáticas
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  PRUEBAS SUPERADAS:
                </span>
                <span className={`px-2 py-0.5 rounded font-mono text-xs font-black ${
                  passedCount === 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-amber-300'
                }`}>
                  {passedCount}/4
                </span>
              </div>
            </div>

            {/* Test Case Table */}
            <div className="space-y-2 mb-4">
              {testCases.map((tc, idx) => {
                const isCurrent = currentTestIdx === idx
                return (
                  <div
                    key={tc.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400 scale-[1.01]'
                        : tc.passed === true
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : tc.passed === false
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center font-mono text-[10px] text-slate-400 font-bold">
                        {tc.id}
                      </span>
                      <div>
                        <span className="font-mono font-bold">
                          {tc.card}
                        </span>
                        <span className="text-slate-500 mx-1.5">•</span>
                        <span className="font-mono text-slate-400">
                          {tc.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block leading-none">Esperado</span>
                        <span className="font-mono font-bold text-slate-300">{tc.expected}</span>
                      </div>

                      {tc.actual && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block leading-none">Obtenido</span>
                          <span className={`font-mono font-bold ${tc.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {tc.actual}
                          </span>
                        </div>
                      )}

                      {tc.passed === true && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {tc.passed === false && <XCircle className="w-4 h-4 text-rose-400" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Test Completion Banner */}
          {allPassed && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs animate-in fade-in mb-3">
              <p className="font-black text-sm text-emerald-200 flex items-center gap-1.5 mb-0.5">
                <CheckCircle2 className="w-4 h-4" />
                🟢 ¡Tu algoritmo superó todas las pruebas!
              </p>
              Comprobaste que sólo se permite el acceso cuando ambas condiciones son ciertas simultáneamente.
            </div>
          )}

          {!allPassed && passedCount > 0 && !testing && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in mb-3">
              ❌ Algunas pruebas fallaron. Revisá qué acción toma el sistema cuando la tarjeta es inválida o el horario no corresponde.
            </div>
          )}
        </div>
      </div>

      {/* Button to Final Challenge */}
      {allPassed && (
        <button
          onClick={() => {
            sound.playClick()
            onComplete()
          }}
          className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer transition-all"
        >
          <span>IR AL DESAFÍO FINAL: SISTEMA DE SEGURIDAD (3 CONDICIONES)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
