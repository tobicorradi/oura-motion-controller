import type { EnvironmentAtmosphere } from './atmosphere'
import type { CSSProperties } from 'react'

type Props = { temperature: number; lighting: string; airflow: string; atmosphere: EnvironmentAtmosphere }

const nameFor = (temperature: number, lighting: string, airflow: string) => {
  if (lighting === 'Midnight') return 'Quiet Midnight'
  if (temperature >= 25) return 'Sunlit Warmth'
  if (temperature <= 18) return 'Cool Clarity'
  if (airflow === 'Strong') return 'Fresh Current'
  return 'Balanced Warmth'
}

export function EnvironmentPreview({ temperature, lighting, airflow, atmosphere }: Props) {
  return <aside className="environment-preview"><p>Current climate</p><h2>{nameFor(temperature, lighting, airflow)}</h2><span>Comfort and clarity in harmony.</span><div className="environment-orb" style={{ '--orb-glow': atmosphere.previewGlow, '--orb-motion': String(atmosphere.motionStrength) } as CSSProperties}><i /></div><dl><div><dt>♨ Temperature</dt><dd>{temperature}°C</dd></div><div><dt>☼ Lighting</dt><dd>{lighting}</dd></div><div><dt>≈ Airflow</dt><dd>{airflow}</dd></div></dl></aside>
}
