import { describe, expect, it } from 'vitest'
import { createAtmosphere } from './atmosphere'
import { defaultSelection } from './environmentData'
import { applyWheelDeadZone, clampWheelPosition, nextCategory, releaseCategorySwitch, shouldSwitchCategory, snapWheelIndex } from './environmentUtils'

describe('spatial environment utilities', () => {
  it('clamps the wheel to its valid range and snaps to a value', () => {
    expect(clampWheelPosition(-3, 13)).toBe(0)
    expect(clampWheelPosition(20, 13)).toBe(12)
    expect(snapWheelIndex(5.62, 13)).toBe(6)
  })

  it('uses a neutral dead zone for invalid and tiny motion', () => {
    expect(applyWheelDeadZone(.08)).toBe(0)
    expect(applyWheelDeadZone(Number.NaN)).toBe(0)
    expect(applyWheelDeadZone(-.4)).toBe(-.4)
  })

  it('switches categories once per threshold crossing and cooldown', () => {
    expect(shouldSwitchCategory(.6, true, 1000, 0)).toBe(true)
    expect(shouldSwitchCategory(.6, true, 1200, 1000)).toBe(false)
    expect(releaseCategorySwitch(.2)).toBe(true)
    expect(nextCategory('temperature', 1)).toBe('lighting')
    expect(nextCategory('temperature', -1)).toBe('airflow')
  })

  it('maps lighting and airflow to a valid atmosphere', () => {
    const cool = createAtmosphere(17, 'Cool White', 'Still')
    const warm = createAtmosphere(26, 'Golden Hour', 'Strong')
    expect(cool.accent).not.toBe('#2f80ff')
    expect(warm.accent).not.toBe('#d88b2e')
    expect(warm.previewGlow).not.toBe('#ffd495')
    expect(warm.motionStrength).toBeGreaterThan(cool.motionStrength)
  })

  it('keeps the documented reset defaults', () => {
    expect(defaultSelection).toEqual({ temperature: 5, lighting: 2, airflow: 1 })
  })
})
