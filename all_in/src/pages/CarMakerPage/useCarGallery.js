import { useEffect, useState } from 'react'
import { clearCarGallery, readCarGallery, writeCarGallery } from '../../lib/carGalleryCookie'

export function useCarGallery(limit) {
  const [gallery, setGallery] = useState([])

  useEffect(() => {
    setGallery(readCarGallery())
  }, [])

  function addEntry(entry) {
    setGallery((current) => {
      const filtered = current.filter((item) => item.url !== entry.url)
      const nextGallery = [entry, ...filtered].slice(0, limit)
      writeCarGallery(nextGallery)
      return nextGallery
    })
  }

  function clear() {
    clearCarGallery()
    setGallery([])
  }

  return { gallery, addEntry, clear }
}
