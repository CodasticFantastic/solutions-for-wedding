import {useEffect, useState} from 'react'
import {DEFAULT_TILE_BACKGROUNDS} from '../acrylicTileEditor.config'

/**
 * useBackgroundImage – resolves background option id to an HTMLImageElement.
 * Returns null if transparent / none.
 */
export function useBackgroundImage(backgroundId: string | null | undefined) {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    // reset first
    setBgImage(null)
    if (!backgroundId) return

    const opt = DEFAULT_TILE_BACKGROUNDS.find((b) => b.id === backgroundId)
    if (!opt?.src) return

    const img = new window.Image()
    img.src = opt.src
    img.onload = () => setBgImage(img)
  }, [backgroundId])

  return bgImage
} 