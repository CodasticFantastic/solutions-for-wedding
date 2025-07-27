import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {DEFAULT_TILE_SIZES, DEFAULT_TILE_BACKGROUNDS, calculateTilePrice, formatPrice} from '../acrylicTileEditor.config'
import {cmToPixels} from '../acrylicTileEditor.types'
import {Alert, AlertDescription, AlertTitle} from '@/components/shadCn/ui/alert'
import {Badge} from '@/components/shadCn/ui/badge'
import {BanknoteIcon} from 'lucide-react'

export const PriceCalculator = () => {
  const {state} = useAcrylicTileEditor()

  // Znajdź aktualnie wybrany rozmiar na podstawie wymiarów szablonu
  const selectedSize = DEFAULT_TILE_SIZES.find(
    (size) => cmToPixels(size.widthCm) === state.template.width && cmToPixels(size.heightCm) === state.template.height,
  )

  // Znajdź aktualnie wybrane tło
  const selectedBackground = DEFAULT_TILE_BACKGROUNDS.find((bg) => bg.id === (state.template.backgroundImage || 'transparent'))

  // Oblicz cenę
  const totalPrice = calculateTilePrice(selectedSize, selectedBackground)

  return (
    <Alert className="border-green-200 bg-green-50">
      <AlertTitle className="flex items-center gap-2 text-gray-900">
        <BanknoteIcon className="h-4 w-4" />
        <strong>Cena projektu</strong>
      </AlertTitle>
      <AlertDescription className="text-gray-700">
        <div className="mt-2 w-full space-y-2">
          {/* Podstawowa cena */}
          {selectedSize && (
            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-gray-600">Cena rozmiaru</span>
              <Badge variant="outline" className="bg-background font-medium">
                {formatPrice(selectedSize.price)}
              </Badge>
            </div>
          )}

          {/* Dopłata za tło */}
          {selectedBackground && selectedBackground.priceModifier > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dopłata za tło</span>
              <Badge variant="outline" className="bg-background font-medium text-green-600">
                +{formatPrice(selectedBackground.priceModifier)}
              </Badge>
            </div>
          )}

          {/* Separator */}
          {(selectedSize || (selectedBackground && selectedBackground.priceModifier > 0)) && (
            <div className="my-2 border-t border-green-200" />
          )}

          {/* Cena całkowita */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Cena całkowita</span>
            <Badge className="bg-green-600 text-xs font-bold hover:bg-green-700">{formatPrice(totalPrice)}</Badge>
          </div>

          {/* Informacja o cenie za sztukę */}
          <p className="mt-2 text-center text-xs text-gray-500">Cena dotyczy pojedynczej sztuki</p>
        </div>
      </AlertDescription>
    </Alert>
  )
}
