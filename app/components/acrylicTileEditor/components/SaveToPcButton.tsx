import {useState} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {ChevronUp} from 'lucide-react'
import {useTileExporter} from '../hooks/useTileExporter'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'

/**
 * SaveToPcButton – lets the user export the current tile as a PNG file or JSON project data.
 * Provides options:
 *  - "PNG z tłem" – exports with the template background (if set)
 *  - "PNG bez tła" – hides the template background and exports with transparency
 *  - "JSON projekt" – exports complete project data for Shopify integration
 */
export const SaveToPcButton = () => {
  const [open, setOpen] = useState(false)
  const {exportAsPng, exportAsPngMulti, exportAsJson} = useTileExporter()
  const {state} = useAcrylicTileEditor()

  const download = (includeBackground: boolean) => {
    exportAsPng({includeBackground})
    setOpen(false)
  }

  const downloadAll = (includeBackground: boolean) => {
    exportAsPngMulti({includeBackground})
    setOpen(false)
  }

  const downloadJson = () => {
    exportAsJson()
    setOpen(false)
  }

  return (
    <div className="relative w-full">
      <Button variant="outline-primary" className="w-full" onClick={() => setOpen((o) => !o)}>
        Zapisz na PC
        <ChevronUp className="ml-2 h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 bottom-12 z-10 mt-1 w-full overflow-hidden rounded border bg-white shadow">
          <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => download(true)}>
            PNG z tłem
          </button>
          <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => download(false)}>
            PNG bez tła
          </button>
          <hr />
          <button type="button" className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={downloadJson}>
            JSON projekt
          </button>
          {state.dynamicVariants && state.dynamicVariants.length > 0 && (
            <>
              <hr />
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => downloadAll(true)}
              >
                PNG wszystkie warianty (z tłem)
              </button>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => downloadAll(false)}
              >
                PNG wszystkie warianty (bez tła)
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
