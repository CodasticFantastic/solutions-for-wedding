import {useEffect} from 'react'
import {AcrylicTileTemplate} from '../acrylicTileEditor.types'

interface Args {
  containerSize: {width: number; height: number}
  template: AcrylicTileTemplate
  dispatch: React.Dispatch<any>
}

/**
 * Fits the template into the container on mount / when container size changes.
 */
export function useInitialFit({containerSize, template, dispatch}: Args) {
  useEffect(() => {
    if (!containerSize.width || !containerSize.height) return
    const {width: tW, height: tH} = template
    const scale = Math.min(containerSize.width / tW, containerSize.height / tH, 1) * 0.9
    const x = (containerSize.width - tW * scale) / 2
    const y = (containerSize.height - tH * scale) / 2

    dispatch({type: 'SET_CANVAS_SCALE', payload: scale})
    dispatch({type: 'SET_CANVAS_POSITION', payload: {x, y}})
  }, [containerSize, template, dispatch])
} 