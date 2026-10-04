// Standalone production Node server with WebSocket support for live challenges
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { WebSocketServer } from 'ws'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 5173
const DIST_DIR = path.join(__dirname, 'dist')

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0]
  if (reqPath === '/') reqPath = '/index.html'

  const filePath = path.join(DIST_DIR, reqPath)

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA client routing
      fs.readFile(path.join(DIST_DIR, 'index.html'), (errHtml, data) => {
        if (errHtml) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Not Found. Run `npm run build` first.')
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(data)
        }
      })
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    fs.readFile(filePath, (errRead, content) => {
      if (errRead) {
        res.writeHead(500)
        res.end('Server Error')
      } else {
        res.writeHead(200, { 'Content-Type': contentType })
        res.end(content)
      }
    })
  })
})

// Setup WebSocket Server for Live Challenges
const wss = new WebSocketServer({ noServer: true })

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/live-ws') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req)
    })
  }
})

// In-memory sessions storage
const sessions = new Map()

wss.on('connection', (ws) => {
  let _clientCode = null
  let _clientParticipantId = null

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw.toString())

      switch (data.type) {
        case 'CREATE_SESSION': {
          const session = {
            code: data.code,
            challengeId: data.challengeId,
            challengeTitle: data.challengeId === 'control_acceso' ? 'Control de Acceso a Sala' : 'Desafío en Vivo',
            status: 'WAITING',
            participants: [],
          }
          sessions.set(data.code, session)
          _clientCode = data.code
          ws.send(JSON.stringify({ type: 'SESSION_STATE_UPDATE', session }))
          break
        }

        case 'JOIN_SESSION': {
          const session = sessions.get(data.code)
          if (!session) {
            ws.send(JSON.stringify({ type: 'JOIN_RESULT', success: false, error: 'Código no encontrado.' }))
            return
          }
          let participant = session.participants.find(
            (p) => p.firstName.toLowerCase() === data.firstName.toLowerCase() && p.lastName.toLowerCase() === data.lastName.toLowerCase()
          )
          if (!participant) {
            participant = {
              id: `p-${Math.random().toString(36).substring(2, 8)}`,
              firstName: data.firstName.trim(),
              lastName: data.lastName.trim(),
              status: session.status === 'ACTIVE' ? 'SOLVING' : 'JOINED',
              tries: 0,
            }
            session.participants.push(participant)
          }
          _clientCode = data.code
          _clientParticipantId = participant.id
          ws.send(JSON.stringify({ type: 'JOIN_RESULT', success: true, participant }))
          broadcast(data.code)
          break
        }

        case 'START_SESSION': {
          const session = sessions.get(data.code)
          if (session) {
            session.status = 'ACTIVE'
            session.startedAt = Date.now()
            session.participants.forEach((p) => {
              if (p.status === 'JOINED') p.status = 'SOLVING'
            })
            broadcast(data.code)
          }
          break
        }

        case 'SUBMIT_SOLUTION': {
          const session = sessions.get(data.code)
          if (session && session.status === 'ACTIVE') {
            const participant = session.participants.find((p) => p.id === data.participantId)
            if (participant) {
              participant.tries += 1
              // Validation: must have all required steps in order
              const steps = data.solution?.steps || []
              const isValid = steps.includes('recibir_credencial') &&
                              steps.includes('leer_credencial') &&
                              steps.includes('verificar_credencial') &&
                              steps.includes('comprobar_horario') &&
                              steps.includes('comprobar_capacidad') &&
                              steps.includes('permitir')

              if (isValid) {
                const now = Date.now()
                const elapsedMs = Math.max(0, now - session.startedAt)
                const mins = Math.floor(elapsedMs / 60000)
                const secs = Math.floor((elapsedMs % 60000) / 1000)
                const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                const completed = session.participants.filter((p) => p.status === 'COMPLETED').length
                const rank = completed + 1

                participant.status = 'COMPLETED'
                participant.finishTimeMs = elapsedMs
                participant.finishTimeFormatted = timeFormatted
                participant.rank = rank

                if (rank === 1 && !session.winnerName) {
                  session.winnerName = `${participant.firstName} ${participant.lastName}`
                  session.winnerTime = timeFormatted
                }

                ws.send(JSON.stringify({ type: 'SUBMIT_RESULT', isValid: true, message: '¡Algoritmo correcto!', rank, timeFormatted }))
              } else {
                participant.status = 'ERROR'
                ws.send(JSON.stringify({ type: 'SUBMIT_RESULT', isValid: false, message: 'El algoritmo aún no cumple todas las comprobaciones de seguridad.' }))
              }
              broadcast(data.code)
            }
          }
          break
        }

        case 'FINISH_SESSION': {
          const session = sessions.get(data.code)
          if (session) {
            session.status = 'FINISHED'
            session.endedAt = Date.now()
            broadcast(data.code)
          }
          break
        }
      }
    } catch (e) {
      console.error(e)
    }
  })

  function broadcast(code) {
    const session = sessions.get(code)
    if (!session) return
    const payload = JSON.stringify({ type: 'SESSION_STATE_UPDATE', session })
    wss.clients.forEach((c) => {
      if (c.readyState === 1) {
        try { c.send(payload) } catch {}
      }
    })
  }
})

server.listen(PORT, () => {
  console.log(`CODE: Del Problema al Programa serving on http://localhost:${PORT}`)
})
