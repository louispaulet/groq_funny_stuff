import { useState } from 'react'
import { callRemoteChat } from '../../lib/remoteChat'
import { createTemplatePayload } from './carMakerUtils'

const DEFAULT_IMAGE_API = 'https://groq-endpoint.louispaulet13.workers.dev'

export function useCarGeneration({ experience, configuration, summary, detailOptions, addGalleryEntry }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const apiBaseUrl = (experience?.imageApiBaseUrl || DEFAULT_IMAGE_API).replace(/\/$/, '')

  async function generate(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const template = createTemplatePayload({
        ...configuration,
        wheelCount: configuration.wheelCount.trim(),
        detailOptions,
      })

      const messages = [
        {
          role: 'system',
          content:
            'You are an automotive exterior stylist who writes high-end image prompts for hero car photography. Focus on what is visible and cinematic without mentioning internal mechanics.',
        },
        {
          role: 'user',
          content: template,
        },
      ]

      const chatResponse = await callRemoteChat(experience, messages, { model: experience?.defaultModel })
      const nextPrompt = typeof chatResponse?.content === 'string' ? chatResponse.content.trim() : ''
      if (!nextPrompt) {
        throw new Error('The prompt service returned an empty description.')
      }

      setPrompt(nextPrompt)

      const requestUrl = new URL(`${apiBaseUrl}/flux/${encodeURIComponent(nextPrompt)}`)
      const response = await fetch(requestUrl.toString())
      if (!response.ok) {
        throw new Error(`Image generation failed with status ${response.status}`)
      }

      const payload = await response.json()
      const image = payload?.images?.[0]?.url
      if (!image) {
        throw new Error('The image service did not return a usable URL.')
      }

      setImageUrl(image)

      addGalleryEntry({
        prompt: nextPrompt,
        url: image,
        summary,
        timestamp: Date.now(),
      })
    } catch (err) {
      setPrompt('')
      setImageUrl('')
      setError(err instanceof Error ? err.message : 'Unexpected error while generating your car image.')
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, prompt, imageUrl, generate }
}
