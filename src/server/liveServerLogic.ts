import { LIVE_CHALLENGES } from '../data/liveChallenges.ts'
import type { LiveSessionState, LiveParticipant, LiveChallengeConfig } from '../types.ts'

export interface WebSocketLike {
  send: (data: string) => void
  readyState?: number
}

interface ConnectedClient {
  id: string
  role: 'teacher' | 'student'
  code?: string
  participantId?: string
  socket: WebSocketLike
}

export class LiveChallengeServer {
  private sessions: Map<string, LiveSessionState> = new Map()
  private clients: Set<ConnectedClient> = new Set()
  // Secure teacher key (can be overridden via environment or default key)
  private teacherPasscode: string = process.env.VITE_TEACHER_KEY || 'docente2026'

  public handleConnection(socket: WebSocketLike): ConnectedClient {
    const client: ConnectedClient = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'student',
      socket,
    }
    this.clients.add(client)
    return client
  }

  public handleDisconnect(client: ConnectedClient) {
    this.clients.delete(client)
  }

  public verifyTeacher(passcode: string): boolean {
    return passcode === this.teacherPasscode
  }

  public createSession(challengeId: string): LiveSessionState {
    const challenge = LIVE_CHALLENGES.find((c: LiveChallengeConfig) => c.id === challengeId) || LIVE_CHALLENGES[0]
    // Generate clean short code like C0DE-42
    const randomNum = Math.floor(10 + Math.random() * 89)
    const code = `CODE-${randomNum}`

    const session: LiveSessionState = {
      code,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      status: 'WAITING',
      participants: [],
    }

    this.sessions.set(code, session)
    return session
  }

  public getSession(code: string): LiveSessionState | undefined {
    return this.sessions.get(code.toUpperCase().trim())
  }

  public joinSession(
    code: string,
    firstName: string,
    lastName: string,
    client: ConnectedClient
  ): { success: boolean; participant?: LiveParticipant; error?: string } {
    const cleanCode = code.toUpperCase().trim()
    const session = this.sessions.get(cleanCode)
    if (!session) {
      return { success: false, error: 'Código de desafío no encontrado. Verificá el código con tu docente.' }
    }

    if (session.status === 'FINISHED') {
      return { success: false, error: 'Este desafío ya ha finalizado.' }
    }

    // Check if participant already exists with that name
    let participant = session.participants.find(
      (p: LiveParticipant) => p.firstName.toLowerCase() === firstName.toLowerCase() && p.lastName.toLowerCase() === lastName.toLowerCase()
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

    client.code = cleanCode
    client.participantId = participant.id

    // Broadcast updated session state to all clients in room
    this.broadcastSession(cleanCode)

    return { success: true, participant }
  }

  public startSession(code: string): { success: boolean; error?: string } {
    const cleanCode = code.toUpperCase().trim()
    const session = this.sessions.get(cleanCode)
    if (!session) return { success: false, error: 'Sesión no encontrada' }

    session.status = 'ACTIVE'
    session.startedAt = Date.now()
    session.participants.forEach((p: LiveParticipant) => {
      if (p.status === 'JOINED') {
        p.status = 'SOLVING'
      }
    })

    this.broadcastSession(cleanCode)
    return { success: true }
  }

  public submitSolution(
    code: string,
    participantId: string,
    solution: any
  ): { success: boolean; isValid: boolean; message: string; rank?: number; timeFormatted?: string } {
    const cleanCode = code.toUpperCase().trim()
    const session = this.sessions.get(cleanCode)
    if (!session || session.status !== 'ACTIVE' || !session.startedAt) {
      return { success: false, isValid: false, message: 'El desafío no está activo.' }
    }

    const participant = session.participants.find((p: LiveParticipant) => p.id === participantId)
    if (!participant) {
      return { success: false, isValid: false, message: 'Participante no encontrado en esta sesión.' }
    }

    participant.tries += 1

    const challenge = LIVE_CHALLENGES.find((c: LiveChallengeConfig) => c.id === session.challengeId) || LIVE_CHALLENGES[0]
    const validation = challenge.validateSolution(solution)

    if (validation.isValid) {
      const now = Date.now()
      const elapsedMs = Math.max(0, now - session.startedAt)
      const seconds = Math.floor(elapsedMs / 1000)
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

      // Assign ranking based on verified completions count
      const completedCount = session.participants.filter((p: LiveParticipant) => p.status === 'COMPLETED').length
      const rank = completedCount + 1

      participant.status = 'COMPLETED'
      participant.finishTimeMs = elapsedMs
      participant.finishTimeFormatted = timeFormatted
      participant.rank = rank

      // Winner determination (First valid solution)
      if (rank === 1 && !session.winnerName) {
        session.winnerName = `${participant.firstName} ${participant.lastName}`
        session.winnerTime = timeFormatted
      }

      this.broadcastSession(cleanCode)

      return {
        success: true,
        isValid: true,
        message: validation.message,
        rank,
        timeFormatted,
      }
    } else {
      participant.status = 'ERROR'
      participant.lastMessage = validation.message
      this.broadcastSession(cleanCode)

      return {
        success: true,
        isValid: false,
        message: validation.message,
      }
    }
  }

  public finishSession(code: string): { success: boolean; session?: LiveSessionState } {
    const cleanCode = code.toUpperCase().trim()
    const session = this.sessions.get(cleanCode)
    if (!session) return { success: false }

    session.status = 'FINISHED'
    session.endedAt = Date.now()
    this.broadcastSession(cleanCode)
    return { success: true, session }
  }

  public broadcastSession(code: string) {
    const session = this.sessions.get(code)
    if (!session) return

    const payload = JSON.stringify({
      type: 'SESSION_STATE_UPDATE',
      session,
    })

    for (const client of this.clients) {
      if (client.code === code && client.socket.readyState === 1) {
        try {
          client.socket.send(payload)
        } catch {}
      }
    }
  }
}

export const liveServer = new LiveChallengeServer()
