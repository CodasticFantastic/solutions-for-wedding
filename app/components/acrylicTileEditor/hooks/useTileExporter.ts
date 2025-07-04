import {useCallback} from 'react'
import {flushSync} from 'react-dom'
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
  const {stageRef, state, dispatch} = useAcrylicTileEditor()

  const exportAsPng = useCallback(
    async ({includeBackground, pixelRatio = 2, autoDownload = true, fileName}: ExportOptions) => {
      const stage = stageRef.current
      if (!stage) return null

      // Odznacz wszystkie elementy przed eksportem i wymuś synchroniczny re-render
      flushSync(() => {
        dispatch({type: 'SELECT_ELEMENT', payload: null})
      })

      // Poczekaj na zaktualizowanie canvas
      return new Promise((resolve) => {
        setTimeout(() => {
          stage.draw()

          // Ukryj warstwę tła jeżeli użytkownik nie chce go eksportować
          let bgNode: any = null
          if (!includeBackground) {
            bgNode = stage.findOne('.template-bg')
            if (bgNode) {
              bgNode.hide()
              stage.draw()
            }
          }

          // Eksportuj tylko obszar płytki w oryginalnej rozdzielczości
          // Używamy oryginalnych wymiarów płytki, ale w kontekście stage'a
          const dataURL: string = stage.toDataURL({
            mimeType: 'image/png',
            pixelRatio,
            x: state.canvas.x,
            y: state.canvas.y,
            width: state.template.width * state.canvas.scale,
            height: state.template.height * state.canvas.scale,
          })

          // Przywróć tło
          if (bgNode) {
            bgNode.show()
            stage.draw()
          }

          if (autoDownload) {
            const link = document.createElement('a')
            link.download = fileName ?? (includeBackground ? 'tile-with-bg.png' : 'tile-transparent.png')
            link.href = dataURL
            link.click()
          }

          resolve(dataURL)
        })
      })
    },
    [
      stageRef,
      state.template.width,
      state.template.height,
      state.canvas.scale,
      state.canvas.x,
      state.canvas.y,
      state.selectedElementId,
      dispatch,
    ],
  )

  const waitNextFrame = () => new Promise((res) => requestAnimationFrame(() => res(null)))

  const exportAsPngMulti = useCallback(
    async ({includeBackground, pixelRatio = 2, autoDownload = true, fileName}: ExportOptions & {fileNamePattern?: string}) => {
      const variants = state.dynamicVariants || []
      if (variants.length === 0) {
        exportAsPng({includeBackground, pixelRatio, autoDownload, fileName})
        return
      }

      const originalVariantId = state.activeVariantId

      const patternTemplate = fileName || 'tile-{label}-{n}.png'

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i]
        dispatch({type: 'SET_ACTIVE_VARIANT', payload: variant.id})
        // wait for React to re-render canvas
        await waitNextFrame()
        const resolvedName = patternTemplate
          .replace('{label}', variant.label.replace(/[^a-z0-9_-]/gi, '_'))
          .replace('{n}', (i + 1).toString())
        await exportAsPng({includeBackground, pixelRatio, autoDownload, fileName: resolvedName})
        // small delay to allow file dialog to proceed
        await waitNextFrame()
      }

      // restore original variant
      dispatch({type: 'SET_ACTIVE_VARIANT', payload: originalVariantId})
    },
    [state.dynamicVariants, state.activeVariantId, exportAsPng, dispatch],
  )

  const exportAsJson = useCallback(() => {
    // Przygotuj kompletne dane projektu
    const projectData = {
      template: state.template,
      elements: state.elements,
      dynamicVariants: state.dynamicVariants || [],
      activeVariantId: state.activeVariantId,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    }

    // Konwertuj do JSON
    const jsonString = JSON.stringify(projectData, null, 2)
    const blob = new Blob([jsonString], {type: 'application/json'})
    const url = URL.createObjectURL(blob)

    // Utwórz link do pobrania
    const link = document.createElement('a')
    link.href = url
    link.download = `${state.template.name || 'projekt'}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Wyczyść URL
    URL.revokeObjectURL(url)
  }, [state])

  return {exportAsPng, exportAsPngMulti, exportAsJson}
}
