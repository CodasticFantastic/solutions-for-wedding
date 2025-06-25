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
  backgroundImage: string | null;
  orientation: 'horizontal' | 'vertical';
}

// ---------------------------------------------------------------------------
// Element definitions
// ---------------------------------------------------------------------------

// Common fields shared by all element types
interface BaseElement {
  id: string
  x: number
  y: number
  /** Width in pixels – optional for text, required for image */
  width?: number
  /** Height in pixels – optional for text, required for image */
  height?: number
  /** Rotation in degrees */
  rotation?: number
}

// --- Text element -----------------------------------------------------------
export interface TextElementProperties {
  text: string
  fontSize: number
  fontFamily: string
  /** 'normal' | 'bold' | 'italic' | 'bold italic' */
  fontStyle: string
  /** Horizontal alignment */
  align: 'left' | 'center' | 'right'
  /** Fill color in hex format */
  fill: string
}

export interface EditorTextElement extends BaseElement {
  type: 'text'
  properties: TextElementProperties
}

// --- Image element ----------------------------------------------------------
export interface ImageElementProperties {
  /** Data URL or remote URL of the image */
  src: string
  /** Alternative text */
  alt: string
}

export interface EditorImageElement extends BaseElement {
  type: 'image'
  // For images, width & height should always be defined, so we reiterate here
  width: number
  height: number
  properties: ImageElementProperties
}

// Combined discriminated union of supported element types
export type EditorElement = EditorTextElement | EditorImageElement

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
  backgroundImage?: string
  dpi: number
  orientation: 'horizontal' | 'vertical'
}

export function generateFullTemplate({
  id,
  name,
  realWidth,
  realHeight,
  backgroundImage = 'transparent',
  dpi = DEFAULT_DPI,
  orientation = 'horizontal',
}: RawTemplate): AcrylicTileTemplate {
  const widthPx = orientation === 'vertical' ? cmToPixels(realWidth, dpi) : cmToPixels(realHeight, dpi)
  const heightPx = orientation === 'vertical' ? cmToPixels(realHeight, dpi) : cmToPixels(realWidth, dpi)

  return {
    id,
    name,
    width: widthPx,
    height: heightPx,
    backgroundImage,
    orientation,
  }
}
