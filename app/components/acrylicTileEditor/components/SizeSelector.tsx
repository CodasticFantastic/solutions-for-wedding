import {Label} from '@/components/shadCn/ui/label'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/shadCn/ui/select'
import {DEFAULT_TILE_SIZES, formatPrice} from '../acrylicTileEditor.config'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {useCallback, useState} from 'react'
import {cmToPixels} from '../acrylicTileEditor.types'

export const SizeSelector = () => {
  const {state, dispatch, isReadOnly} = useAcrylicTileEditor()

  // Selector state – try to match current template size with one of the presets
  const [selectedSizeId, setSelectedSizeId] = useState<string>(() => {
    const match = DEFAULT_TILE_SIZES.find(
      (opt) => cmToPixels(opt.widthCm) === state.template.width && cmToPixels(opt.heightCm) === state.template.height,
    )
    return match?.id ?? ''
  })

  const handleSizeSelect = useCallback(
    (value: string) => {
      setSelectedSizeId(value)
      const opt = DEFAULT_TILE_SIZES.find((o) => o.id === value)
      if (!opt) return

      dispatch({
        type: 'UPDATE_TEMPLATE',
        payload: {
          width: cmToPixels(opt.widthCm),
          height: cmToPixels(opt.heightCm),
        } as any,
      })
    },
    [dispatch],
  )

  return (
    <>
      <Label htmlFor="tile-size" className="text-base font-semibold">
        Rozmiar płytki
      </Label>
      <Select value={selectedSizeId} onValueChange={handleSizeSelect} disabled={isReadOnly}>
        <SelectTrigger id="tile-size" className="w-full">
          <SelectValue placeholder="Wybierz rozmiar" />
        </SelectTrigger>
        <SelectContent>
          {DEFAULT_TILE_SIZES.map((size) => (
            <SelectItem key={size.id} value={size.id}>
              <div className="flex w-full items-center justify-between">
                <span>{size.label}</span>
                <span className="ml-2 text-sm text-gray-500">{formatPrice(size.price)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
