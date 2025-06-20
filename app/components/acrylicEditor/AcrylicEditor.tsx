import {AcrylicPanelCanvas} from './layout/AcrylicPanelCanvas'
import {ConfiguratorProvider, useAcrylicEditorContext} from './acrylicEditor.context'

// Import wszystkich pluginów
import {useSizingPlugin} from './plugins/useSizingPlugin'
import {useRotationPlugin} from './plugins/useRotationPlugin'
import {useZoomPlugin} from './plugins/useZoomPlugin'
import {useCoreCanvasPlugin} from './plugins/useCoreCanvasPlugin'
import {AcrylicEditorDesktopPanel} from './layout/AcrulicEditorDesktopPanel'
import {AcrylicEditorMobileNav} from './layout/AcrylicEditorMobileNav'
import {AcrylicEditorFloatingZoom} from './layout/AcrylicEditorFloatingZoom'

// --- Typy ---
interface AcrylicEditorProps {
  template?: any // W przyszłości zdefiniujemy typ szablonu
}

// Cały kod poniżej powinien pozostac w tym pliku
function ConfiguratorLayout() {
  const {isDesktop} = useAcrylicEditorContext()

  return (
    <div className="flex h-full flex-col">
      <div className="mt-8 grid flex-grow grid-cols-1 gap-8 md:grid-cols-3">
        {isDesktop && <AcrylicEditorDesktopPanel />}
        <div className="relative col-span-1 h-full bg-gray-100 md:col-span-2">
          <AcrylicPanelCanvas>{/* Tutaj nadruk */}</AcrylicPanelCanvas>
          {!isDesktop && (
            <>
              <AcrylicEditorFloatingZoom />
              <AcrylicEditorMobileNav />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Główny Komponent Edytora ---
const activePlugins = [useSizingPlugin, useRotationPlugin, useZoomPlugin, useCoreCanvasPlugin]

export function AcrylicEditor({template}: AcrylicEditorProps) {
  // W przyszłości można przekazać `template` do pluginów
  return (
    <ConfiguratorProvider plugins={activePlugins}>
      <ConfiguratorLayout />
    </ConfiguratorProvider>
  )
}
