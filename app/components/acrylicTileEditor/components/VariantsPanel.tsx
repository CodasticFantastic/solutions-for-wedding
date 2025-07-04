import {useState, useMemo} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {Input} from '@/components/shadCn/ui/input'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Plus, Trash2} from 'lucide-react'
import {cn} from '@/lib/shadCn/utils'
import {Alert, AlertDescription, AlertTitle} from '@/components/shadCn/ui/alert'

export const VariantsPanel = () => {
  const {state, dispatch, isReadOnly} = useAcrylicTileEditor()

  const [newLabel, setNewLabel] = useState('')

  // Gather all dynamic field keys present in elements
  const dynamicFieldKeys = useMemo(() => {
    const keys = state.elements
      .filter((el) => el.type === 'text' && (el.properties as any).isDynamic && (el.properties as any).fieldKey)
      .map((el) => (el.properties as any).fieldKey as string)
    return Array.from(new Set(keys))
  }, [state.elements])

  const addVariant = () => {
    const id = `var-${Date.now()}`
    // default values come from base template (global element properties)
    const defaultValues = Object.fromEntries(
      dynamicFieldKeys.map((k) => {
        const el = state.elements.find((e) => e.type === 'text' && (e.properties as any).fieldKey === k) as any
        return [k, el?.properties?.text || '']
      }),
    )

    const variant = {
      id,
      label: newLabel || `Wariant ${(state.dynamicVariants?.length || 0) + 1}`,
      values: defaultValues,
    }
    dispatch({type: 'ADD_VARIANT', payload: variant as any})
    dispatch({type: 'SET_ACTIVE_VARIANT', payload: id})
    setNewLabel('')
  }

  const activeVariant = state.dynamicVariants?.find((v) => v.id === state.activeVariantId)

  const updateFieldValue = (fieldKey: string, value: string) => {
    if (!activeVariant) return
    dispatch({
      type: 'UPDATE_VARIANT',
      payload: {
        id: activeVariant.id,
        updates: {
          values: {
            ...activeVariant.values,
            [fieldKey]: value,
          },
        } as any,
      },
    })
  }

  return (
    <>
      {dynamicFieldKeys.length === 0 ? (
        <Alert variant="destructive">
          <AlertTitle>Nie posiadasz pól z wariantami</AlertTitle>
          <AlertDescription>
            Aby dodać dynamiczne elementy, musisz wpierw oznaczyć jakiś element tekstowy jako &quot;Pole z wariantami&quot;
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <p className="mb-2 text-base font-semibold">Warianty</p>

          {/* Variant list */}
          <div className="max-h-36 space-y-1 overflow-y-auto">
            {/* Base pattern option */}
            <div
              className={cn(
                'flex w-full items-center gap-2 rounded border px-2 py-1',
                state.activeVariantId === undefined ? 'bg-primary/10 border-primary' : 'hover:bg-primary/30',
              )}
            >
              <button
                type="button"
                className="flex-1 truncate text-left text-sm"
                onClick={() => dispatch({type: 'SET_ACTIVE_VARIANT', payload: undefined})}
              >
                Wzór podstawowy
              </button>
            </div>
            {(state.dynamicVariants || []).map((v) => {
              const isActive = state.activeVariantId === v.id
              return (
                <div
                  key={v.id}
                  className={cn(
                    'flex w-full items-center gap-2 rounded border px-2 py-1',
                    isActive ? 'bg-primary/10 border-primary' : 'hover:bg-primary/30',
                  )}
                >
                  <button
                    type="button"
                    className="flex-1 truncate text-left text-sm"
                    onClick={() => dispatch({type: 'SET_ACTIVE_VARIANT', payload: v.id})}
                  >
                    {v.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => !isReadOnly && dispatch({type: 'REMOVE_VARIANT', payload: v.id})}
                    className={cn("text-destructive opacity-70 transition-opacity hover:opacity-100", isReadOnly && "cursor-not-allowed opacity-30")}
                  >
                    <Trash2 size={16} className="cursor-pointer" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add variant */}
          <div className="flex gap-2">
            <Input placeholder="Nazwa nowego wariantu" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} disabled={isReadOnly} />
            <Button type="button" size="icon" onClick={addVariant} disabled={isReadOnly}>
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Active variant details */}
          {activeVariant && (
            <div className="mt-4 space-y-3">
              {/* Label edit */}
              <div className="space-y-1">
                <label className="text-xs font-semibold" htmlFor="var-label-edit">
                  Nazwa wariantu
                </label>
                <Input
                  id="var-label-edit"
                  value={activeVariant.label}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_VARIANT',
                      payload: {id: activeVariant.id, updates: {label: e.target.value}},
                    })
                  }
                  disabled={isReadOnly}
                />
              </div>

              {/* Dynamic field values */}
              {dynamicFieldKeys.map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-semibold" htmlFor={`var-field-${key}`}>
                    {key}
                  </label>
                  <Input
                    id={`var-field-${key}`}
                    value={activeVariant.values[key] || ''}
                    onChange={(e) => updateFieldValue(key, e.target.value)}
                    disabled={isReadOnly}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
