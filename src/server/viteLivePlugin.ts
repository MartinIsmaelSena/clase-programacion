import type { Plugin, ViteDevServer } from 'vite'
import { WebSocketServer } from 'ws'
import { liveServer } from './liveServerLogic.ts'

export function liveServerPlugin(): Plugin {
  return {
    name: 'live-challenge-websocket-server',
    configureServer(server: ViteDevServer) {
      if (!server.httpServer) return

      const wss = new WebSocketServer({ noServer: true })

      server.httpServer.on('upgrade', (req, socket, head) => {
        if (req.url === '/live-ws') {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req)
          })
        }
      })

      wss.on('connection', (ws) => {
        const client = liveServer.handleConnection(ws)

        ws.on('message', (messageRaw: any) => {
          try {
            const data = JSON.parse(messageRaw.toString())

            switch (data.type) {
              case 'CREATE_SESSION': {
                const session = liveServer.createSession(data.challengeId)
                client.role = 'teacher'
                client.code = session.code
                ws.send(JSON.stringify({ type: 'SESSION_STATE_UPDATE', session }))
                break
              }

              case 'RESUBSCRIBE': {
                client.code = data.code
                const session = liveServer.getSession(data.code)
                if (session) {
                  ws.send(JSON.stringify({ type: 'SESSION_STATE_UPDATE', session }))
                }
                break
              }

              case 'JOIN_SESSION': {
                const result = liveServer.joinSession(data.code, data.firstName, data.lastName, client)
                ws.send(JSON.stringify({ type: 'JOIN_RESULT', ...result }))
                break
              }

              case 'START_SESSION': {
                liveServer.startSession(data.code)
                break
              }

              case 'SUBMIT_SOLUTION': {
                const result = liveServer.submitSolution(data.code, data.participantId, data.solution)
                ws.send(JSON.stringify({ type: 'SUBMIT_RESULT', ...result }))
                break
              }

              case 'FINISH_SESSION': {
                liveServer.finishSession(data.code)
                break
              }
            }
          } catch (e) {
            console.error('Error handling live message:', e)
          }
        })

        ws.on('close', () => {
          liveServer.handleDisconnect(client)
        })
      })
    },
  }
}
