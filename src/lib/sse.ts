type SSEEvent = { type: string; data: unknown }
type SSECallback = (event: SSEEvent) => void

class SSEManager {
  private clients: Map<string, Set<SSECallback>> = new Map()
  subscribe(restaurantId: string, callback: SSECallback): () => void {
    if (!this.clients.has(restaurantId)) this.clients.set(restaurantId, new Set())
    this.clients.get(restaurantId)!.add(callback)
    return () => { this.clients.get(restaurantId)?.delete(callback) }
  }
  emit(restaurantId: string, event: SSEEvent): void { this.clients.get(restaurantId)?.forEach((cb) => cb(event)) }
}
export const sseManager = new SSEManager()

export function createSSEStream(restaurantId: string): ReadableStream {
  let unsubscribe: (() => void) | null = null
  return new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      const sendEvent = (event: SSEEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      unsubscribe = sseManager.subscribe(restaurantId, sendEvent)
      controller.enqueue(encoder.encode(': connected\n\n'))
    },
    cancel() { if (unsubscribe) unsubscribe() },
  })
}
