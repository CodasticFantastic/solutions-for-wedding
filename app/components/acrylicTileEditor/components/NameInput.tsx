import {Input} from '@/components/shadCn/ui/input'
import {Label} from '@/components/shadCn/ui/label'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'

export const NameInput = () => {
  const {state, dispatch, isReadOnly} = useAcrylicTileEditor()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({type: 'UPDATE_TEMPLATE', payload: {name: e.target.value}})
  }

  return (
    <>
      <Label htmlFor="pattern-name" className="text-base font-semibold">
        Nazwa wzoru
      </Label>
      <Input
        id="pattern-name"
        type="text"
        value={state.template.name}
        onChange={handleNameChange}
        className="w-full"
        disabled={isReadOnly}
      />
    </>
  )
}
