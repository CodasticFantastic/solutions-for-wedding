import {Button} from '@/components/shadCn/ui/button'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Label} from '@/components/shadCn/ui/label'
import {Input} from '@/components/shadCn/ui/input'

export const RightPanel = () => {
  const {state, dispatch, onSave} = useAcrylicTileEditor()
  const selected = state.elements.find((el) => el.id === state.selectedElementId)
  return (
    <div className="flex h-full flex-col space-y-4 p-4 text-sm">
      {/* Add buttons */}
      <div className="space-y-2">
        <Button
          variant="secondary"
          onClick={() =>
            dispatch({
              type: 'ADD_ELEMENT',
              payload: {
                id: `text-${Date.now()}`,
                type: 'text',
                x: 50,
                y: 50,
                width: 200,
                height: 50,
                rotation: 0,
                properties: {text: 'Nowy tekst', fontSize: 24, fill: '#000000'},
              },
            })
          }
          className="w-full"
        >
          + Tekst
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
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
                    width: 200,
                    height: 200,
                    rotation: 0,
                    properties: {src: evt.target?.result as string, alt: file.name},
                  },
                })
              }
              reader.readAsDataURL(file)
            }
            input.click()
          }}
          className="w-full"
        >
          + Obraz
        </Button>
      </div>

      {/* Properties */}
      {selected && (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="prop-text">Tekst</Label>
            {selected.type === 'text' && (
              <Input
                id="prop-text"
                type="text"
                value={selected.properties.text || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    payload: {
                      id: selected.id,
                      updates: {
                        properties: {...selected.properties, text: e.target.value},
                      },
                    },
                  })
                }
                className="w-full"
              />
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="prop-color">Kolor</Label>
            <Input
              id="prop-color"
              type="color"
              value={selected.properties.fill || '#000000'}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_ELEMENT',
                  payload: {
                    id: selected.id,
                    updates: {
                      properties: {...selected.properties, fill: e.target.value},
                    },
                  },
                })
              }
              className="h-8 w-full p-0"
            />
          </div>
        </div>
      )}

      <Button
        onClick={() => onSave?.({template: state.template, elements: state.elements})}
        variant="default"
        className="mt-auto w-full"
      >
        Zapisz projekt
      </Button>
    </div>
  )
}
