import {SaveToPcButton} from '../components/SaveToPcButton'
import {SaveToAccountButton} from '../components/SaveToAccountButton'
import {VariantsPanel} from '../components/VariantsPanel'
import {EditorElementsList} from '../components/EditorElementsList'
import {useState} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {LayersIcon, LayoutTemplateIcon} from 'lucide-react'

export const RightPanel = () => {
  const [selectedAction, setSelectedAction] = useState<'ELEMENTS_LIST' | 'VARIANTS'>('ELEMENTS_LIST')
  return (
    <div className="flex h-full flex-col space-y-4 p-4 text-sm">
      <p className="mb-2 text-lg font-bold">Wybierz widok</p>
      <div className="w-full space-y-2">
        <Button
          variant={selectedAction === 'ELEMENTS_LIST' ? 'default' : 'outline'}
          onClick={() => setSelectedAction('ELEMENTS_LIST')}
          className="w-full"
        >
          <LayersIcon /> Warstwy projektu
        </Button>
        <Button
          variant={selectedAction === 'VARIANTS' ? 'default' : 'outline'}
          onClick={() => setSelectedAction('VARIANTS')}
          className="w-full"
        >
          <LayoutTemplateIcon />
          Warianty projektu
        </Button>
      </div>
      <hr className="my-4" />

      {selectedAction === 'ELEMENTS_LIST' && <EditorElementsList />}
      {selectedAction === 'VARIANTS' && <VariantsPanel />}

      <div className="mt-auto space-y-2">
        <SaveToPcButton />
        <SaveToAccountButton />
      </div>
    </div>
  )
}
