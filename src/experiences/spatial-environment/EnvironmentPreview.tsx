import type { CSSProperties } from 'react'
import type { EnvironmentAtmosphere } from './atmosphere'

type Props = { temperature: number; atmosphere: EnvironmentAtmosphere }

const nameFor = (temperature: number) => {
  if (temperature >= 25) return 'Sunlit Warmth'
  if (temperature <= 18) return 'Cool Clarity'
  return 'Balanced Warmth'
}

export function EnvironmentPreview({ temperature, atmosphere }: Props) {
  return <aside className="environment-preview"><p>Current temperature</p><h2>{nameFor(temperature)}</h2><span>Adjust warmth through vertical motion.</span><div className="environment-orb" style={{ '--orb-glow': atmosphere.previewGlow, '--orb-motion': String(atmosphere.motionStrength) } as CSSProperties}><i /></div><dl><div><dt>♨ Temperature</dt><dd>{temperature}°C</dd></div></dl></aside>
}
