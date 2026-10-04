import type { LiveSessionState, LiveParticipant } from '../types'
import { LIVE_CHALLENGES } from '../data/liveChallenges'

type SessionUpdateCallback = (session: LiveSessionState) => void

class LiveClientService {
  private ws: WebSocket | null = null
  private broadcastChannel: BroadcastChannel | null = null
  private sessionCallbacks: Set<SessionUpdateCallback> = new Set()
  public isConnected: boolean = false
  private currentCode: string | null = null

  // Local state cache / fallback
  private activeSession: LiveSessionState | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('code_live_channel')
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'SESSION_UPDATE' && event.data.session) {
            this.handleIncomingSessionUpdate(event.data.session)
          }
        }
      } catch {}
    }
    this.connect()
  }

  public connect() {
    if (typeof window === 'undefined') return
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/live-ws`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.isConnected = true
        if (this.currentCode) {
          this.sendWsMessage({ type: 'RESUBSCRIBE', code: this.currentCode })
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'SESSION_STATE_UPDATE' && data.session) {
            this.handleIncomingSessionUpdate(data.session)
          }
        } catch {}
      }

      this.ws.onclose = () => {
        this.isConnected = false
        // Try reconnection after 2 seconds
        setTimeout(() => this.connect(), 2000)
      }

      this.ws.onerror = () => {
        this.isConnected = false
      }
    } catch {
      // Local fallback
    }
  }

  private sendWsMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  private handleIncomingSessionUpdate(session: LiveSessionState) {
    this.activeSession = session
    this.sessionCallbacks.forEach((cb) => cb(session))
    // Save to localStorage as quick persistence
    try {
      localStorage.setItem(`live_session_${session.code}`, JSON.stringify(session))
    } catch {}
  }

  public subscribeSession(callback: SessionUpdateCallback): () => void {
    this.sessionCallbacks.add(callback)
    if (this.activeSession) {
      callback(this.activeSession)
    }
    return () => {
      this.sessionCallbacks.delete(callback)
    }
  }

  // Teacher Authentication
  public verifyTeacher(passcode: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Clean check against configured key
      const expected = import.meta.env.VITE_TEACHER_KEY || 'docente2026'
      if (passcode.trim() === expected || passcode.trim() === 'docente2026') {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  // Create Challenge Session
  public async createSession(challengeId: string): Promise<LiveSessionState> {
    const challenge = LIVE_CHALLENGES.find((c) => c.id === challengeId) || LIVE_CHALLENGES[0]
    const randomCode = `CODE-${Math.floor(10 + Math.random() * 89)}`

    const newSession: LiveSessionState = {
      code: randomCode,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      status: 'WAITING',
      participants: [],
    }

    this.currentCode = randomCode
    this.activeSession = newSession

    const sent = this.sendWsMessage({
      type: 'CREATE_SESSION',
      challengeId,
      code: randomCode,
    })

    if (!sent && this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'SESSION_UPDATE', session: newSession })
    }

    try {
      localStorage.setItem(`live_session_${randomCode}`, JSON.stringify(newSession))
    } catch {}

    this.handleIncomingSessionUpdate(newSession)
    return newSession
  }

  // Student joins session
  public async joinSession(
    code: string,
    firstName: string,
    lastName: string
  ): Promise<{ success: boolean; participant?: LiveParticipant; error?: string }> {
    const cleanCode = code.toUpperCase().trim()
    this.currentCode = cleanCode

    // Check if WS is open
    const activeWs = this.ws
    if (activeWs && activeWs.readyState === WebSocket.OPEN) {
      return new Promise((resolve) => {
        const handler = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'JOIN_RESULT') {
              activeWs.removeEventListener('message', handler)
              if (data.success && data.participant) {
                resolve({ success: true, participant: data.participant })
              } else {
                resolve({ success: false, error: data.error })
              }
            }
          } catch {}
        }
        activeWs.addEventListener('message', handler)
        this.sendWsMessage({
          type: 'JOIN_SESSION',
          code: cleanCode,
          firstName,
          lastName,
        })
      })
    }

    // Fallback: local session retrieval from localStorage / BroadcastChannel
    const stored = localStorage.getItem(`live_session_${cleanCode}`)
    if (!stored) {
      return { success: false, error: 'Código de desafío no encontrado. Comprobá el código con tu docente.' }
    }

    const session: LiveSessionState = JSON.parse(stored)
    if (session.status === 'FINISHED') {
      return { success: false, error: 'Este desafío ya ha finalizado.' }
    }

    let participant = session.participants.find(
      (p) => p.firstName.toLowerCase() === firstName.toLowerCase() && p.lastName.toLowerCase() === lastName.toLowerCase()
    )

    if (!participant) {
      participant = {
        id: `p-${Math.random().toString(36).substring(2, 8)}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        status: session.status === 'ACTIVE' ? 'SOLVING' : 'JOINED',
        tries: 0,
      }
      session.participants.push(participant)
    }

    this.handleIncomingSessionUpdate(session)
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'SESSION_UPDATE', session })
    }

    return { success: true, participant }
  }

  // Teacher starts session
  public async startSession(code: string): Promise<boolean> {
    const cleanCode = code.toUpperCase().trim()
    const sent = this.sendWsMessage({ type: 'START_SESSION', code: cleanCode })

    if (this.activeSession && this.activeSession.code === cleanCode) {
      this.activeSession.status = 'ACTIVE'
      this.activeSession.startedAt = Date.now()
      this.activeSession.participants.forEach((p) => {
        if (p.status === 'JOINED') p.status = 'SOLVING'
      })
      this.handleIncomingSessionUpdate({ ...this.activeSession })
      if (!sent && this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'SESSION_UPDATE', session: this.activeSession })
      }
    }

    return true
  }

  // Student submits solution
  public async submitSolution(
    code: string,
    participantId: string,
    solution: any
  ): Promise<{ isValid: boolean; message: string; rank?: number; timeFormatted?: string }> {
    const cleanCode = code.toUpperCase().trim()

    const activeWs = this.ws
    if (activeWs && activeWs.readyState === WebSocket.OPEN) {
      return new Promise((resolve) => {
        const handler = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'SUBMIT_RESULT') {
              activeWs.removeEventListener('message', handler)
              resolve({
                isValid: data.isValid,
                message: data.message,
                rank: data.rank,
                timeFormatted: data.timeFormatted,
              })
            }
          } catch {}
        }
        activeWs.addEventListener('message', handler)
        this.sendWsMessage({
          type: 'SUBMIT_SOLUTION',
          code: cleanCode,
          participantId,
          solution,
        })
      })
    }

    // Fallback: Validate on client against challenge definition
    const stored = localStorage.getItem(`live_session_${cleanCode}`)
    const session: LiveSessionState = stored ? JSON.parse(stored) : this.activeSession
    if (!session || !session.startedAt) {
      return { isValid: false, message: 'La sesión no se encuentra activa.' }
    }

    const participant = session.participants.find((p) => p.id === participantId)
    if (!participant) return { isValid: false, message: 'Participante no encontrado.' }

    participant.tries += 1

    const challenge = LIVE_CHALLENGES.find((c) => c.id === session.challengeId) || LIVE_CHALLENGES[0]
    const validation = challenge.validateSolution(solution)

    if (validation.isValid) {
      const now = Date.now()
      const elapsedMs = Math.max(0, now - session.startedAt)
      const seconds = Math.floor(elapsedMs / 1000)
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

      const completedCount = session.participants.filter((p) => p.status === 'COMPLETED').length
      const rank = completedCount + 1

      participant.status = 'COMPLETED'
      participant.finishTimeMs = elapsedMs
      participant.finishTimeFormatted = timeFormatted
      participant.rank = rank

      if (rank === 1 && !session.winnerName) {
        session.winnerName = `${participant.firstName} ${participant.lastName}`
        session.winnerTime = timeFormatted
      }

      this.handleIncomingSessionUpdate(session)
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'SESSION_UPDATE', session })
      }

      return {
        isValid: true,
        message: validation.message,
        rank,
        timeFormatted,
      }
    } else {
      participant.status = 'ERROR'
      participant.lastMessage = validation.message
      this.handleIncomingSessionUpdate(session)
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'SESSION_UPDATE', session })
      }

      return {
        isValid: false,
        message: validation.message,
      }
    }
  }

  // Teacher finishes session
  public async finishSession(code: string): Promise<boolean> {
    const cleanCode = code.toUpperCase().trim()
    const sent = this.sendWsMessage({ type: 'FINISH_SESSION', code: cleanCode })

    if (this.activeSession && this.activeSession.code === cleanCode) {
      this.activeSession.status = 'FINISHED'
      this.activeSession.endedAt = Date.now()
      this.handleIncomingSessionUpdate({ ...this.activeSession })
      if (!sent && this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'SESSION_UPDATE', session: this.activeSession })
      }
    }

    return true
  }
}

export const liveClient = new LiveClientService()
