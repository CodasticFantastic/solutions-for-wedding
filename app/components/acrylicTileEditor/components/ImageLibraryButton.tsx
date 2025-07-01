import {useState} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {Badge} from '@/components/shadCn/ui/badge'
import {Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose} from '@/components/shadCn/ui/sheet'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {ImageIcon} from 'lucide-react'

// Dynamically import all SVG files in the editor library as raw strings
// Note: use absolute-from-root pattern starting with '/'. '?raw' query ensures raw content.
const rawSvgs = import.meta.glob('/app/assets/editor/svg/*.svg', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

// Convert raw SVG string to base64 data URL for preview
const encodeBase64 = (str: string) => {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(unescape(encodeURIComponent(str)))
  }
  // Fallback: minimal polyfill
  // convert string to UTF-8 bytes then to base64
  return Buffer.from(unescape(encodeURIComponent(str)), 'binary').toString('base64')
}

const svgToDataUrl = (svg: string) => `data:image/svg+xml;base64,${encodeBase64(svg)}`

export const ImageLibraryButton = () => {
  const {dispatch} = useAcrylicTileEditor()
  const [color, setColor] = useState('#000000')

  const handleAddSvg = (rawSvg: string) => {
    // Insert element with default size (will adapt to image natural size later in SvgNode)
    dispatch({
      type: 'ADD_ELEMENT',
      payload: {
        id: `svg-${Date.now()}`,
        type: 'svg',
        x: 50,
        y: 50,
        rotation: 0,
        properties: {
          raw: rawSvg,
          fill: color,
        },
      } as any,
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full">
          <Badge variant="outline">
            <ImageIcon />
          </Badge>
          Baza obrazków
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Baza obrazków</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Color picker */}
          <div className="space-y-1">
            <label htmlFor="lib-color" className="text-sm font-medium">
              Kolor ikony
            </label>
            <input id="lib-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-full p-0" />
          </div>

          {/* Icon grid */}
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(rawSvgs).map(([path, raw]) => {
              const previewSrc = svgToDataUrl(raw)
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => handleAddSvg(raw)}
                  className="hover:bg-accent flex aspect-square items-center justify-center rounded border"
                >
                  <img src={previewSrc} alt="icon" className="max-h-full max-w-full" />
                </button>
              )
            })}
          </div>
        </div>
        <div className="border-t p-4">
          <SheetClose asChild>
            <Button variant="default" className="w-full">
              Zamknij
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
