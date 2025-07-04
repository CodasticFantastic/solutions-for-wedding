import {Label} from '@/components/shadCn/ui/label'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Input} from '@/components/shadCn/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/shadCn/ui/select'
import {AVAILABLE_FONTS} from '../acrylicTileEditor.config'
import {Button} from '@/components/shadCn/ui/button'
import {BoldIcon, InfoIcon, ItalicIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon} from 'lucide-react'
import {Checkbox} from '@/components/shadCn/ui/checkbox'
import {Textarea} from '@/components/shadCn/ui/textarea'
import {Popover} from '@/components/shadCn/ui/popover'
import {PopoverContent, PopoverTrigger} from '@radix-ui/react-popover'

export const TextEditor = () => {
  const {state, dispatch, isReadOnly} = useAcrylicTileEditor()
  const selectedElement = state.elements.find((el) => el.id === state.selectedElementId)

  const updateElementTextContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedElement || selectedElement.type !== 'text') return

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selectedElement.id,
        updates: {
          properties: {...selectedElement.properties, text: e.target.value},
        },
      },
    })
  }

  const updateElementFontFamily = (value: string) => {
    if (!selectedElement || selectedElement.type !== 'text') return

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selectedElement.id,
        updates: {
          properties: {...selectedElement.properties, fontFamily: value},
        },
      },
    })
  }

  const updateElementFontSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement || selectedElement.type !== 'text') return

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selectedElement.id,
        updates: {
          properties: {
            ...selectedElement.properties,
            fontSize: parseInt(e.target.value || '0', 10) || 0,
          },
        },
      },
    })
  }

  const updateElementColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement || selectedElement.type !== 'text') return

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selectedElement.id,
        updates: {
          properties: {...selectedElement.properties, fill: e.target.value},
        },
      },
    })
  }

  const updateElementIsDynamic = (checked: boolean) => {
    if (!selectedElement || selectedElement.type !== 'text') return

    // When enabling dynamic field, set the text value to the bracketed key
    const updatedProps: typeof selectedElement.properties = {
      ...selectedElement.properties,
      isDynamic: checked,
    }

    if (checked) {
      updatedProps.text = `{{${selectedElement.properties.fieldKey || ''}}}`
    }

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selectedElement.id,
        updates: {
          properties: updatedProps,
        },
      },
    })
  }

  const updateElementFieldKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement || selectedElement.type !== 'text') return

    const newKey = e.target.value

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selectedElement.id,
        updates: {
          properties: {
            ...selectedElement.properties,
            fieldKey: newKey,
            // Keep text in sync when dynamic
            ...(selectedElement.properties.isDynamic ? {text: `{{${newKey}}}`} : {}),
          },
        },
      },
    })
  }

  const updateElementFontWeight = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedElement || selectedElement.type !== 'text') return

    const italic = selectedElement.properties.fontStyle?.includes('italic')
    const bold = selectedElement.properties.fontStyle?.includes('bold')
    const newBold = !bold
    const newStyle = `${newBold ? 'bold' : ''}${italic ? (newBold ? ' ' : '') + 'italic' : ''}`.trim() || 'normal'
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selectedElement.id,
        updates: {
          properties: {...selectedElement.properties, fontStyle: newStyle},
        },
      },
    })
  }

  const updateElementFontItalic = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedElement || selectedElement.type !== 'text') return

    const italic = selectedElement.properties.fontStyle?.includes('italic')
    const bold = selectedElement.properties.fontStyle?.includes('bold')
    const newItalic = !italic
    const newStyle = `${bold ? 'bold' : ''}${newItalic ? (bold ? ' ' : '') + 'italic' : ''}`.trim() || 'normal'
    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selectedElement.id,
        updates: {
          properties: {...selectedElement.properties, fontStyle: newStyle},
        },
      },
    })
  }

  const updateElementAlign = (align: 'left' | 'center' | 'right') => {
    if (!selectedElement || selectedElement.type !== 'text') return

    dispatch({
      type: 'UPDATE_ELEMENT',
      payload: {
        id: selectedElement.id,
        updates: {
          properties: {...selectedElement.properties, align},
        },
      },
    })
  }

  return (
    <>
      {selectedElement && selectedElement.type === 'text' && (
        <>
          <p className="mb-2 text-lg font-bold">Edytuj tekst</p>
          <div className="space-y-4">
            {/* Dynamic field toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prop-dyn-toggle" className="flex items-center gap-2">
                  <Checkbox
                    id="prop-dyn-toggle"
                    checked={selectedElement.properties.isDynamic || false}
                    onCheckedChange={updateElementIsDynamic}
                  />
                  <span>Pole z wariantami</span>
                </Label>
                <Popover>
                  <PopoverTrigger>
                    <InfoIcon className="cursor-pointer" size={16} />
                  </PopoverTrigger>
                  <PopoverContent className="border-border z-100 w-60 rounded-md bg-gray-50 p-4 shadow-md">
                    Pole z wariantami pozwala na dynamiczne generowanie tekstu na podstawie danych z formularza.
                    <br />
                    <br />
                    Używaj np. kiedy przygotowujesz listę gości.
                    <br />
                    <br />
                    Po zaznaczeniu pola, na prawym pasku dostępny będzie edytor wariantów w którym będziesz mógł na żywo dodawać warianty
                    swoich treści oraz edytować ich umiejscowienie.
                  </PopoverContent>
                </Popover>
              </div>

              {/* Field key input – visible only when dynamic */}
              {selectedElement.properties.isDynamic && (
                <Input
                  id="prop-field-key"
                  placeholder="Klucz pola (np. imie)"
                  value={selectedElement.properties.fieldKey || ''}
                  onChange={updateElementFieldKey}
                  className="w-full"
                />
              )}
            </div>
            {/* Text content */}
            <div className="space-y-1">
              <Label htmlFor="prop-text">Tekst</Label>
              <Textarea
                id="prop-text"
                value={selectedElement.properties.text || ''}
                onChange={updateElementTextContent}
                className="w-full"
                disabled={selectedElement.properties.isDynamic || isReadOnly}
              />
            </div>

            {/* Font family */}
            <div className="space-y-1">
              <Label htmlFor="prop-font">Font</Label>
              <Select value={selectedElement.properties.fontFamily || 'Inter'} onValueChange={updateElementFontFamily} disabled={isReadOnly}>
                <SelectTrigger id="prop-font" className="w-full">
                  <SelectValue placeholder="Wybierz font" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {AVAILABLE_FONTS.map((font) => (
                    <SelectItem key={font} value={font} style={{fontFamily: font}}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font size */}
            <div className="space-y-1">
              <Label htmlFor="prop-size">Rozmiar</Label>
              <Input
                id="prop-size"
                type="number"
                min={0}
                max={1000}
                value={(selectedElement.properties.fontSize || 24).toString()}
                onChange={updateElementFontSize}
                className="w-full"
                disabled={isReadOnly}
              />
            </div>

            {/* Color */}
            <div className="space-y-1">
              <Label htmlFor="prop-color">Kolor</Label>
              <Input
                id="prop-color"
                type="color"
                value={selectedElement.properties.fill || '#000000'}
                onChange={updateElementColor}
                className="h-8 w-full p-0"
                disabled={isReadOnly}
              />
            </div>

            {/* Style toggles */}
            <div className="flex items-center space-x-2">
              {/* Bold */}
              <Button
                type="button"
                size="sm"
                variant={selectedElement.properties.fontStyle?.includes('bold') ? 'default' : 'outline'}
                onClick={updateElementFontWeight}
                disabled={isReadOnly}
              >
                <BoldIcon className="h-4 w-4" />
              </Button>
              {/* Italic */}
              <Button
                type="button"
                size="sm"
                variant={selectedElement.properties.fontStyle?.includes('italic') ? 'default' : 'outline'}
                onClick={updateElementFontItalic}
                disabled={isReadOnly}
              >
                <ItalicIcon className="h-4 w-4" />
              </Button>
              {/* Align Left */}
              <Button
                type="button"
                size="sm"
                variant={selectedElement.properties.align === 'left' || !selectedElement.properties.align ? 'default' : 'outline'}
                onClick={() => updateElementAlign('left')}
                disabled={isReadOnly}
              >
                <AlignLeftIcon className="h-4 w-4" />
              </Button>
              {/* Align Center */}
              <Button
                type="button"
                size="sm"
                variant={selectedElement.properties.align === 'center' ? 'default' : 'outline'}
                onClick={() => updateElementAlign('center')}
                disabled={isReadOnly}
              >
                <AlignCenterIcon className="h-4 w-4" />
              </Button>
              {/* Align Right */}
              <Button
                type="button"
                size="sm"
                variant={selectedElement.properties.align === 'right' ? 'default' : 'outline'}
                onClick={() => updateElementAlign('right')}
                disabled={isReadOnly}
              >
                <AlignRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
