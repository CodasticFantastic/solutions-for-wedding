import React, {createContext, useContext, useState, ReactNode} from 'react'
import {useMediaQuery} from '@/hooks/useMediaQuery'
import {Plugin, PluginOutput} from './plugins/types'

// --- Typy i stałe ---
type PanelSizeKey = '15x21' | '15x15'
const panelSizes: Record<PanelSizeKey, {width: number; height: number}> = {
  '15x21': {width: 15, height: 21},
  '15x15': {width: 15, height: 15},
}

interface ConfiguratorContextType {
  state: Record<string, any>
  methods: Record<string, any>
  controls: {
    desktop: ReactNode[]
    mobile: {icon: ReactNode; content: ReactNode; label: string}[]
  }
  isDesktop: boolean
}

const ConfiguratorContext = createContext<ConfiguratorContextType | null>(null)

interface ConfiguratorProviderProps {
  children: ReactNode
  plugins: Plugin<any>[]
}

const emptyPluginOutput: PluginOutput = {id: '', state: {}, methods: {}, controls: {}}

export function ConfiguratorProvider({children, plugins}: ConfiguratorProviderProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [selectedSizeKey, setSelectedSizeKey] = useState<PanelSizeKey>('15x21')

  const pluginProps = {
    zoom,
    setZoom,
    rotation,
    setRotation,
    selectedSizeKey,
    setSelectedSizeKey,
    panelSizes,
  }

  // Wywołujemy hooki pluginów w stałej kolejności, nie w pętli ani mapie
  const pluginOutputs: PluginOutput[] = [
    plugins[0] ? plugins[0](pluginProps) : emptyPluginOutput,
    plugins[1] ? plugins[1](pluginProps) : emptyPluginOutput,
    plugins[2] ? plugins[2](pluginProps) : emptyPluginOutput,
    plugins[3] ? plugins[3](pluginProps) : emptyPluginOutput,
  ]

  const aggregatedState = pluginOutputs.reduce((acc, output) => ({...acc, ...output.state}), {})
  const aggregatedMethods = pluginOutputs.reduce((acc, output) => ({...acc, ...output.methods}), {})

  const desktopControls = pluginOutputs
    .map((output) => output.controls?.desktop)
    .filter(Boolean) as ReactNode[]

  const mobileControls = pluginOutputs
    .map((output) => output.controls?.mobile)
    .filter(
      (ctrl): ctrl is {icon: ReactNode; content: ReactNode; label: string} =>
        !!ctrl &&
        typeof ctrl === 'object' &&
        'icon' in ctrl &&
        'content' in ctrl &&
        'label' in ctrl,
    )

  const value: ConfiguratorContextType = {
    state: {
      ...aggregatedState,
      zoom,
      rotation,
      selectedSizeKey,
      panelSizes,
    },
    methods: aggregatedMethods,
    controls: {
      desktop: desktopControls,
      mobile: mobileControls,
    },
    isDesktop,
  }

  return <ConfiguratorContext.Provider value={value}>{children}</ConfiguratorContext.Provider>
}

export function useAcrylicEditorContext() {
  const context = useContext(ConfiguratorContext)
  if (!context) {
    throw new Error('useConfigurator must be used within a ConfiguratorProvider')
  }
  return context
}
