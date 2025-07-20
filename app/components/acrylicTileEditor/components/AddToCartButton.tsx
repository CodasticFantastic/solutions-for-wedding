import {useState} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/shadCn/ui/alert-dialog'
import {SaveIcon, ShoppingCart, ShoppingCartIcon} from 'lucide-react'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {DEFAULT_TILE_BACKGROUNDS} from '../acrylicTileEditor.config'
import {useParams, Link} from 'react-router'
import {pixelsToCm} from '../acrylicTileEditor.types'
import {Alert, AlertDescription, AlertTitle} from '@/components/shadCn/ui/alert'

export const AddToCartButton = () => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {state, onSave, isLoggedIn, dispatch} = useAcrylicTileEditor()
  const {locale = ''} = useParams<{locale: string}>()

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      alert('Musisz być zalogowany, aby dodać projekt do koszyka.')
      return
    }

    if (!onSave) {
      alert('Błąd: Brak funkcji zapisu')
      return
    }

    setIsSubmitting(true)
    try {
      // Create project data with isEditable: false
      const projectData = {
        template: {
          ...state.template,
          isEditable: false,
        },
        elements: state.elements,
        dynamicVariants: state.dynamicVariants || [],
        activeVariantId: state.activeVariantId,
      }

      // Use the same save flow as SaveToAccountButton
      await onSave({
        title: state.template.name,
        design_json: projectData,
      })

      // Update the local template to be non-editable
      dispatch({
        type: 'UPDATE_TEMPLATE',
        payload: {isEditable: false},
      })

      setOpen(false)
      alert('Projekt został dodany do koszyka i zapisany jako nieedytowalny.')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Nie udało się dodać do koszyka. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBackgroundName = (backgroundId: string | null) => {
    if (!backgroundId) return 'Przezroczyste'
    const background = DEFAULT_TILE_BACKGROUNDS.find((bg) => bg.id === backgroundId)
    return background?.label || 'Nieznane tło'
  }

  const getTileSize = () => {
    const {width, height} = state.template
    // Convert pixels back to cm using the proper function
    const widthCm = Math.round(pixelsToCm(width))
    const heightCm = Math.round(pixelsToCm(height))
    return `${widthCm} × ${heightCm} cm`
  }

  const variantCount = state.dynamicVariants?.length || 0

  return (
    <>
      {isLoggedIn ? (
        <>
          <Button onClick={() => setOpen(true)} className="w-full" variant="default" disabled={isSubmitting}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Dodawanie...' : 'Dodaj do koszyka'}
          </Button>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Dodaj projekt do koszyka</AlertDialogTitle>
                <AlertDialogDescription>Sprawdź informacje o projekcie przed dodaniem do koszyka.</AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4">
                {/* Project Information */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Nazwa projektu:</span>
                      <p className="text-muted-foreground">{state.template.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Rozmiar płytki:</span>
                      <p className="text-muted-foreground">{getTileSize()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Tło:</span>
                      <p className="text-muted-foreground">{getBackgroundName(state.template.backgroundImage)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Liczba wariantów:</span>
                      <p className="text-muted-foreground">{variantCount}</p>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Uwaga:</strong> Po dodaniu produktu do koszyka nie będzie możliwa już jego edycja. Projekt zostanie zapisany w
                    Twoim profilu z flagą blokującą edytowanie.
                  </p>
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isSubmitting}>Anuluj</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddToCart} disabled={isSubmitting}>
                  {isSubmitting ? 'Dodawanie...' : 'Potwierdź i dodaj do koszyka'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <Alert variant="default">
          <AlertTitle className="flex items-center gap-2 text-lg">
            <ShoppingCartIcon size={18} /> Kup projekt
          </AlertTitle>
          <AlertDescription>
            Musisz być zalogowany, aby dokonać zakupu projektu lub zapisać go w swoim koncie.
            <Link to="/account" className="mt-2 w-full">
              <Button className="w-full" size="sm">
                Zaloguj się
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
