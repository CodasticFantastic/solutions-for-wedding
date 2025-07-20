import {Label} from '@/components/shadCn/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/shadCn/ui/select'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {useCallback} from 'react'

const ORIENTATION_OPTIONS = [
  {id: 'horizontal', label: 'Pozioma'},
  {id: 'vertical', label: 'Pionowa'},
]

export const OrientationSelector = () => {
  const {state, dispatch, isReadOnly} = useAcrylicTileEditor()

  const handleOrientationSelect = useCallback(
    (value: string) => {
      const newOrientation = value as 'horizontal' | 'vertical'

      // Don't update if orientation is the same
      if (newOrientation === state.template.orientation) {
        return
      }

      // Simple approach: just swap width and height when orientation changes
      // This assumes that the current dimensions are correct for the current orientation
      const newWidth = state.template.height
      const newHeight = state.template.width

      dispatch({
        type: 'UPDATE_TEMPLATE',
        payload: {
          orientation: newOrientation,
          width: newWidth,
          height: newHeight,
        },
      })
    },
    [dispatch, state.template.width, state.template.height, state.template.orientation],
  )

  return (
    <>
      <Label htmlFor="tile-orientation" className="text-base font-semibold">
        Orientacja płytki
      </Label>
      <Select
        value={state.template.orientation}
        onValueChange={handleOrientationSelect}
        disabled={isReadOnly}
        key={state.template.orientation}
      >
        <SelectTrigger id="tile-orientation" className="w-full">
          <SelectValue placeholder="Wybierz orientację" />
        </SelectTrigger>
        <SelectContent>
          {ORIENTATION_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
