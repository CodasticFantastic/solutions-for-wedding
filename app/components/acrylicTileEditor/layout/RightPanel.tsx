import {SaveToPcButton} from '../components/SaveToPcButton'
import {SaveToAccountButton} from '../components/SaveToAccountButton'
import {AddToCartButton} from '../components/AddToCartButton'
import {VariantsPanel} from '../components/VariantsPanel'
import {EditorElementsList} from '../components/EditorElementsList'
import {ProjectSizeIndicator} from '../components/ProjectSizeIndicator'
import {useState} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {ArrowLeftIcon, ArrowRightIcon, FileWarningIcon, LayersIcon, LayoutTemplateIcon, PencilRulerIcon} from 'lucide-react'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {NameInput} from '../components/NameInput'
import {SizeSelector} from '../components/SizeSelector'
import {OrientationSelector} from '../components/OrientationSelector'
import {BackgroundSelector} from '../components/BackgroundSelector'
import {Badge} from '@/components/shadCn/ui/badge'
import {Alert, AlertDescription, AlertTitle} from '@/components/shadCn/ui/alert'
import {AddTextButton} from '../components/AddTextButton'
import {AddImageButton} from '../components/AddImageButton'
import {ImageLibraryButton} from '../components/ImageLibraryButton'
import {TextEditor} from '../components/TextEditor'
import {SvgEditor} from '../components/SvgEditor'

export const RightPanel = () => {
  const [selectedAction, setSelectedAction] = useState<'ELEMENTS_LIST' | 'VARIANTS'>('ELEMENTS_LIST')
  const {isReadOnly, state, selectedStep, projectHasName, setSelectedStep} = useAcrylicTileEditor()
  const [step2View, setStep2View] = useState<'ACTIONS' | 'ELEMENTS_LIST'>('ACTIONS')

  const hasVariants = state.dynamicVariants && state.dynamicVariants.length > 0

  return (
    <div className="flex h-full flex-col space-y-4 p-4 text-sm">
      {/* Step 1 - Basic Info */}
      {!isReadOnly && selectedStep === 'I' && (
        <>
          <p className="mb-0 flex items-center gap-2 text-lg font-bold">
            <Badge>Krok 1</Badge> Informacje podstawowe
          </p>
          <hr className="my-2 w-full border-gray-300" />
          <div className="space-y-2">
            {/* Template name */}
            <div className="space-y-2">
              <NameInput />
            </div>

            {/* Template orientation */}
            <div className="space-y-2">
              <OrientationSelector />
            </div>

            {/* Template size */}
            <div className="space-y-2">
              <SizeSelector />
            </div>

            {/* Background selector */}
            <div className="space-y-2">
              <BackgroundSelector />
            </div>
          </div>
        </>
      )}

      {/* Step 2 - Project Template*/}
      {!isReadOnly && selectedStep === 'II' && (
        <>
          <p className="mb-0 flex items-center gap-2 text-lg font-bold">
            <Badge>Krok 2</Badge> Ustal wygląd projektu
          </p>
          <hr className="my-2 w-full border-gray-300" />
          {/* Step 2 - View selector */}
          <div className="mb-0 flex gap-2">
            <Button
              variant={step2View === 'ACTIONS' ? 'default' : 'outline-primary'}
              className="flex-1"
              onClick={() => setStep2View('ACTIONS')}
            >
              <PencilRulerIcon /> Edytuj elementy
            </Button>
            <Button
              variant={step2View === 'ELEMENTS_LIST' ? 'default' : 'outline-primary'}
              className="flex-1"
              onClick={() => setStep2View('ELEMENTS_LIST')}
            >
              <LayersIcon /> Warstwy projektu
            </Button>
          </div>
          <hr className="my-2 w-full border-gray-300" />
          {/* Actions */}
          {step2View === 'ACTIONS' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <AddTextButton />
                <AddImageButton />
                <ImageLibraryButton />
              </div>
              <hr className="my-2 w-full border-gray-300" />
              <TextEditor />
              <SvgEditor />
            </div>
          )}
          {step2View === 'ELEMENTS_LIST' && <EditorElementsList />}
        </>
      )}

      {/* {!isReadOnly && (
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
      )} */}

      {/* {selectedAction === 'ELEMENTS_LIST' && !isReadOnly && <EditorElementsList />}
      {selectedAction === 'VARIANTS' && (!isReadOnly || hasVariants) && <VariantsPanel />} */}

      <div className="mt-auto space-y-2">
        {/* Step 1 - Basic Info */}
        {selectedStep === 'I' && (
          <>
            {!projectHasName && (
              <Alert variant="warning">
                <AlertTitle className="flex items-center gap-1">
                  <FileWarningIcon size={16} /> Projekt bez nazwy
                </AlertTitle>
                <AlertDescription>Musisz nadać nazwę swojemu projektowi aby przejść do kolejnego kroku.</AlertDescription>
              </Alert>
            )}
            <hr className="my-2 w-full border-gray-300" />
            <Button variant="outline-primary" className="w-full" disabled={!projectHasName} onClick={() => setSelectedStep('II')}>
              Kolejny krok <ArrowRightIcon />
            </Button>
          </>
        )}

        {/* Step 2 - Project Template*/}
        {selectedStep === 'II' && (
          <>
            <hr className="my-2 w-full border-gray-300" />
            {/* Wskaźnik rozmiaru projektu */}
            <ProjectSizeIndicator />
            <div className="flex gap-2">
              <Button variant="outline-primary" className="flex-1" disabled={!projectHasName} onClick={() => setSelectedStep('I')}>
                <ArrowLeftIcon /> Poprzedni krok
              </Button>
              <Button variant="outline-primary" className="flex-1" disabled={!projectHasName} onClick={() => setSelectedStep('III')}>
                Kolejny krok <ArrowRightIcon />
              </Button>
            </div>
          </>
        )}

        {/* Save Project */}
        {projectHasName && <SaveToAccountButton />}

        {/* <div className="bg-card rounded-lg border p-3">
          <ProjectSizeIndicator />
        </div> */}

        {/* Przyciski zapisu */}
        {/* <div className="space-y-2">
          <SaveToPcButton />
          {!isReadOnly && <SaveToAccountButton />}
          {!isReadOnly && <AddToCartButton />}
        </div> */}
      </div>
    </div>
  )
}
