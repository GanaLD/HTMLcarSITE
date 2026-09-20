import { Check, X } from 'lucide-react'
import { appearanceOptions, type AppearanceMode } from './appearance'

export default function AppearanceMenu({ mode, selected, loaded, unavailable, waiting, onSelect, onClose }: {
  mode: AppearanceMode; selected: string; loaded: Set<string>; unavailable: Set<string>; waiting: boolean
  onSelect: (id: string) => void; onClose: () => void
}) {
  const options = appearanceOptions[mode]
  const current = options.find(option => option.id === selected)!
  return <div className={`appearance-menu ${mode}`} id={`appearance-${mode}`} role="group" aria-label={mode === 'paint' ? 'Cor da carroceria' : 'Design das rodas'}>
    <div className="appearance-heading"><span>{mode === 'paint' ? 'Pintura' : 'Rodas'}</span><button className="appearance-close" onClick={onClose} aria-label="Fechar e restaurar o veículo original"><X size={16} strokeWidth={1.5}/></button></div>
    <div className="appearance-options">
      {options.map(option => <button key={option.id} className={`appearance-option ${option.id === selected ? 'selected' : ''}`} disabled={waiting || !loaded.has(option.image)} aria-label={`${option.label}${unavailable.has(option.image) ? ' — indisponível' : ''}`} aria-pressed={option.id === selected} title={option.label} onClick={() => onSelect(option.id)}>
        {mode === 'paint' ? <span className="paint-chip" style={{ backgroundColor: option.color, color: option.id === 'graphite' ? '#fff' : '#111' }}>{option.id === selected && <Check size={14}/>}</span> : <span className="wheel-chip" style={{ backgroundImage: `url("${option.image}")` }}/>} 
      </button>)}
    </div>
    <div className="appearance-caption" aria-live="polite">{waiting ? 'Voltando ao exterior…' : current.label}<small>{unavailable.size ? 'Algumas opções não puderam ser carregadas' : 'Feche para explorar outros sistemas'}</small></div>
  </div>
}
