import {useCallback, useState} from 'react'
import {Label} from '@/components/shadCn/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadCn/ui/select'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {DEFAULT_TILE_BACKGROUNDS, formatPrice} from '../acrylicTileEditor.config'

/**
 * BackgroundSelector – lets the user pick one of the predefined tile backgrounds.
 */
export const BackgroundSelector = () => {
  const {state, dispatch, isReadOnly} = useAcrylicTileEditor()

  // Decide which option is currently active based on template backgroundImage
  const [selectedId, setSelectedId] = useState<string>(() => {
    return state.template.backgroundImage ?? 'transparent'
  })

  const handleSelect = useCallback(
    (value: string) => {
      setSelectedId(value)
      const opt = DEFAULT_TILE_BACKGROUNDS.find((o) => o.id === value)
      if (!opt) return

      dispatch({
        type: 'UPDATE_TEMPLATE',
        payload: {
          backgroundImage: opt.id === 'transparent' ? null : opt.id,
        },
      })
    },
    [dispatch],
  )

  return (
    <>
      <Label htmlFor="tile-bg" className="text-base font-semibold">
        Tło płytki
      </Label>
      <Select value={selectedId} onValueChange={handleSelect} disabled={isReadOnly}>
        <SelectTrigger id="tile-bg" className="w-full">
          <SelectValue placeholder="Wybierz tło" />
        </SelectTrigger>
        <SelectContent>
          {DEFAULT_TILE_BACKGROUNDS.map((bg) => (
            <SelectItem key={bg.id} value={bg.id} className="flex items-center space-x-2">
              <span
                className="inline-block h-5 w-5 shrink-0 overflow-hidden rounded-full border"
                style={{
                  backgroundColor: bg.src ? 'transparent' : '#fff',
                  backgroundImage: bg.src ? `url(${bg.src})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="flex items-center justify-between w-full">
                <span>{bg.label}</span>
                {bg.priceModifier > 0 && (
                  <span className="text-sm text-green-600 ml-2">+{formatPrice(bg.priceModifier)}</span>
                )}
                {bg.priceModifier === 0 && (
                  <span className="text-sm text-gray-500 ml-2">Bez dopłaty</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
