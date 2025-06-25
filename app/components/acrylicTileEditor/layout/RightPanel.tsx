import {Button} from '@/components/shadCn/ui/button'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {SaveToPcButton} from '../components/SaveToPcButton'
import {AddTextButton} from '../components/AddTextButton'
import {AddImageButton} from '../components/AddImageButton'
import {TextEditor} from '../components/TextEditor'

export const RightPanel = () => {
  const {state, dispatch, onSave} = useAcrylicTileEditor()
  return (
    <div className="flex h-full flex-col space-y-4 p-4 text-sm">
      <p className="mb-2 text-lg font-bold">Wybierz akcję</p>
      {/* Buttons */}
      <div className="space-y-2">
        <AddTextButton />
        <AddImageButton />
        <SaveToPcButton />
      </div>

      {/* Properties */}
      <TextEditor />

      <Button onClick={() => onSave?.({template: state.template, elements: state.elements})} variant="default" className="mt-auto w-full">
        Zapisz projekt
      </Button>
    </div>
  )
}
