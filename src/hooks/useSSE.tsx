'use client'
import { useEffect, useState, useCallback } from 'react'
import { SSEEvent, OrderData } from '@/types'

interface UseSSEOptions {
  restaurantId: string
  onOrderCreated?: (order: OrderData) => void
  onOrderUpdated?: (order: OrderData) => void
  onOrderDeleted?: (orderId: string) => void
}

export function useSSE({ restaurantId, onOrderCreated, onOrderUpdated, onOrderDeleted }: UseSSEOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null)

  useEffect(() => {
    if (!restaurantId) return
    const eventSource = new EventSource(`/api/sse?restaurantId=${restaurantId}`)
    eventSource.onopen = () => setIsConnected(true)
    eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data)
        setLastEvent(data)
        if (data.type === 'order:created') onOrderCreated?.(data.data)
        if (data.type === 'order:updated') onOrderUpdated?.(data.data)
        if (data.type === 'order:deleted') onOrderDeleted?.(data.data.id)
      } catch (error) { console.error('Failed to parse SSE event:', error) }
    }
    eventSource.onerror = () => { setIsConnected(false); eventSource.close() }
    return () => { eventSource.close(); setIsConnected(false) }
  }, [restaurantId, onOrderCreated, onOrderUpdated, onOrderDeleted])

  return { isConnected, lastEvent }
}
