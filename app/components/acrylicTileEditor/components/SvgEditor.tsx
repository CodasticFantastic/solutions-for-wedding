import {Label} from '@/components/shadCn/ui/label'
import {Input} from '@/components/shadCn/ui/input'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'

export const SvgEditor = () => {
  const {state, dispatch} = useAcrylicTileEditor()
  const selected = state.elements.find((el) => el.id === state.selectedElementId)

  if (!selected || selected.type !== 'svg') {
    return null
  }

  return (
    <div className="space-y-4">
      <p className="mb-2 text-lg font-bold">Edytuj ikonę</p>
      {/* Color Picker */}
      <div className="space-y-1">
        <Label htmlFor="prop-svg-color">Kolor</Label>
        <Input
          id="prop-svg-color"
          type="color"
          value={selected.properties.fill || '#000000'}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_ELEMENT',
              payload: {
                id: selected.id,
                updates: {
                  properties: {
                    ...selected.properties,
                    fill: e.target.value,
                  },
                },
              },
            })
          }
          className="h-8 w-full p-0"
        />
      </div>
    </div>
  )
} 