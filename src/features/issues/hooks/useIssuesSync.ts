
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:5000'

/**
 * Connects to the backend scan notification server and drives a live
 * isSyncing banner. Calls onScanComplete() when a scan finishes so the
 * caller can invalidate React Query caches.
 */
export function useIssuesSync(onScanComplete: () => void) {
  const [isSyncing, setIsSyncing] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket: Socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    socket.on('scan:started', () => {
      setIsSyncing(true)
    })

    socket.on('scan:progress', (_payload: { percent: number }) => {
      // Could surface percent in the banner if needed
      setIsSyncing(true)
    })

    socket.on('scan:completed', () => {
      setIsSyncing(false)
      onScanComplete() // triggers queryClient.invalidateQueries
    })

    socket.on('connect_error', (err: Error) => {
      console.warn('[IssuesSync] WebSocket error:', err.message)
    })

    return () => {
      socket.disconnect()
    }
  }, []) // stable — onScanComplete captured once via ref pattern if needed

  return { isSyncing }
}

