import { describe, expect, it } from 'vitest'
import { parseOuraAcmSample } from './OuraSseMotionSource'

describe('parseOuraAcmSample', () => {
  it('accepts the bridge SSE payload', () => expect(parseOuraAcmSample('{"x":123,"y":-45,"z":987}')).toEqual({ x: 123, y: -45, z: 987 }))
  it('rejects malformed and non-finite samples', () => { expect(parseOuraAcmSample('not json')).toBeNull(); expect(parseOuraAcmSample('{"x":1,"y":"2","z":3}')).toBeNull(); expect(parseOuraAcmSample('{"x":1,"y":null,"z":3}')).toBeNull() })
})
