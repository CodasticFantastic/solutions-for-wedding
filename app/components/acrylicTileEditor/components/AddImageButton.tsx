import {Button} from '@/components/shadCn/ui/button'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Badge} from '@/components/shadCn/ui/badge'
import {ImageIcon} from 'lucide-react'

export const AddImageButton = () => {
  const {dispatch} = useAcrylicTileEditor()

  const handleAddImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (evt) => {
        dispatch({
          type: 'ADD_ELEMENT',
          payload: {
            id: `image-${Date.now()}`,
            type: 'image',
            x: 50,
            y: 50,
            // width: 200,
            // height: ,
            // height: 200,
            rotation: 0,
            properties: {src: evt.target?.result as string, alt: file.name},
          },
        })
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <Button variant="outline" onClick={handleAddImage} className="w-full">
      <Badge variant="outline">
        <ImageIcon />
      </Badge>
      Dodaj Obraz
    </Button>
  )
}
