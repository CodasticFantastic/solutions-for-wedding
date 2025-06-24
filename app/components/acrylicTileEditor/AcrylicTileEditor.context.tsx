import {createContext, useContext, useReducer, ReactNode} from 'react'
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
        selectedElement: action.payload,
      }

    case 'ADD_ELEMENT':
      return {
        ...state,
        elements: [...state.elements, action.payload],
      }

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.payload.id ? {...el, ...action.payload.updates} : el,
        ),
      }

    case 'REMOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.filter((el) => el.id !== action.payload),
        selectedElement: state.selectedElement === action.payload ? null : state.selectedElement,
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
        selectedElement: null,
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
        selectedElement: null,
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
}

const AcrylicTileEditorContext = createContext<AcrylicTileEditorContextType | undefined>(undefined)

// --- Provider ---
interface AcrylicTileEditorProviderProps {
  children: ReactNode
  template: AcrylicTileTemplate
  onSave?: (data: any) => void
  initialState?: Partial<EditorState>
}

export function AcrylicTileEditorProvider({
  children,
  template,
  onSave,
  initialState: customInitialState,
}: AcrylicTileEditorProviderProps) {
  const initialState: EditorState = {
    canvas: {
      scale: 1,
      x: 0,
      y: 0,
      width: template.width,
      height: template.height,
    },
    selectedElement: null,
    elements: [],
    template,
    ...customInitialState,
  }

  const [state, dispatch] = useReducer(editorReducer, initialState)

  return (
    <AcrylicTileEditorContext.Provider value={{state, dispatch, onSave}}>
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
