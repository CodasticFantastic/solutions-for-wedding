import {Trash2} from 'lucide-react'
import {Button} from '../../shadCn/ui/button'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'

interface DeleteButtonProps {
  elementId: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  canvasScale: number
  canvasX: number
  canvasY: number
}

export function DeleteButton({elementId, x, y, width, height, rotation = 0, canvasScale, canvasX, canvasY}: DeleteButtonProps) {
  const {dispatch, isReadOnly} = useAcrylicTileEditor()

  const handleDelete = () => {
    if (!isReadOnly) {
      dispatch({type: 'REMOVE_ELEMENT', payload: elementId})
    }
  }

  // Calculate position relative to the canvas container
  // Position the button to the left of the element
  const buttonX = x * canvasScale + canvasX - 40 // 40px to the left
  const buttonY = y * canvasScale + canvasY + (height * canvasScale) / 2 // Center vertically

  return (
    <div
      className="absolute z-50"
      style={{
        left: buttonX,
        top: buttonY,
        transform: 'translateY(-50%)', // Center vertically
      }}
    >
      <Button variant="destructive" size="sm" onClick={handleDelete} className="h-8 w-8 p-0 shadow-lg" title="Usuń element">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
