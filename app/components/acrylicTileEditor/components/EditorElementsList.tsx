import {Button} from '@/components/shadCn/ui/button'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Badge} from '@/components/shadCn/ui/badge'

export const EditorElementsList = () => {
  const {state, dispatch} = useAcrylicTileEditor()

  return (
    <>
      <p className="mb-2 text-base font-semibold">Dodane Elementy</p>
      <ul className="list-none space-y-1 overflow-y-auto pl-0">
        {state.elements.map((el) => {
          const isSelected = state.selectedElement === el.id
          const label =
            el.type === 'text' ? el.properties.text || 'Tekst' : el.properties.alt || 'Obraz'
          return (
            <li key={el.id}>
              <Button
                variant={isSelected ? 'outline' : 'ghost'}
                size="sm"
                className="w-full justify-start space-x-0 px-1"
                onClick={() => dispatch({type: 'SELECT_ELEMENT', payload: el.id})}
              >
                <Badge variant="outline">{el.type === 'text' ? 'Tekst' : 'Obraz'}</Badge>
                {label}
              </Button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
