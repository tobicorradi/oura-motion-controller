import { describe, expect, it } from 'vitest'
import { clampMotionValue, getDirection, isNeutral, normalizeInput, vectorMagnitude } from './direction'

describe('motion input direction utilities', () => {
  it('clamps invalid and outside values', () => { expect(clampMotionValue(2)).toBe(1); expect(clampMotionValue(-2)).toBe(-1); expect(clampMotionValue(Number.NaN)).toBe(0); expect(normalizeInput({ horizontal: Infinity, vertical: -.4 })).toEqual({ horizontal: 0, vertical: -.4 }) })
  it('uses a dead zone for neutral input', () => { expect(isNeutral({ horizontal: .08, vertical: .07 })).toBe(true); expect(isNeutral({ horizontal: .2, vertical: 0 })).toBe(false) })
  it('calculates clamped vector magnitude', () => { expect(vectorMagnitude({ horizontal: 1, vertical: 1 })).toBe(1); expect(vectorMagnitude({ horizontal: .3, vertical: .4 })).toBe(.5) })
  it('detects eight directions', () => { expect(getDirection({ horizontal: 1, vertical: 0 })).toBe('right'); expect(getDirection({ horizontal: 0, vertical: -1 })).toBe('up'); expect(getDirection({ horizontal: -.7, vertical: -.7 })).toBe('up-left'); expect(getDirection({ horizontal: .7, vertical: .7 })).toBe('down-right') })
  it('reports neutral at the center', () => { expect(getDirection({ horizontal: 0, vertical: 0 })).toBe('neutral') })
})
