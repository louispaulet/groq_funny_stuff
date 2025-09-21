import { useMemo } from 'react'
import OpenAI from 'openai'

export function useGroqClient() {
  return useMemo(() => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    return new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true,
    })
  }, [])
}

