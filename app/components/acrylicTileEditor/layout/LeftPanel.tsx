import {useState} from 'react'
import {BackgroundSelector} from '../components/BackgroundSelector'
import {NameInput} from '../components/NameInput'
import {SizeSelector} from '../components/SizeSelector'
import {OrientationSelector} from '../components/OrientationSelector'
import {AddTextButton} from '../components/AddTextButton'
import {AddImageButton} from '../components/AddImageButton'
import {ImageLibraryButton} from '../components/ImageLibraryButton'
import {Button} from '@/components/shadCn/ui/button'
import {TextEditor} from '../components/TextEditor'
import {SvgEditor} from '../components/SvgEditor'
import {InfoIcon, SquareMousePointerIcon, EyeIcon, BanknoteIcon, PencilRulerIcon, SaveIcon} from 'lucide-react'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Alert, AlertDescription, AlertTitle} from '@/components/shadCn/ui/alert'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/shadCn/ui/collapsible'
import {Badge} from '@/components/shadCn/ui/badge'

export const LeftPanel = () => {
  const [selectedAction, setSelectedAction] = useState<'BASIC_INFO' | 'EDITOR'>('BASIC_INFO')
  const {isReadOnly, selectedStep, setSelectedStep, projectHasName} = useAcrylicTileEditor()

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {/* Read only alert */}
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

      <p className="mb-0 text-lg font-bold">Stwórz swój projekt</p>
      <p className="mb-3 text-sm text-gray-500">
        Wykorzystaj nasz kreator aby stworzyć swój projekt. Cała operacja jest bardzo prosta i zajmuje tylko kilka minut. Poprowadzimy Cię
        przez cały proces.
      </p>
      <div className="space-y-2">
        {/* Step 1 - Basic Info */}
        <Collapsible open={selectedStep === 'I'}>
          <Button
            className="w-full justify-start"
            variant={selectedStep === 'I' ? 'default' : 'outline'}
            onClick={() => setSelectedStep('I')}
          >
            <Badge variant={selectedStep === 'I' ? 'outline' : 'default'} className={selectedStep === 'I' ? 'text-white' : ''}>
              Krok 1
            </Badge>
            Informacje o projekcie
          </Button>
          <CollapsibleContent>
            <Alert className="mt-2" variant="info">
              <AlertDescription className="mt-1">
                <div className="flex items-center gap-1">
                  <InfoIcon size={16} /> <strong>Informacje podstawowe</strong>
                </div>
                W prawym panelu możesz ustawić podstawową konfigurację projektu.{' '}
                <ol className="mt-1 list-decimal">
                  <li>Nadaj nazwę swojemu projektowi</li>
                  <li>Wybierz rozmiar płytki</li>
                  <li>Wybierz tło płytki</li>
                  <li>Ustaw orientację płytki</li>
                </ol>
                <hr className="my-2 w-full border-gray-300" />
                <div className="flex items-center gap-1">
                  <BanknoteIcon size={16} /> <strong>Śledź cenę projektu</strong>
                </div>
                Poniżej możesz śledzić na bieżąco cenę swojego projektu. Widoczna cena dotyczy pojedynczej sztuki.
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>
        {/* Step 2 - Project Template*/}
        <Collapsible open={selectedStep === 'II'}>
          <Button
            className="w-full justify-start"
            variant={selectedStep === 'II' ? 'default' : 'outline'}
            onClick={() => setSelectedStep('II')}
            disabled={!projectHasName}
          >
            <Badge variant={selectedStep === 'II' ? 'outline' : 'default'} className={selectedStep === 'II' ? 'text-white' : ''}>
              Krok 2
            </Badge>
            Ustal wygląd projektu
          </Button>

          <CollapsibleContent>
            <Alert className="mt-2" variant="info">
              <AlertDescription className="mt-1">
                <div className="flex items-center gap-1">
                  <PencilRulerIcon size={16} /> <strong>Zacznij tworzyć swój projekt</strong>
                </div>
                W prawym panelu pojawiły się nowe opcje. Możesz teraz zacząć tworzyć swój projekt.
                <hr className="my-2 w-full border-gray-300" />
                <div className="flex items-center gap-1">
                  <SaveIcon size={16} /> <strong>Regularnie zapisuj projekt</strong>
                </div>
                Pamiętaj o regularnym zapisaniu swojego projektu. Możesz to zrobić w dowolnym momencie.
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>
      </div>
      {/* Step 3 - Warianty projektu*/}
      {/* <Collapsible>
        <CollapsibleTrigger className="flex w-full">
          <Button variant="outline" className="flex flex-1">
            <Badge>Krok 2</Badge>
            Ustal wygląd projektu
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p>xD</p>
        </CollapsibleContent>
      </Collapsible> */}

      {/* {!isReadOnly && (
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
      )} */}

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
