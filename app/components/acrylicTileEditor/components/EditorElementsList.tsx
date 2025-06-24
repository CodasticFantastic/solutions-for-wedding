import {Button} from '@/components/shadCn/ui/button'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Badge} from '@/components/shadCn/ui/badge'
import {CaseSensitive, ChevronDown, ChevronUp, Image, Trash2} from 'lucide-react'
import clsx from 'clsx'

// ---------------------------------------------------------------------------
// List of elements
// ---------------------------------------------------------------------------
export const EditorElementsList = () => {
  const {state, dispatch} = useAcrylicTileEditor()

  const selectedElementId = state.selectedElementId
  const elements = [...state.elements].slice().reverse() // highest first
  const selectElement = (id: string) => dispatch({type: 'SELECT_ELEMENT', payload: id})
  const moveElement = (id: string, direction: 'UP' | 'DOWN') =>
    dispatch({type: 'MOVE_ELEMENT', payload: {id, direction}})
  const removeElement = (id: string) => dispatch({type: 'REMOVE_ELEMENT', payload: id})
  const isTopMost = (id: string) =>
    state.elements.findIndex((e) => e.id === id) === state.elements.length - 1
  const isBottomMost = (id: string) => state.elements.findIndex((e) => e.id === id) === 0

  return (
    <>
      <p className="mb-2 text-base font-semibold">Dodane Elementy</p>
      <ul className="list-none space-y-1 overflow-y-auto pl-0">
        {elements.length === 0 && <p className="text-muted-foreground text-sm">Brak elementów</p>}
        {elements?.map((el) => (
          <EditorElementListItem
            key={el.id}
            element={el}
            selected={selectedElementId === el.id}
            topMost={isTopMost(el.id)}
            bottomMost={isBottomMost(el.id)}
            onSelect={() => selectElement(el.id)}
            onMove={(dir, e) => {
              e.stopPropagation()
              moveElement(el.id, dir)
            }}
            onRemove={(e) => {
              e.stopPropagation()
              removeElement(el.id)
            }}
          />
        ))}
      </ul>
    </>
  )
}

// ---------------------------------------------------------------------------
// List item element
// ---------------------------------------------------------------------------
interface EditorElementListItemProps {
  element: any
  selected: boolean
  topMost: boolean
  bottomMost: boolean
  onSelect: () => void
  onMove: (dir: 'UP' | 'DOWN', e: React.MouseEvent) => void
  onRemove: (e: React.MouseEvent) => void
}

const EditorElementListItem = ({
  element,
  selected,
  topMost,
  bottomMost,
  onSelect,
  onMove,
  onRemove,
}: EditorElementListItemProps) => {
  const label =
    element.type === 'text' ? element.properties.text || 'Tekst' : element.properties.alt || 'Obraz'

  return (
    <li key={element.id}>
      <Button
        variant={selected ? 'outline' : 'ghost'}
        size="sm"
        className="w-full justify-start space-x-1 px-1"
        onClick={onSelect}
      >
        {/* Badge with element type */}
        <Badge variant="outline">{element.type === 'text' ? <CaseSensitive /> : <Image />}</Badge>
        {/* Label with ellipsis */}
        <span className="flex-1 truncate px-1 text-left">{label}</span>
        {/* Element Controls */}
        <div className="ml-auto flex items-center space-x-2">
          {/* Up */}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => !topMost && onMove('UP', e)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !topMost) {
                e.preventDefault()
                onMove('UP', e as any)
              }
            }}
            className={clsx(
              'pointer-events-auto grid h-5 w-5 place-items-center',
              topMost && 'cursor-not-allowed opacity-30',
            )}
          >
            <ChevronUp className="pointer-events-none h-4 w-4" />
          </span>

          {/* Down */}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => !bottomMost && onMove('DOWN', e)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !bottomMost) {
                e.preventDefault()
                onMove('DOWN', e as any)
              }
            }}
            className={clsx(
              'pointer-events-auto grid h-5 w-5 place-items-center',
              bottomMost && 'cursor-not-allowed opacity-30',
            )}
          >
            <ChevronDown className="pointer-events-none h-4 w-4" />
          </span>

          {/* Delete */}
          <span
            role="button"
            tabIndex={0}
            onClick={onRemove}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onRemove(e as any)
              }
            }}
            className="text-destructive pointer-events-auto grid h-5 w-5 place-items-center"
          >
            <Trash2 className="pointer-events-none h-4 w-4" />
          </span>
        </div>
      </Button>
    </li>
  )
}
