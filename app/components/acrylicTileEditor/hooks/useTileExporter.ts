import {useCallback} from 'react'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'

export interface ExportOptions {
  includeBackground: boolean
  pixelRatio?: number
  autoDownload?: boolean
  fileName?: string
}

/**
 * useTileExporter – zwraca funkcję eksportującą kafelek do PNG.
 * Dzięki temu cała logika pozostaje oddzielona od warstwy UI.
 */
export function useTileExporter() {
  const {stageRef} = useAcrylicTileEditor()

  const exportAsPng = useCallback(
    ({includeBackground, pixelRatio = 2, autoDownload = true, fileName}: ExportOptions) => {
      const stage = stageRef.current
      if (!stage) return null

      // Ukryj warstwę tła jeżeli użytkownik nie chce go eksportować
      let bgNode: any = null
      if (!includeBackground) {
        bgNode = stage.findOne('.template-bg')
        if (bgNode) {
          bgNode.hide()
          stage.draw()
        }
      }

      const dataURL: string = stage.toDataURL({mimeType: 'image/png', pixelRatio})

      // Przywróć tło
      if (bgNode) {
        bgNode.show()
        stage.draw()
      }

      if (autoDownload) {
        const link = document.createElement('a')
        link.download =
          fileName ?? (includeBackground ? 'tile-with-bg.png' : 'tile-transparent.png')
        link.href = dataURL
        link.click()
      }

      return dataURL
    },
    [stageRef],
  )

  return {exportAsPng}
} 