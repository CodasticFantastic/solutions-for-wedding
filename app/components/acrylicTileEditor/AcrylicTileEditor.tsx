import {AcrylicTileEditorProvider} from './AcrylicTileEditor.context'
import {AcrylicTileTemplate, EditorState} from './acrylicTileEditor.types'
import {LeftPanel} from './layout/LeftPanel'
import {RightPanel} from './layout/RightPanel'
import {Canvas} from './layout/Canvas'

interface AcrylicTileEditorProps {
  template: AcrylicTileTemplate
  onSave?: (data: any) => void
  initialState?: Partial<EditorState>
  isLoggedIn: boolean
}

export function AcrylicTileEditor({template, onSave, initialState, isLoggedIn}: AcrylicTileEditorProps) {
  return (
    <AcrylicTileEditorProvider template={template} onSave={onSave} initialState={initialState} isLoggedIn={isLoggedIn}>
      <div className="flex h-[calc(100vh-64px)]">
        <div className="bg-background w-80 border-r">
          <LeftPanel />
        </div>
        <div className="flex-1">
          <Canvas />
        </div>
        <div className="bg-background w-96 border-l">
          <RightPanel />
        </div>
      </div>
    </AcrylicTileEditorProvider>
  )
}
