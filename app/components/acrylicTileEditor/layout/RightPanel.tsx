import {SaveToPcButton} from '../components/SaveToPcButton'
import {SaveToAccountButton} from '../components/SaveToAccountButton'
import {AddToCartButton} from '../components/AddToCartButton'
import {VariantsPanel} from '../components/VariantsPanel'
import {EditorElementsList} from '../components/EditorElementsList'
import {ProjectSizeIndicator} from '../components/ProjectSizeIndicator'
import {useState} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {LayersIcon, LayoutTemplateIcon} from 'lucide-react'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'

export const RightPanel = () => {
  const [selectedAction, setSelectedAction] = useState<'ELEMENTS_LIST' | 'VARIANTS'>('ELEMENTS_LIST')
  const {isReadOnly, state} = useAcrylicTileEditor()

  const hasVariants = state.dynamicVariants && state.dynamicVariants.length > 0

  return (
    <div className="flex h-full flex-col space-y-4 p-4 text-sm">
      {!isReadOnly && (
        <>
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
        </>
      )}

      {selectedAction === 'ELEMENTS_LIST' && !isReadOnly && <EditorElementsList />}
      {selectedAction === 'VARIANTS' && (!isReadOnly || hasVariants) && <VariantsPanel />}

      <div className="mt-auto space-y-4">
        {/* Wskaźnik rozmiaru projektu */}
        <div className="bg-card rounded-lg border p-3">
          <ProjectSizeIndicator />
        </div>

        {/* Przyciski zapisu */}
        <div className="space-y-2">
          <SaveToPcButton />
          {!isReadOnly && <SaveToAccountButton />}
          {!isReadOnly && <AddToCartButton />}
        </div>
      </div>
    </div>
  )
}
