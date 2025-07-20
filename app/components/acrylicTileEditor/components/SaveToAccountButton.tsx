import {useState} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {SaveIcon} from 'lucide-react'
import {Alert, AlertDescription, AlertTitle} from '@/components/shadCn/ui/alert'
import {Link} from 'react-router'

/**
 * SaveToAccountButton – zapisuje projekt do panelu klienta.
 * Komponent generuje JSON stanu edytora i wywołuje przekazany z góry callback onSave (jeżeli istnieje).
 */
export const SaveToAccountButton = () => {
  const {state, onSave, isLoggedIn} = useAcrylicTileEditor()
  const [saving, setSaving] = useState(false)

  const handleClick = async () => {
    if (!onSave) return // nic nie robimy gdy brak callbacku
    setSaving(true)

    try {
      // Przygotuj payload (bez miniaturki – PNG przekracza limit API)
      const payload = {
        title: state.template.name,
        design_json: {
          template: state.template,
          elements: state.elements,
          dynamicVariants: state.dynamicVariants,
          activeVariantId: state.activeVariantId,
        },
      }

      await onSave(payload)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Nie udało się zapisać projektu. Spróbuj ponownie.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {isLoggedIn && (
        <Button className="w-full" onClick={handleClick} disabled={saving} variant="default">
          <SaveIcon />
          {saving ? 'Zapisywanie…' : 'Zapisz w projektach'}
        </Button>
      )}
    </>
  )
}
