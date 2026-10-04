import React, { useState, useEffect } from 'react'
import { type ScreenId, type AppViewMode, SCREENS } from './types'
import { sound } from './utils/sound'
import { Header } from './components/Header'
import { FooterNav } from './components/FooterNav'
import { HeroScreen } from './components/screens/HeroScreen'
import { IntroQuestionsScreen } from './components/screens/IntroQuestionsScreen'
import { CycleDiagramScreen } from './components/screens/CycleDiagramScreen'
import { AlgorithmTheoryScreen } from './components/screens/AlgorithmTheoryScreen'
import { PrecisionConceptScreen } from './components/screens/PrecisionConceptScreen'
import { PaperFirstScreen } from './components/screens/PaperFirstScreen'
import { ChallengeOrderScreen } from './components/screens/ChallengeOrderScreen'
import { ChallengeDebugScreen } from './components/screens/ChallengeDebugScreen'
import { ChallengeAccessScreen } from './components/screens/ChallengeAccessScreen'
import { ChallengeSecurityScreen } from './components/screens/ChallengeSecurityScreen'
import { CodeBridgeScreen } from './components/screens/CodeBridgeScreen'
import { SummaryScreen } from './components/screens/SummaryScreen'
import { StudentLiveView } from './components/live/StudentLiveView'
import { TeacherLiveView } from './components/live/TeacherLiveView'

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<AppViewMode>('LESSON')

  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    const saved = localStorage.getItem('code_current_screen')
    return (saved as ScreenId) || 'HERO'
  })

  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('code_score')
    return saved ? parseInt(saved, 10) : 0
  })

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)

  useEffect(() => {
    localStorage.setItem('code_current_screen', currentScreen)
  }, [currentScreen])

  useEffect(() => {
    localStorage.setItem('code_score', score.toString())
  }, [score])

  const currentIndex = SCREENS.findIndex((s) => s.id === currentScreen)

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentScreen(SCREENS[currentIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (currentIndex < SCREENS.length - 1) {
      setCurrentScreen(SCREENS[currentIndex + 1].id)
    }
  }

  const handleAddScore = (points: number) => {
    setScore((prev) => prev + points)
  }

  const handleToggleSound = () => {
    const nextState = !soundEnabled
    setSoundEnabled(nextState)
    sound.setMuted(!nextState)
  }

  const handleRestart = () => {
    setScore(0)
    setCurrentScreen('HERO')
  }

  const handleReview = () => {
    setCurrentScreen('CYCLE_DIAGRAM')
  }

  // Keyboard navigation for presentation clicker / keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentScreen((prev) => {
          if (prev === 'HERO') return prev
          const idx = SCREENS.findIndex((s) => s.id === prev)
          if (idx < SCREENS.length - 1) {
            sound.playClick()
            return SCREENS[idx + 1].id
          }
          return prev
        })
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentScreen((prev) => {
          const idx = SCREENS.findIndex((s) => s.id === prev)
          if (idx > 0) {
            sound.playClick()
            return SCREENS[idx - 1].id
          }
          return prev
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 relative selection:bg-cyan-500 selection:text-black">
      {/* Background digital grid and tech glows */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <Header
        currentScreen={currentScreen}
        onSelectScreen={(id) => {
          setViewMode('LESSON')
          setCurrentScreen(id)
        }}
        score={score}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        viewMode={viewMode}
        onSelectViewMode={(mode) => setViewMode(mode)}
      />

      {/* Main Screen Container */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-2 py-3 sm:py-5">
        {/* Live Challenge Views */}
        {viewMode === 'LIVE_STUDENT' && (
          <StudentLiveView onBackToLesson={() => setViewMode('LESSON')} />
        )}

        {viewMode === 'LIVE_TEACHER' && (
          <TeacherLiveView onBackToLesson={() => setViewMode('LESSON')} />
        )}

        {/* Lesson Experience Screens */}
        {viewMode === 'LESSON' && (
          <>
            {currentScreen === 'HERO' && (
              <HeroScreen onStart={() => setCurrentScreen('INTRO_QUESTIONS')} />
            )}

            {currentScreen === 'INTRO_QUESTIONS' && (
              <IntroQuestionsScreen onComplete={() => setCurrentScreen('CYCLE_DIAGRAM')} />
            )}

            {currentScreen === 'CYCLE_DIAGRAM' && (
              <CycleDiagramScreen onComplete={() => setCurrentScreen('ALGORITHM_THEORY')} />
            )}

            {currentScreen === 'ALGORITHM_THEORY' && (
              <AlgorithmTheoryScreen
                onAddScore={handleAddScore}
                onComplete={() => setCurrentScreen('PRECISION_CONCEPT')}
              />
            )}

            {currentScreen === 'PRECISION_CONCEPT' && (
              <PrecisionConceptScreen
                onAddScore={handleAddScore}
                onComplete={() => setCurrentScreen('PAPER_FIRST')}
              />
            )}

            {currentScreen === 'PAPER_FIRST' && (
              <PaperFirstScreen onComplete={() => setCurrentScreen('CHALLENGE_ORDER')} />
            )}

            {currentScreen === 'CHALLENGE_ORDER' && (
              <ChallengeOrderScreen
                onAddScore={handleAddScore}
                onComplete={() => setCurrentScreen('CHALLENGE_DEBUG')}
              />
            )}

            {currentScreen === 'CHALLENGE_DEBUG' && (
              <ChallengeDebugScreen
                onAddScore={handleAddScore}
                onComplete={() => setCurrentScreen('CHALLENGE_ACCESS')}
              />
            )}

            {currentScreen === 'CHALLENGE_ACCESS' && (
              <ChallengeAccessScreen
                onAddScore={handleAddScore}
                onComplete={() => setCurrentScreen('CHALLENGE_SECURITY')}
              />
            )}

            {currentScreen === 'CHALLENGE_SECURITY' && (
              <ChallengeSecurityScreen
                onAddScore={handleAddScore}
                onComplete={() => setCurrentScreen('CODE_BRIDGE')}
              />
            )}

            {currentScreen === 'CODE_BRIDGE' && (
              <CodeBridgeScreen onComplete={() => setCurrentScreen('SUMMARY')} />
            )}

            {currentScreen === 'SUMMARY' && (
              <SummaryScreen
                score={score}
                onRestart={handleRestart}
                onReview={handleReview}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Navigation (when inside Lesson and not on Hero) */}
      {viewMode === 'LESSON' && (
        <FooterNav
          currentScreen={currentScreen}
          onPrev={handlePrev}
          onNext={handleNext}
          canGoNext={true}
          hideNext={currentScreen === 'HERO'}
        />
      )}
    </div>
  )
}

export default App
