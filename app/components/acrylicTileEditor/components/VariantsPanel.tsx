import {useState, useMemo} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {Input} from '@/components/shadCn/ui/input'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {InfoIcon, Plus, Trash2, Edit3, ArrowLeft, Settings} from 'lucide-react'
import {cn} from '@/lib/shadCn/utils'
import {Alert, AlertDescription, AlertTitle} from '@/components/shadCn/ui/alert'
import {Badge} from '@/components/shadCn/ui/badge'

type ViewMode = 'manage' | 'edit'

export const VariantsPanel = () => {
  const {state, dispatch, isReadOnly} = useAcrylicTileEditor()
  const [viewMode, setViewMode] = useState<ViewMode>('manage')
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
    setViewMode('edit')
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

  const handleVariantSelect = (variantId: string | undefined) => {
    dispatch({type: 'SET_ACTIVE_VARIANT', payload: variantId})
  }

  const handleEditVariant = (variantId: string) => {
    dispatch({type: 'SET_ACTIVE_VARIANT', payload: variantId})
    setViewMode('edit')
  }

  const handleBackToManage = () => {
    setViewMode('manage')
  }

  if (dynamicFieldKeys.length === 0) {
    return (
      <Alert variant="info">
        <AlertTitle className="flex items-center gap-1">
          <InfoIcon size={16} /> Nie posiadasz pól z wariantami
        </AlertTitle>
        <AlertDescription className="mt-1">
          Aby dodać warianty projektu, musisz wpierw oznaczyć jakiś element tekstowy jako &quot;Pole z wariantami&quot;.
          <br />
          <br /> Cofnij się do Kroku 2 i oznacz pola w które będziesz chciał wpisywać wartości.
        </AlertDescription>
      </Alert>
    )
  }

  if (viewMode === 'edit' && activeVariant) {
    return (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToManage} className="h-8 w-8 p-0">
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Edycja wariantu</h3>
            <p className="text-muted-foreground text-xs">{activeVariant.label}</p>
          </div>
        </div>

        {/* Variant details */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          {/* Label edit */}
          <div className="space-y-2">
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
              placeholder="Wprowadź nazwę wariantu"
            />
          </div>

          {/* Dynamic field values */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-xs font-semibold">Wartości pól</h4>
            {dynamicFieldKeys.map((key) => (
              <div key={key} className="space-y-2">
                <label className="text-xs font-semibold" htmlFor={`var-field-${key}`}>
                  {key}
                </label>
                <Input
                  id={`var-field-${key}`}
                  value={activeVariant.values[key] || ''}
                  onChange={(e) => updateFieldValue(key, e.target.value)}
                  disabled={isReadOnly}
                  placeholder={`Wprowadź wartość dla ${key}`}
                />
              </div>
            ))}
          </div>

          {/* Delete variant */}
          <div className="pt-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                dispatch({type: 'REMOVE_VARIANT', payload: activeVariant.id})
                handleBackToManage()
              }}
              disabled={isReadOnly}
              className="w-full"
            >
              <Trash2 size={16} className="mr-2" />
              Usuń wariant
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Manage variants view
  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Base pattern option */}
      <div className="space-y-2">
        <h4 className="text-muted-foreground text-xs font-semibold">Wzór podstawowy</h4>
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border p-3 text-left transition-colors',
            state.activeVariantId === undefined ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50',
          )}
          onClick={() => handleVariantSelect(undefined)}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">Wzór podstawowy</p>
            <p className="text-muted-foreground text-xs">Oryginalny układ z domyślnymi wartościami</p>
          </div>
          {state.activeVariantId === undefined && <div className="text-primary text-xs font-medium">Aktywny</div>}
        </button>
      </div>

      {/* Add new variant */}
      <div className="space-y-2">
        <h4 className="text-muted-foreground text-xs font-semibold">Dodaj nowy wariant</h4>
        <div className="flex gap-2">
          <Input
            placeholder="Nazwa nowego wariantu"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            disabled={isReadOnly}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newLabel.trim()) {
                addVariant()
              }
            }}
          />
          <Button type="button" size="icon" onClick={addVariant} disabled={isReadOnly || !newLabel.trim()} className="shrink-0">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Variants list */}
      <div className="min-h-0 flex-1 space-y-2">
        <h4 className="text-muted-foreground text-xs font-semibold">Warianty niestandardowe ({state.dynamicVariants?.length || 0})</h4>
        <div className="space-y-2 overflow-y-auto">
          {(state.dynamicVariants || []).map((v, i) => {
            const isActive = state.activeVariantId === v.id
            return (
              <button
                key={v.id}
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                  isActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50',
                )}
                onClick={() => handleVariantSelect(v.id)}
              >
                <div className="flex flex-1 items-center gap-1">
                  <Badge variant="outline">{i + 1}</Badge>
                  <p className="text-sm font-medium">{v.label}</p>
                </div>
                <div className="flex items-center gap-1">
                  {isActive && <div className="text-primary text-xs font-medium">Aktywny</div>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditVariant(v.id)
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isReadOnly) {
                        dispatch({type: 'REMOVE_VARIANT', payload: v.id})
                      }
                    }}
                    disabled={isReadOnly}
                    className={cn('text-destructive h-6 w-6 p-0', isReadOnly && 'opacity-30')}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
