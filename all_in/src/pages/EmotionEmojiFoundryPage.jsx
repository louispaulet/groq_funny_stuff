import { useMemo } from 'react'
import EmotionEmojiFoundry from '../components/emotion-foundry/EmotionEmojiFoundry'

export default function EmotionEmojiFoundryPage({ experience }) {
  const apiBaseUrl = useMemo(() => {
    const baseUrl =
      experience?.svgApiBaseUrl ||
      experience?.defaultBaseUrl ||
      'https://groq-endpoint.louispaulet13.workers.dev'

    return baseUrl.replace(/\/$/, '')
  }, [experience])

  return <EmotionEmojiFoundry svgApiBaseUrl={apiBaseUrl} />
}
