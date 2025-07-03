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
import {InfoIcon, SquareMousePointerIcon} from 'lucide-react'

export const LeftPanel = () => {
  const [selectedAction, setSelectedAction] = useState<'BASIC_INFO' | 'EDITOR'>('BASIC_INFO')
  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4">
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

      {selectedAction === 'BASIC_INFO' && (
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
      )}

      {selectedAction === 'EDITOR' && (
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
