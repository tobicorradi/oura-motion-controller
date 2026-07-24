import { clampEnergy, clampSynth, type SynthPreset } from './music'
import { presets } from './presets'

export type SynthParameters = { frequency: number; filterFrequency: number; energy: number; isStill: boolean }

export class MotionSynthEngine {
  private context: AudioContext | null = null
  private oscillatorA: OscillatorNode | null = null
  private oscillatorB: OscillatorNode | null = null
  private voiceGain: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private master: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private delay: DelayNode | null = null
  private feedback: GainNode | null = null
  private lfo: OscillatorNode | null = null
  private lfoGain: GainNode | null = null
  private currentPreset: SynthPreset = 'ambient'
  private pulseTimer: number | null = null
  private hasGraph = false

  async enable() {
    if (!('AudioContext' in window || 'webkitAudioContext' in window)) throw new Error('Web Audio is not available in this browser.')
    if (!this.context) this.createGraph()
    if (!this.context) return
    await this.context.resume()
    this.master?.gain.setTargetAtTime(.105, this.context.currentTime, .12)
  }

  private createGraph() {
    const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextConstructor) throw new Error('Web Audio is not available in this browser.')
    this.context = new AudioContextConstructor()
    const context = this.context
    this.oscillatorA = context.createOscillator(); this.oscillatorB = context.createOscillator()
    this.voiceGain = context.createGain(); this.filter = context.createBiquadFilter(); this.master = context.createGain(); this.analyser = context.createAnalyser()
    this.delay = context.createDelay(.8); this.feedback = context.createGain(); this.lfo = context.createOscillator(); this.lfoGain = context.createGain()
    this.filter.type = 'lowpass'; this.filter.Q.value = 1.4; this.master.gain.value = 0; this.voiceGain.gain.value = .03; this.analyser.fftSize = 128; this.analyser.smoothingTimeConstant = .82
    const compressor = context.createDynamicsCompressor(); compressor.threshold.value = -24; compressor.knee.value = 22; compressor.ratio.value = 6; compressor.attack.value = .01; compressor.release.value = .22
    this.oscillatorA.connect(this.voiceGain); this.oscillatorB.connect(this.voiceGain); this.voiceGain.connect(this.filter)
    this.filter.connect(this.master); this.filter.connect(this.delay); this.delay.connect(this.feedback); this.feedback.connect(this.delay); this.delay.connect(this.master); this.master.connect(this.analyser); this.analyser.connect(compressor); compressor.connect(context.destination)
    this.lfo.connect(this.lfoGain); this.lfoGain.connect(this.voiceGain.gain)
    this.oscillatorA.start(); this.oscillatorB.start(); this.lfo.start(); this.hasGraph = true; this.applyPreset()
  }

  private applyPreset() {
    if (!this.context || !this.hasGraph) return
    const preset = presets[this.currentPreset]; const now = this.context.currentTime
    if (this.oscillatorA) this.oscillatorA.type = preset.oscillatorA
    if (this.oscillatorB) { this.oscillatorB.type = preset.oscillatorB; this.oscillatorB.detune.setTargetAtTime(preset.detune, now, .08) }
    this.delay?.delayTime.setTargetAtTime(preset.delayTime, now, .1); this.feedback?.gain.setTargetAtTime(Math.min(.35, preset.feedback), now, .1)
    this.lfo?.frequency.setTargetAtTime(preset.lfoRate, now, .1); this.lfoGain?.gain.setTargetAtTime(preset.lfoDepth * .04, now, .1)
  }

  setPreset(preset: SynthPreset) { this.currentPreset = preset; this.applyPreset() }
  update({ frequency, filterFrequency, energy, isStill }: SynthParameters) {
    if (!this.context || !this.hasGraph) return
    const { currentTime: now } = this.context; const preset = presets[this.currentPreset]; const calm = isStill ? .62 : 1; const intensity = clampEnergy(energy)
    const safeFrequency = clampSynth(frequency, 40, 12000); const safeFilter = clampSynth(filterFrequency, 200, 8000)
    this.oscillatorA?.frequency.setTargetAtTime(safeFrequency, now, preset.smoothing)
    this.oscillatorB?.frequency.setTargetAtTime(safeFrequency * (this.currentPreset === 'cosmic' ? 1.498 : 2), now, preset.smoothing)
    this.filter?.frequency.setTargetAtTime(safeFilter, now, .09)
    this.voiceGain?.gain.setTargetAtTime(clampSynth(preset.baseGain * calm + intensity * .02, .015, .09), now, .12)
    this.lfoGain?.gain.setTargetAtTime(preset.lfoDepth * (isStill ? .006 : .04 + intensity * .04), now, .15)
  }
  triggerPulse() {
    if (!this.context || !this.voiceGain || !this.filter) return
    const now = this.context.currentTime; const gain = this.voiceGain.gain.value
    this.voiceGain.gain.cancelScheduledValues(now); this.voiceGain.gain.setTargetAtTime(Math.min(.105, gain + .035), now, .012); this.voiceGain.gain.setTargetAtTime(gain, now + .15, .08)
    this.filter.frequency.setTargetAtTime(Math.min(8000, this.filter.frequency.value * 1.8), now, .015)
    if (this.pulseTimer) clearTimeout(this.pulseTimer)
    this.pulseTimer = window.setTimeout(() => this.filter?.frequency.setTargetAtTime(Math.max(400, this.filter!.frequency.value * .65), this.context?.currentTime ?? 0, .16), 180)
  }
  async disable() { if (!this.context) return; this.master?.gain.setTargetAtTime(0, this.context.currentTime, .08); await new Promise(resolve => setTimeout(resolve, 150)); if (this.context.state === 'running') await this.context.suspend() }
  getAnalyser() { return this.analyser }
  async dispose() { if (this.pulseTimer) clearTimeout(this.pulseTimer); if (!this.context) return; [this.oscillatorA, this.oscillatorB, this.lfo].forEach(node => { try { node?.stop() } catch { /* already stopped */ } }); await this.context.close(); this.context = null; this.hasGraph = false }
}
