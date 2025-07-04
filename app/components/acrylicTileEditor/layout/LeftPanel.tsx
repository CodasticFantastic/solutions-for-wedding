import {useState} from 'react'
import {BackgroundSelector} from '../components/BackgroundSelector'
import {EditorElementsList} from '../components/EditorElementsList'
import {NameInput} from '../components/NameInput'
import {SizeSelector} from '../components/SizeSelector'
import {AddTextButton} from '../components/AddTextButton'
import {AddImageButton} from '../components/AddImageButton'
import {ImageLibraryButton} from '../components/ImageLibraryButton'
import {Button} from '@/components/shadCn/ui/button'
import {TextEditor} from '../components/TextEditor'
import {SvgEditor} from '../components/SvgEditor'
import {InfoIcon, SquareMousePointerIcon, EyeIcon} from 'lucide-react'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Alert, AlertDescription, AlertTitle} from '@/components/shadCn/ui/alert'

export const LeftPanel = () => {
  const [selectedAction, setSelectedAction] = useState<'BASIC_INFO' | 'EDITOR'>('BASIC_INFO')
  const {isReadOnly} = useAcrylicTileEditor()

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4">
      {isReadOnly && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTitle className="flex items-center gap-2 text-yellow-800">
            <EyeIcon className="h-4 w-4" /> <strong>Tryb podglądu</strong>
          </AlertTitle>
          <AlertDescription className="text-sm text-yellow-800">
            Ten szablon jest w trybie tylko do odczytu. Nie można go edytować.
            <br />
            <br />
            Jeżeli potrzebujesz edytować jakieś informację pilnie skontaktuj się z nami.
          </AlertDescription>
        </Alert>
      )}

      {!isReadOnly && (
        <>
          <p className="mb-2 text-lg font-bold">Co chcesz edytować?</p>
          <div className="w-full space-y-2">
            <Button
              variant={selectedAction === 'BASIC_INFO' ? 'default' : 'outline'}
              onClick={() => setSelectedAction('BASIC_INFO')}
              className="w-full"
            >
              <InfoIcon size={16} /> Informacje Podstawowe
            </Button>
            <Button
              variant={selectedAction === 'EDITOR' ? 'default' : 'outline'}
              onClick={() => setSelectedAction('EDITOR')}
              className="w-full"
            >
              <SquareMousePointerIcon size={16} /> Elementy projektu
            </Button>
          </div>
          <hr className="mt-0 mb-4" />
        </>
      )}

      {(!isReadOnly && selectedAction === 'BASIC_INFO') || isReadOnly ? (
        <>
          {/* Template name */}
          <div className="space-y-2">
            <NameInput />
          </div>

          {/* Template size */}
          <div className="space-y-2">
            <SizeSelector />
          </div>

          {/* Background selector */}
          <div className="space-y-2">
            <BackgroundSelector />
          </div>
        </>
      ) : null}

      {selectedAction === 'EDITOR' && !isReadOnly && (
        <>
          <div className="space-y-2">
            <AddTextButton />
            <AddImageButton />
            <ImageLibraryButton />
          </div>

          <hr className="my-4" />

          <TextEditor />
          <SvgEditor />
        </>
      )}
    </div>
  )
}
