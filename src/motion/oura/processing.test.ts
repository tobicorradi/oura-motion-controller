import { describe, expect, it } from 'vitest'
import { averageNormalized, createOrientationBasis, defaultOuraSettings, deriveTilt, normalizeAxis, normalizeVector } from './processing'

describe('Oura gravity processing', () => {
  it('normalizes and averages gravity vectors', () => { expect(normalizeVector([0, 0, 0])).toBeNull(); expect(averageNormalized([[0, 0, 1000], [0, 0, 900]])).toEqual([0, 0, 1]) })
  it('builds an orthogonal calibration basis', () => { const basis = createOrientationBasis([0, 0, 1]); expect(basis.horizontal[2]).toBe(0); expect(basis.vertical[2]).toBe(0) })
  it('maps degrees through the configurable dead zone', () => { expect(normalizeAxis(2, 3, 28)).toBe(0); expect(normalizeAxis(28, 3, 28)).toBe(1) })
  it('applies axis inversion and swapping', () => { const basis = createOrientationBasis([0, 0, 1]); const regular = deriveTilt([300, 0, 950], basis, defaultOuraSettings); const inverted = deriveTilt([300, 0, 950], basis, { ...defaultOuraSettings, invertHorizontal: true }); expect(inverted.horizontal).toBeCloseTo(-regular.horizontal); const swapped = deriveTilt([300, 0, 950], basis, { ...defaultOuraSettings, swapAxes: true }); expect(swapped.vertical).toBeCloseTo(regular.horizontal) })
})
