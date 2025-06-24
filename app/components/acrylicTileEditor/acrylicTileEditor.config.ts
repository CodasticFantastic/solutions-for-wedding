import { cmToPixels } from './acrylicTileEditor.types'

// Asset imports
import mirrorGoldUrl from '@/assets/editor/backgrounds/mirror-gold.png?url'
import mirrorSilverUrl from '@/assets/editor/backgrounds/mirror-silver.jpg?url'

export type TileSizeConfig = {
  id: string
  label: string
  widthCm: number
  heightCm: number
}

// Default tile sizes available in the editor (centimetres)
export const DEFAULT_TILE_SIZES: TileSizeConfig[] = [
  { id: '14x21', label: '14 × 21 cm', widthCm: 14, heightCm: 21 },
  { id: '15x15', label: '15 × 15 cm', widthCm: 15, heightCm: 15 },
  { id: '16x26', label: '16 × 26 cm', widthCm: 16, heightCm: 26 },
]

// Convenience helper – convert the configured cm dimensions to pixels using the
// same helper that is exposed publicly by the editor types. This can be useful
// when you need the pixel values directly.
export function tileSizeToPixels({ widthCm, heightCm }: TileSizeConfig) {
  return {
    width: cmToPixels(widthCm),
    height: cmToPixels(heightCm),
  }
}

// ---------------------------------------------------------------------------
// Shared visual constants
// ---------------------------------------------------------------------------
export const CORNER_RADIUS = 42

// ---------------------------------------------------------------------------
// Background options
// ---------------------------------------------------------------------------
export type BackgroundOption = {
  id: string
  label: string
  src: string | null
}

export const DEFAULT_TILE_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'transparent',
    label: 'Przezroczyste',
    src: null,
  },
  {
    id: 'mirror-gold',
    label: 'Złote lustro',
    src: mirrorGoldUrl,
  },
  {
    id: 'mirror-silver',
    label: 'Srebrne lustro',
    src: mirrorSilverUrl,
  },
] 