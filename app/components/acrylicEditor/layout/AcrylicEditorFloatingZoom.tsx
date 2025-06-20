import {Button} from '@/components/shadCn/ui/button'
import {useAcrylicEditorContext} from '../acrylicEditor.context'

export function AcrylicEditorFloatingZoom() {
  const {state, methods} = useAcrylicEditorContext()
  const {zoom = 1} = state
  const {handleZoomIn, handleZoomOut} = methods

  return (
    <div className="absolute right-4 bottom-20 z-10 hidden flex-col gap-2 md:hidden">
      <Button
        onClick={handleZoomOut as () => void}
        variant="secondary"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        disabled={zoom <= 1}
      >
        -
      </Button>
      <div className="bg-secondary text-secondary-foreground flex h-12 w-12 items-center justify-center rounded-full text-xs font-bold shadow-lg">
        {Math.round(zoom * 100)}%
      </div>
      <Button
        onClick={handleZoomIn as () => void}
        variant="secondary"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        disabled={zoom >= 3}
      >
        +
      </Button>
    </div>
  )
}
