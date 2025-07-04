import {Button} from '@/components/shadCn/ui/button'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Badge} from '@/components/shadCn/ui/badge'
import {CaseSensitiveIcon} from 'lucide-react'

export const AddTextButton = () => {
  const {dispatch, isReadOnly} = useAcrylicTileEditor()

  const handleAddText = () => {
    dispatch({
      type: 'ADD_ELEMENT',
      payload: {
        id: `text-${Date.now()}`,
        type: 'text',
        x: 50,
        y: 50,
        // width: 200,
        // height: 50,
        rotation: 0,
        properties: {
          text: 'Change me please...',
          fontSize: 124,
          fontFamily: 'Inter',
          fontStyle: 'normal',
          align: 'center',
          fill: '#000000',
        },
      },
    })
  }

  return (
    <Button variant="outline" onClick={handleAddText} className="w-full" disabled={isReadOnly}>
      <Badge variant="outline">
        <CaseSensitiveIcon />
      </Badge>
      Dodaj Tekst
    </Button>
  )
}
