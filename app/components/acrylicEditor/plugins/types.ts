import React from 'react'

/**
 * Definicja kontrolek UI dostarczanych przez plugin
 */
export interface PluginControls {
  desktop?: React.ReactNode // UI dla paska bocznego na desktopie
  mobile?: {
    // UI dla dolnego paska na mobile
    icon: React.ReactNode // Ikona do wyświetlenia na pasku
    content: React.ReactNode // Zawartość do wyświetlenia w wysuwanym panelu
    label: string // Etykieta pod ikoną
  }
}

/**
 * Definicja obiektu zwracanego przez hook pluginu
 */
export interface PluginOutput {
  id: string // Unikalny identyfikator pluginu
  state?: Record<string, any>
  methods?: Record<string, (...args: any[]) => any>
  controls?: PluginControls
}

/**
 * Definicja hooka pluginu
 */
export type Plugin<T = any> = (props: T) => PluginOutput
