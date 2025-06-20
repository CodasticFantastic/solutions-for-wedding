import React from 'react'
import {RotateCcw, ChevronLeft, ChevronRight} from 'lucide-react'
import {Plugin, PluginControls} from './types'
import {Button} from '@/components/shadCn/ui/button'
import {Label} from '@/components/shadCn/ui/label'

interface RotationPluginProps {
  rotation: number
  setRotation: (update: (prev: number) => number) => void
}

export const useRotationPlugin: Plugin<RotationPluginProps> = (props) => {
  if (!props || typeof props.rotation !== 'number' || !props.setRotation) {
    return {
      id: 'rotation',
      state: {},
      methods: {},
      controls: {},
    }
  }
  const {rotation, setRotation} = props

  const handleRotate = (angle: number) => {
    setRotation((r) => r + angle)
  }
  const handleReset = () => {
    setRotation(() => 0)
  }

  const DesktopControls = (
    <div>
      <Label className="mb-2 block">Obrót</Label>
      <div className="flex items-center gap-2">
        <Button onClick={() => handleRotate(-90)} variant="outline" size="icon">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-mono">{rotation % 360}°</span>
        <Button onClick={() => handleRotate(90)} variant="outline" size="icon">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button onClick={handleReset} variant="ghost" size="icon" title="Resetuj obrót">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const MobileControls = (
    <div>Test Obrót</div>
  )

  const controls: PluginControls = {
    desktop: DesktopControls,
    mobile: {
      icon: <RotateCcw className="h-5 w-5" />,
      content: MobileControls,
      label: 'Obrót',
    },
  }

  return {
    id: 'rotation',
    state: {},
    methods: {},
    controls,
  }
}
