import {createContext, useContext, useReducer, ReactNode, useRef} from 'react'
import {AcrylicTileTemplate, EditorState, EditorElement} from './acrylicTileEditor.types'

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
  | {type: 'LOAD_PROJECT'; payload: {template: AcrylicTileTemplate; elements: EditorElement[]}}
  | {type: 'MOVE_ELEMENT'; payload: {id: string; direction: 'UP' | 'DOWN'}}

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

    case 'ADD_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.payload],
      }

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) => (el.id === action.payload.id ? {...el, ...action.payload.updates} : el)),
      }

    case 'REMOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.payload),
        selectedElementId: state.selectedElementId === action.payload ? null : state.selectedElementId,
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
      return {
        ...state,
        elements: newElements,
      }
    }

    case 'RESET_CANVAS':
      return {
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

    case 'LOAD_PROJECT':
      return {
        ...state,
        template: action.payload.template,
        elements: action.payload.elements,
        selectedElementId: null,
        canvas: {
          ...state.canvas,
          width: action.payload.template.width,
          height: action.payload.template.height,
        },
      }

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
}

const AcrylicTileEditorContext = createContext<AcrylicTileEditorContextType | undefined>(undefined)

// --- Provider ---
interface AcrylicTileEditorProviderProps {
  children: ReactNode
  template: AcrylicTileTemplate
  onSave?: (data: any) => void
  initialState?: Partial<EditorState>
}

export function AcrylicTileEditorProvider({children, template, onSave, initialState: customInitialState}: AcrylicTileEditorProviderProps) {
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
    ...customInitialState,
  }

  const [state, dispatch] = useReducer(editorReducer, initialState)

  // This ref will hold Konva Stage instance
  const stageRef = useRef<any>(null)

  return <AcrylicTileEditorContext.Provider value={{state, dispatch, onSave, stageRef}}>{children}</AcrylicTileEditorContext.Provider>
}

// --- Hook ---
export function useAcrylicTileEditor() {
  const context = useContext(AcrylicTileEditorContext)
  if (context === undefined) {
    throw new Error('useAcrylicTileEditor must be used within an AcrylicTileEditorProvider')
  }
  return context
}
