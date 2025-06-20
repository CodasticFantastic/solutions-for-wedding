import React from 'react'
import {Plugin, PluginControls} from './types'
import {Scaling} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadCn/ui/select'
import {Label} from '@/components/shadCn/ui/label'

type PanelSizeKey = '15x21' | '15x15'

interface SizingPluginProps {
  selectedSizeKey: PanelSizeKey
  setSelectedSizeKey: (key: PanelSizeKey) => void
  panelSizes: Record<string, {width: number; height: number}>
}

export const useSizingPlugin: Plugin<SizingPluginProps> = (props) => {
  if (!props || !props.selectedSizeKey || !props.setSelectedSizeKey || !props.panelSizes) {
    return {
      id: 'sizing',
      state: {},
      methods: {},
      controls: {},
    }
  }
  const {selectedSizeKey, setSelectedSizeKey, panelSizes} = props

  const handleValueChange = (key: string) => {
    setSelectedSizeKey(key as PanelSizeKey)
  }

  const DesktopControls = (
    <div>
      <Label htmlFor="size-select" className="mb-2 block">
        Rozmiar
      </Label>
      <Select onValueChange={handleValueChange} value={selectedSizeKey}>
        <SelectTrigger id="size-select">
          <SelectValue placeholder="Wybierz rozmiar" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(panelSizes).map((key) => (
            <SelectItem key={key} value={key}>
              {key.replace('x', ' x ')} cm
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const MobileControls = (
    <div>Test Rozmiar</div>
  )

  const controls: PluginControls = {
    desktop: DesktopControls,
    mobile: {
      icon: <Scaling className="h-5 w-5" />,
      content: MobileControls,
      label: 'Rozmiar',
    },
  }

  return {
    id: 'sizing',
    state: {},
    methods: {},
    controls,
  }
} 