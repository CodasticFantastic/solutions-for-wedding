import React from 'react'
import {Plugin, PluginControls} from './types'
import {Button} from '@/components/shadCn/ui/button'
import {Label} from '@/components/shadCn/ui/label'

const ZOOM_STEP = 0.1

interface ZoomPluginProps {
  zoom: number
  setZoom: (update: (prev: number) => number) => void
}

export const useZoomPlugin: Plugin<ZoomPluginProps> = (props) => {
  if (!props || typeof props.zoom !== 'number' || !props.setZoom) {
    return {
      id: 'zoom',
      state: {},
      methods: {},
      controls: {},
    }
  }
  const {zoom, setZoom} = props

  const handleZoomIn = () => setZoom((z) => Math.min(3, +(z + ZOOM_STEP).toFixed(2)))
  const handleZoomOut = () => setZoom((z) => Math.max(1, +(z - ZOOM_STEP).toFixed(2)))

  const DesktopControls = (
    <div>
      <Label className="mb-2 block">Zoom</Label>
      <div className="flex items-center gap-2">
        <Button onClick={handleZoomOut} variant="outline" size="icon" disabled={zoom <= 1}>
          -
        </Button>
        <div className="w-16 rounded border bg-gray-50 px-2 py-1 text-center text-sm">
          {Math.round(zoom * 100)}%
        </div>
        <Button onClick={handleZoomIn} variant="outline" size="icon" disabled={zoom >= 3}>
          +
        </Button>
      </div>
    </div>
  )

  // Na mobile zoom jest obsługiwany przez FloatingControls, a nie dolny panel.
  // Dlatego wtyczka zoom nie dostarcza kontrolek `mobile`.

  const controls: PluginControls = {
    desktop: DesktopControls,
  }

  return {
    id: 'zoom',
    state: {},
    methods: {},
    controls,
  }
} 