import { useRef, useState } from 'react'
import { extractDeltaText } from '../lib/stream'

export function useChatStream({ client, model, onDelta, onComplete, onError }) {
  const [loading, setLoading] = useState(false)
  const streamRef = useRef(null)
  const textRef = useRef('')

  async function start(inputText) {
    setLoading(true)
    textRef.current = ''
    try {
      try { streamRef.current?.abort?.() } catch {}
      const stream = await client.responses.stream({ model, input: inputText })
      streamRef.current = stream

      stream.on('response.output_text.delta', (delta) => {
        const piece = extractDeltaText(delta)
        if (piece) {
          textRef.current += piece
          onDelta?.(piece)
        }
      })

      stream.on?.('text.delta', (delta) => {
        const piece = extractDeltaText(delta)
        if (piece) {
          textRef.current += piece
          onDelta?.(piece)
        }
      })

      stream.on?.('message', (event) => {
        try {
          const type = event?.type || event?.event || ''
          if (type === 'response.output_text.delta' || type === 'text.delta') {
            const piece = extractDeltaText(event)
            if (piece) onDelta?.(piece)
          }
        } catch {}
      })

      let completedCalled = false
      stream.on('error', (err) => {
        onError?.(err)
      })

      stream.on?.('response.completed', (res) => {
        const text = res?.output_text ?? textRef.current
        completedCalled = true
        onComplete?.(text)
      })

      await stream.done()
      // Fallback: ensure onComplete fires once even if event was missed
      if (!completedCalled) {
        onComplete?.(textRef.current)
      }
    } catch (err) {
      onError?.(err)
    } finally {
      setLoading(false)
      streamRef.current = null
    }
  }

  function stop() {
    try { streamRef.current?.abort?.() } catch {}
    streamRef.current = null
    setLoading(false)
  }

  return { loading, start, stop }
}
