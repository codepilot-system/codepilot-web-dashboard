import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

// Backend runs on 5000. Frontend on 3000. Don't mix them up.
const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:5000'

export function useIssuesSync(onScanComplete: () => void) {
  const [isSyncing, setIsSyncing] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // ── THE FIX: read the token from localStorage and send it in the
    //    socket auth payload. Without this the backend rejects the WS
    //    handshake with "HTTP Authentication failed".
    const token = localStorage.getItem('accessToken')

    if (!token) {
      // Not authenticated — don't even try to connect.
      // The HTTP 401 → redirect to /login is handled by axiosClient already.
      console.warn('[IssuesSync] No access token found, skipping WebSocket connection.')
      return
    }

    const socket: Socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      // ── Pass JWT so the backend's Socket.IO auth middleware accepts it ──
      auth: { token },
      // Some backends also accept it as a query param — add both to be safe:
      query: { token },
    })

    socketRef.current = socket

    socket.on('scan:started', () => {
      setIsSyncing(true)
    })

    socket.on('scan:progress', (_payload: { percent: number }) => {
      setIsSyncing(true)
    })

    socket.on('scan:completed', () => {
      setIsSyncing(false)
      onScanComplete()
    })

    socket.on('connect_error', (err: Error) => {
      // Downgrade log level — connection errors are expected if the backend
      // WS server isn't running. Don't spam the console with stack traces.
      console.warn('[IssuesSync] WebSocket connection error:', err.message)
    })

    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // Server kicked us — likely token expired. Stop trying.
        console.warn('[IssuesSync] Disconnected by server:', reason)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, []) // stable — runs once on mount

  return { isSyncing }
}