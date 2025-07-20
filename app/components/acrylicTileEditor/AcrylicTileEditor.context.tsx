import {createContext, useContext, useReducer, ReactNode, useRef, useState, useEffect} from 'react'
import {AcrylicTileTemplate, EditorState, EditorElement, DynamicVariant} from './acrylicTileEditor.types'

// --- Akcje ---
type EditorAction =
  | {type: 'SET_CANVAS_SCALE'; payload: number}
  | {type: 'SET_CANVAS_POSITION'; payload: {x: number; y: number}}
  | {type: 'SET_CANVAS_SIZE'; payload: {width: number; height: number}}
  | {type: 'SELECT_ELEMENT'; payload: string | null}
  | {type: 'ADD_ELEMENT'; payload: EditorElement}
  | {type: 'UPDATE_ELEMENT'; payload: {id: string; updates: Partial<EditorElement>}}
  | {type: 'REMOVE_ELEMENT'; payload: string}
  | {type: 'RESET_CANVAS'}
  | {type: 'UPDATE_TEMPLATE'; payload: Partial<AcrylicTileTemplate>}
  | {
      type: 'LOAD_PROJECT'
      payload: {template: AcrylicTileTemplate; elements: EditorElement[]; dynamicVariants?: DynamicVariant[]; activeVariantId?: string}
    }
  | {type: 'MOVE_ELEMENT'; payload: {id: string; direction: 'UP' | 'DOWN'}}
  | {type: 'ADD_VARIANT'; payload: DynamicVariant}
  | {type: 'UPDATE_VARIANT'; payload: {id: string; updates: Partial<DynamicVariant>}}
  | {type: 'SET_ACTIVE_VARIANT'; payload: string | undefined}
  | {type: 'REMOVE_VARIANT'; payload: string}
  | {type: 'CLEANUP_VARIANTS'}

// Helper function to check if there are any dynamic elements
const hasDynamicElements = (elements: EditorElement[]): boolean => {
  return elements.some((el) => el.type === 'text' && (el.properties as any).isDynamic === true)
}

// Helper function to check if editor is in read-only mode
const isReadOnly = (template: AcrylicTileTemplate): boolean => {
  return template.isEditable === false
}

// Helper function to cleanup variants when no dynamic elements exist
const cleanupVariantsIfNeeded = (state: EditorState): EditorState => {
  if (!hasDynamicElements(state.elements) && (state.dynamicVariants?.length || 0) > 0) {
    return {
      ...state,
      dynamicVariants: [],
      activeVariantId: undefined,
    }
  }
  return state
}

// --- Reducer ---
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_CANVAS_SCALE':
      return {
        ...state,
        canvas: {...state.canvas, scale: action.payload},
      }

    case 'SET_CANVAS_POSITION':
      return {
        ...state,
        canvas: {...state.canvas, x: action.payload.x, y: action.payload.y},
      }

    case 'SET_CANVAS_SIZE':
      return {
        ...state,
        canvas: {...state.canvas, width: action.payload.width, height: action.payload.height},
      }

    case 'SELECT_ELEMENT':
      return {
        ...state,
        selectedElementId: action.payload,
      }

    case 'ADD_ELEMENT': {
      const newState = {
        ...state,
        elements: [...state.elements, action.payload],
        selectedElementId: action.payload.id,
      }
      return cleanupVariantsIfNeeded(newState)
    }

    case 'UPDATE_ELEMENT': {
      const positionalKeys = ['x', 'y', 'width', 'height', 'rotation'] as const

      const elementToUpdate = state.elements.find((e) => e.id === action.payload.id)
      if (!elementToUpdate) return state

      // Split updates into positional (variant-specific) and global updates
      const positionalUpdates: Partial<EditorElement> = {}
      const globalUpdates: Partial<EditorElement> = {}

      for (const [key, value] of Object.entries(action.payload.updates)) {
        if (key === 'properties') {
          // always global properties
          ;(globalUpdates as any).properties = value
        } else if (positionalKeys.includes(key as any)) {
          ;(positionalUpdates as any)[key] = value
        } else {
          ;(globalUpdates as any)[key] = value
        }
      }

      let newDynamicVariants = state.dynamicVariants

      // If there is active variant AND element is dynamic, store positional updates in overrides
      if (state.activeVariantId && (elementToUpdate as any).properties?.isDynamic) {
        newDynamicVariants = (state.dynamicVariants || []).map((v) => {
          if (v.id !== state.activeVariantId) return v

          const prevOverrides = v.overrides?.[elementToUpdate.id] || {}
          return {
            ...v,
            overrides: {
              ...v.overrides,
              [elementToUpdate.id]: {
                ...prevOverrides,
                ...positionalUpdates,
              },
            },
          }
        })
      } else {
        // If no active variant or element not dynamic, apply positional updates globally
        Object.assign(globalUpdates, positionalUpdates)
      }

      const newState = {
        ...state,
        elements: state.elements.map((el) => {
          if (el.id !== action.payload.id) return el
          return {
            ...el,
            ...(globalUpdates as Partial<EditorElement>),
            properties: {
              ...el.properties,
              ...(globalUpdates as any).properties,
            },
          }
        }),
        dynamicVariants: newDynamicVariants,
      }
      return cleanupVariantsIfNeeded(newState)
    }

    case 'REMOVE_ELEMENT': {
      const newState = {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.payload),
        selectedElementId: state.selectedElementId === action.payload ? null : state.selectedElementId,
      }
      return cleanupVariantsIfNeeded(newState)
    }

    case 'MOVE_ELEMENT': {
      const {id, direction} = action.payload
      const index = state.elements.findIndex((el) => el.id === id)
      if (index === -1) return state
      const newElements = [...state.elements]
      if (direction === 'UP' && index < newElements.length - 1) {
        ;[newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]]
      } else if (direction === 'DOWN' && index > 0) {
        ;[newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]]
      }
      const newState = {
        ...state,
        elements: newElements,
      }
      return cleanupVariantsIfNeeded(newState)
    }

    case 'RESET_CANVAS': {
      const newState = {
        ...state,
        canvas: {
          scale: 1,
          x: 0,
          y: 0,
          width: state.template.width,
          height: state.template.height,
        },
        elements: [],
        selectedElementId: null,
      }
      return cleanupVariantsIfNeeded(newState)
    }

    case 'UPDATE_TEMPLATE': {
      const updatedTemplate = {...state.template, ...action.payload}
      const updatedCanvas = {
        ...state.canvas,
        width: updatedTemplate.width,
        height: updatedTemplate.height,
      }
      return {
        ...state,
        template: updatedTemplate,
        canvas: updatedCanvas,
      }
    }

    case 'LOAD_PROJECT': {
      const newState = {
        ...state,
        template: action.payload.template,
        elements: action.payload.elements,
        dynamicVariants: action.payload.dynamicVariants || [],
        activeVariantId: action.payload.activeVariantId,
        selectedElementId: null,
        canvas: {
          ...state.canvas,
          width: action.payload.template.width,
          height: action.payload.template.height,
        },
      }
      return cleanupVariantsIfNeeded(newState)
    }

    case 'ADD_VARIANT':
      return {
        ...state,
        dynamicVariants: [...(state.dynamicVariants || []), action.payload],
      }

    case 'UPDATE_VARIANT':
      return {
        ...state,
        dynamicVariants: (state.dynamicVariants || []).map((v) => (v.id === action.payload.id ? {...v, ...action.payload.updates} : v)),
      }

    case 'SET_ACTIVE_VARIANT':
      return {
        ...state,
        activeVariantId: action.payload,
      }

    case 'REMOVE_VARIANT':
      return {
        ...state,
        dynamicVariants: (state.dynamicVariants || []).filter((v) => v.id !== action.payload),
        activeVariantId: state.activeVariantId === action.payload ? undefined : state.activeVariantId,
      }

    case 'CLEANUP_VARIANTS':
      return cleanupVariantsIfNeeded(state)

    default:
      return state
  }
}

// --- Kontekst ---
interface AcrylicTileEditorContextType {
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
  onSave?: (data: any) => void
  stageRef: React.RefObject<any>
  isLoggedIn: boolean
  isReadOnly: boolean
  selectedStep: EditorStep
  setSelectedStep: (step: EditorStep) => void
  projectHasName: boolean
}

const AcrylicTileEditorContext = createContext<AcrylicTileEditorContextType | undefined>(undefined)

type EditorStep = 'I' | 'II' | 'III'

// --- Provider ---
interface AcrylicTileEditorProviderProps {
  children: ReactNode
  template: AcrylicTileTemplate
  onSave?: (data: any) => void
  initialState?: Partial<EditorState>
  isLoggedIn: boolean
}

export function AcrylicTileEditorProvider({
  children,
  template,
  onSave,
  initialState: customInitialState,
  isLoggedIn,
}: AcrylicTileEditorProviderProps) {
  const [selectedStep, setSelectedStep] = useState<EditorStep>('I')
  const [projectHasName, setProjectHasName] = useState(false)
  const initialState: EditorState = {
    canvas: {
      scale: 1,
      x: 0,
      y: 0,
      width: template.width,
      height: template.height,
    },
    selectedElementId: null,
    elements: [],
    template,
    dynamicVariants: [],
    activeVariantId: undefined,
    ...customInitialState,
  }

  const [state, dispatch] = useReducer(editorReducer, initialState)

  useEffect(() => {
    setProjectHasName(state.template.name !== '')
  }, [state.template.name])

  // This ref will hold Konva Stage instance
  const stageRef = useRef<any>(null)

  return (
    <AcrylicTileEditorContext.Provider
      value={{
        state,
        dispatch,
        onSave,
        stageRef,
        isLoggedIn,
        isReadOnly: isReadOnly(state.template),
        selectedStep,
        setSelectedStep,
        projectHasName,
      }}
    >
      {children}
    </AcrylicTileEditorContext.Provider>
  )
}

// --- Hook ---
export function useAcrylicTileEditor() {
  const context = useContext(AcrylicTileEditorContext)
  if (context === undefined) {
    throw new Error('useAcrylicTileEditor must be used within an AcrylicTileEditorProvider')
  }
  return context
}
