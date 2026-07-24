export type RawMotion = { x: number; y: number; z: number; timestamp: number; sequence: number }
export type ProcessedMotion = { raw: RawMotion; pitch: number; roll: number; normalizedPitch: number; normalizedRoll: number; horizontal: number; vertical: number; energy: number; isStill: boolean; sampleRateHz: number }
export type MotionSource = 'demo' | 'oura'
export type MotionStatus = 'demo' | 'bridge-offline' | 'connecting' | 'waiting-for-data' | 'calibrating' | 'streaming' | 'reconnecting' | 'stopped' | 'disconnected' | 'error'
export type MotionDiagnostics = { bridgeReachable: boolean; sseConnected: boolean; calibrated: boolean; samplesReceived: number; sampleRateHz: number; lastSampleAgeMs: number; reconnectAttempts: number; horizontalDegrees: number; verticalDegrees: number; rawMagnitude: number; settings: import('./oura/processing').OuraMotionSettings }
