export type AppearanceMode = 'paint' | 'wheels'
export const baseExterior = '/media/exterior-polished.png'
export type AppearanceOption = { id: string; label: string; image: string; color?: string }
export const appearanceOptions: Record<AppearanceMode, AppearanceOption[]> = {
  paint: [
    { id: 'silver', label: 'Prata de Estúdio', color: '#c9cfd2', image: baseExterior },
    { id: 'electric', label: 'Verde Elétrico', color: '#edff39', image: '/media/config/electric-green.png' },
    { id: 'lime', label: 'Verde Limão', color: '#9fdc32', image: '/media/config/lime-green.png' },
    { id: 'sky', label: 'Azul Céu', color: '#708fa2', image: '/media/config/sky-blue.png' },
    { id: 'graphite', label: 'Grafite', color: '#30363c', image: '/media/config/graphite.png' },
  ],
  wheels: [
    { id: 'original', label: 'Multirraios', image: baseExterior },
    { id: 'aero', label: 'Disco Aero', image: '/media/config/wheels-aero.png' },
    { id: 'forged', label: 'Forjada Esportiva', image: '/media/config/wheels-forged.png' },
  ],
}

export function canUseHotspot(active: AppearanceMode | null, id: string, closing: boolean) {
  return !closing && (!active || active === id)
}
