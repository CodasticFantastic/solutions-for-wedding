import {useState} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {ChevronDown} from 'lucide-react'
import {useTileExporter} from '../hooks/useTileExporter'

/**
 * SaveToPcButton – lets the user export the current tile as a PNG file.
 * Provides two options:
 *  - "PNG z tłem" – exports with the template background (if set)
 *  - "PNG bez tła" – hides the template background and exports with transparency
 */
export const SaveToPcButton = () => {
  const [open, setOpen] = useState(false)
  const {exportAsPng} = useTileExporter()

  const download = (includeBackground: boolean) => {
    exportAsPng({includeBackground})
    setOpen(false)
  }

  return (
    <div className="relative w-full">
      <Button variant="outline" className="w-full" onClick={() => setOpen((o) => !o)}>
        Zapisz na PC
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-full overflow-hidden rounded border bg-white shadow">
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
            onClick={() => download(true)}
          >
            PNG z tłem
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
            onClick={() => download(false)}
          >
            PNG bez tła
          </button>
        </div>
      )}
    </div>
  )
}
