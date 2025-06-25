import {Label} from '@/components/shadCn/ui/label'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Input} from '@/components/shadCn/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/shadCn/ui/select'
import {AVAILABLE_FONTS} from '../acrylicTileEditor.config'
import {Button} from '@/components/shadCn/ui/button'
import {BoldIcon, ItalicIcon} from 'lucide-react'

export const TextEditor = () => {
  const {state, dispatch} = useAcrylicTileEditor()
  const selected = state.elements.find((el) => el.id === state.selectedElementId)

  return (
    <>
      {selected && selected.type === 'text' && (
        <>
          <p className="mb-2 text-lg font-bold">Edytuj tekst</p>
          <div className="space-y-4">
            {/* Text content */}
            <div className="space-y-1">
              <Label htmlFor="prop-text">Tekst</Label>
              <Input
                id="prop-text"
                type="text"
                value={selected.properties.text || ''}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    payload: {
                      id: selected.id,
                      updates: {
                        properties: {...selected.properties, text: e.target.value},
                      },
                    },
                  })
                }
                className="w-full"
              />
            </div>

            {/* Font family */}
            <div className="space-y-1">
              <Label htmlFor="prop-font">Font</Label>
              <Select
                value={selected.properties.fontFamily || 'Inter'}
                onValueChange={(value) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    payload: {
                      id: selected.id,
                      updates: {
                        properties: {...selected.properties, fontFamily: value},
                      },
                    },
                  })
                }
              >
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
                min={4}
                max={200}
                value={(selected.properties.fontSize || 24).toString()}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    payload: {
                      id: selected.id,
                      updates: {
                        properties: {
                          ...selected.properties,
                          fontSize: parseInt(e.target.value || '0', 10) || 0,
                        },
                      },
                    },
                  })
                }
                className="w-full"
              />
            </div>

            {/* Font size */}
            <div className="space-y-1">
              <Label htmlFor="prop-rotation">Obrót</Label>
              <Input
                id="prop-rotation"
                type="number"
                min={4}
                max={200}
                value={(selected.rotation || 24).toString()}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    payload: {
                      id: selected.id,
                      updates: {
                        properties: {
                          ...selected.properties,
                          fontSize: parseInt(e.target.value || '0', 10) || 0,
                        },
                      },
                    },
                  })
                }
                className="w-full"
              />
            </div>

            {/* Color */}
            <div className="space-y-1">
              <Label htmlFor="prop-color">Kolor</Label>
              <Input
                id="prop-color"
                type="color"
                value={selected.properties.fill || '#000000'}
                onChange={(e) =>
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    payload: {
                      id: selected.id,
                      updates: {
                        properties: {...selected.properties, fill: e.target.value},
                      },
                    },
                  })
                }
                className="h-8 w-full p-0"
              />
            </div>

            {/* Style toggles */}
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                size="sm"
                variant={selected.properties.fontStyle?.includes('bold') ? 'default' : 'outline'}
                onClick={() => {
                  const italic = selected.properties.fontStyle?.includes('italic')
                  const bold = selected.properties.fontStyle?.includes('bold')
                  const newBold = !bold
                  const newStyle = `${newBold ? 'bold' : ''}${italic ? (newBold ? ' ' : '') + 'italic' : ''}`.trim() || 'normal'
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    payload: {
                      id: selected.id,
                      updates: {
                        properties: {...selected.properties, fontStyle: newStyle},
                      },
                    },
                  })
                }}
              >
                <BoldIcon className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={selected.properties.fontStyle?.includes('italic') ? 'default' : 'outline'}
                onClick={() => {
                  const italic = selected.properties.fontStyle?.includes('italic')
                  const bold = selected.properties.fontStyle?.includes('bold')
                  const newItalic = !italic
                  const newStyle = `${bold ? 'bold' : ''}${newItalic ? (bold ? ' ' : '') + 'italic' : ''}`.trim() || 'normal'
                  dispatch({
                    type: 'UPDATE_ELEMENT',
                    payload: {
                      id: selected.id,
                      updates: {
                        properties: {...selected.properties, fontStyle: newStyle},
                      },
                    },
                  })
                }}
              >
                <ItalicIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
