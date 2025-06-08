import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(debateId?: string) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      socketRef.current = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
        path: '/api/socket',
      })
    }

    const socket = socketRef.current

    // Join debate room if debateId provided
    if (debateId) {
      socket.emit('join-debate', debateId)
    }

    return () => {
      if (debateId) {
        socket.emit('leave-debate', debateId)
      }
    }
  }, [debateId])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  return socketRef.current
}
