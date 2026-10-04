export type ScreenId =
  | 'HERO'
  | 'INTRO_QUESTIONS'
  | 'CYCLE_DIAGRAM'
  | 'ALGORITHM_THEORY'
  | 'PRECISION_CONCEPT'
  | 'PAPER_FIRST'
  | 'CHALLENGE_ORDER'
  | 'CHALLENGE_DEBUG'
  | 'CHALLENGE_BUILD'
  | 'CODE_BRIDGE'
  | 'SUMMARY'

export interface ScreenMeta {
  id: ScreenId
  title: string
  shortLabel: string
  phase: 'intro' | 'theory' | 'challenge' | 'code' | 'summary'
}

export const SCREENS: ScreenMeta[] = [
  { id: 'HERO', title: 'Portada', shortLabel: 'Inicio', phase: 'intro' },
  { id: 'INTRO_QUESTIONS', title: 'Preguntas Disparadoras', shortLabel: 'Introducción', phase: 'intro' },
  { id: 'CYCLE_DIAGRAM', title: 'El Recorrido del Pensamiento', shortLabel: 'Circuito', phase: 'theory' },
  { id: 'ALGORITHM_THEORY', title: '¿Qué es un Algoritmo?', shortLabel: 'Algoritmo', phase: 'theory' },
  { id: 'PRECISION_CONCEPT', title: 'La Computadora No Adivina', shortLabel: 'Precisión', phase: 'theory' },
  { id: 'PAPER_FIRST', title: 'Ahora te Toca a Vos', shortLabel: 'Sin Tecnología', phase: 'challenge' },
  { id: 'CHALLENGE_ORDER', title: 'Desafío 1: Ordenar', shortLabel: 'Desafío 1', phase: 'challenge' },
  { id: 'CHALLENGE_DEBUG', title: 'Desafío 2: Rompé el Programa', shortLabel: 'Desafío 2', phase: 'challenge' },
  { id: 'CHALLENGE_BUILD', title: 'Desafío Final: Creá la Solución', shortLabel: 'Desafío Final', phase: 'challenge' },
  { id: 'CODE_BRIDGE', title: '¿Y el Código?', shortLabel: 'Código Real', phase: 'code' },
  { id: 'SUMMARY', title: 'Resumen y Cierre', shortLabel: 'Resumen', phase: 'summary' },
]

export interface CycleStep {
  id: number
  icon: string
  name: string
  desc: string
  color: string
}

export const CYCLE_STEPS: CycleStep[] = [
  { id: 1, icon: '🧠', name: 'PENSAR', desc: 'Comprender el problema y razonar la solución lógica.', color: '#06b6d4' },
  { id: 2, icon: '✍️', name: 'ESCRIBIR', desc: 'Poner en palabras simples cada acción necesaria.', color: '#3b82f6' },
  { id: 3, icon: '🧩', name: 'ORDENAR', desc: 'Establecer la secuencia cronológica y dependencias.', color: '#8b5cf6' },
  { id: 4, icon: '▶️', name: 'EJECUTAR', desc: 'Poner a prueba los pasos siguiendo el orden exacto.', color: '#10b981' },
  { id: 5, icon: '🔎', name: 'DETECTAR', desc: 'Observar atentamente si surge algún comportamiento inesperado.', color: '#f59e0b' },
  { id: 6, icon: '🔧', name: 'CORREGIR', desc: 'Ajustar la instrucción defectuosa para reparar el flujo.', color: '#ec4899' },
  { id: 7, icon: '💻', name: 'PROGRAMAR', desc: 'Traducir el algoritmo validado al lenguaje de la máquina.', color: '#a855f7' },
]
