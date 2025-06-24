export interface CanvasState {
  scale: number
  x: number
  y: number
  width: number
  height: number
}

export interface EditorState {
  canvas: CanvasState
  selectedElementId: string | null
  elements: EditorElement[]
  template: AcrylicTileTemplate
  currentFlowStep?: 'size' | 'background' | 'design'
}

export interface AcrylicTileTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface EditorElement {
  id: string
  type: 'text' | 'image'
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  properties: Record<string, any>
}

// ---------------------------------------------------------------------------
// Utility helpers – kept here to avoid extra files and keep the public API the
// same as before (generateFullTemplate is used by routes)
// ---------------------------------------------------------------------------

export const DEFAULT_DPI = 300

// Convert centimetres to pixels with given DPI (2.54 cm = 1 inch)
export function cmToPixels(cm: number, dpi: number = DEFAULT_DPI): number {
  return Math.round((cm * dpi) / 2.54)
}

export function pixelsToCm(px: number, dpi: number = DEFAULT_DPI): number {
  return (px * 2.54) / dpi
}

// Minimal input needed to build a pixel-based template
type RawTemplate = {
  id: string
  name: string
  realWidth: number // cm
  realHeight: number // cm
  category?: string // ignored but kept for compatibility
  backgroundColor?: string
  dpi?: number
}

export function generateFullTemplate({
  id,
  name,
  realWidth,
  realHeight,
  backgroundColor = '#ffffff',
  dpi = DEFAULT_DPI,
}: RawTemplate): AcrylicTileTemplate {
  return {
    id,
    name,
    width: cmToPixels(realWidth, dpi),
    height: cmToPixels(realHeight, dpi),
    backgroundColor,
  }
}
