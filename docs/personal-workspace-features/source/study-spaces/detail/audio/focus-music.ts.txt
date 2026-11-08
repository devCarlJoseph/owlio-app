export type GeneratedPreset = "rain" | "meadow" | "drone" | "lofi" | "piano"

export type MusicTrackSource =
  | { type: "generated"; preset: GeneratedPreset }
  | { type: "file"; src: string | null }

export type MusicTrack = {
  id: string
  title: string
  category: string
  source: MusicTrackSource
}

// File tracks need a licensed audio asset or URL before they can play.
export const focusMusicTracks: MusicTrack[] = [
  {
    id: "lofi-loop",
    title: "Lo-fi Study Loop",
    category: "Lo-fi beats (generated)",
    source: { type: "generated", preset: "lofi" },
  },
  {
    id: "piano-arpeggio",
    title: "Quiet Piano Arpeggio",
    category: "Soft piano (generated)",
    source: { type: "generated", preset: "piano" },
  },
  {
    id: "gentle-rain",
    title: "Gentle Rain",
    category: "Rain & ambience",
    source: { type: "generated", preset: "rain" },
  },
  {
    id: "forest-breeze",
    title: "Forest Breeze",
    category: "Nature sounds",
    source: { type: "generated", preset: "meadow" },
  },
  {
    id: "deep-focus-pad",
    title: "Deep Focus Pad",
    category: "Deep-focus ambient",
    source: { type: "generated", preset: "drone" },
  },
  {
    id: "lofi-beats",
    title: "Lo-fi Study Beats",
    category: "Lo-fi beats",
    source: { type: "file", src: null },
  },
  {
    id: "soft-piano",
    title: "Soft Piano",
    category: "Soft piano",
    source: { type: "file", src: null },
  },
]

export function isTrackPlayable(track: MusicTrack): boolean {
  return track.source.type === "generated" || (track.source.type === "file" && Boolean(track.source.src))
}

type StopHandle = () => void

// Real audio playback: generated presets synthesize ambience through the Web Audio API,
// file tracks play through an <audio> element routed into the same volume control.
export class FocusMusicEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private stops: StopHandle[] = []
  private element: HTMLAudioElement | null = null

  get supported(): boolean {
    return typeof window !== "undefined" && typeof window.AudioContext !== "undefined"
  }

  private ensureContext(): { ctx: AudioContext; master: GainNode } {
    if (!this.ctx || !this.master) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.connect(this.ctx.destination)
    }
    return { ctx: this.ctx, master: this.master }
  }

  play(track: MusicTrack): void {
    this.stop()
    const { ctx, master } = this.ensureContext()
    if (ctx.state === "suspended") void ctx.resume()

    if (track.source.type === "file") {
      if (!track.source.src) return
      const element = new Audio(track.source.src)
      element.loop = true
      const node = ctx.createMediaElementSource(element)
      node.connect(master)
      void element.play()
      this.element = element
      this.stops.push(() => {
        element.pause()
        node.disconnect()
      })
      return
    }

    this.stops.push(this.buildPreset(ctx, master, track.source.preset))
  }

  private buildPreset(ctx: AudioContext, master: GainNode, preset: GeneratedPreset): StopHandle {
    if (preset === "lofi" || preset === "piano") return this.buildMelodic(ctx, master, preset)
    const noise = this.createNoiseSource(ctx)

    if (preset === "drone") {
      const lowpass = ctx.createBiquadFilter()
      lowpass.type = "lowpass"
      lowpass.frequency.value = 320
      const padGain = ctx.createGain()
      padGain.gain.value = 0.16

      const oscA = ctx.createOscillator()
      oscA.type = "sine"
      oscA.frequency.value = 110
      const oscB = ctx.createOscillator()
      oscB.type = "sine"
      oscB.frequency.value = 165
      oscB.detune.value = 4

      const lfo = ctx.createOscillator()
      lfo.frequency.value = 0.08
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.05
      lfo.connect(lfoGain)
      lfoGain.connect(padGain.gain)

      oscA.connect(lowpass)
      oscB.connect(lowpass)
      lowpass.connect(padGain)
      padGain.connect(master)
      oscA.start()
      oscB.start()
      lfo.start()

      return () => {
        ;[oscA, oscB, lfo].forEach((osc) => osc.stop())
        lowpass.disconnect()
        padGain.disconnect()
        lfoGain.disconnect()
      }
    }

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = preset === "rain" ? 1400 : 520
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = preset === "rain" ? 0.22 : 0.14

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(master)
    noise.start()

    if (preset === "meadow") {
      const shimmer = this.createNoiseSource(ctx)
      const band = ctx.createBiquadFilter()
      band.type = "bandpass"
      band.frequency.value = 2400
      band.Q.value = 0.6
      const shimmerGain = ctx.createGain()
      shimmerGain.gain.value = 0.05
      shimmer.connect(band)
      band.connect(shimmerGain)
      shimmerGain.connect(master)
      shimmer.start()

      return () => {
        noise.stop()
        shimmer.stop()
        filter.disconnect()
        noiseGain.disconnect()
        band.disconnect()
        shimmerGain.disconnect()
      }
    }

    return () => {
      noise.stop()
      filter.disconnect()
      noiseGain.disconnect()
    }
  }

  // Chord loops are scheduled a short time ahead, so nothing needs an audio file.
  private buildMelodic(ctx: AudioContext, master: GainNode, preset: "lofi" | "piano"): StopHandle {
    const lofi = preset === "lofi"
    const bus = ctx.createGain()
    bus.gain.value = lofi ? 0.55 : 0.6
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = "lowpass"
    lowpass.frequency.value = lofi ? 1700 : 3600
    bus.connect(lowpass)
    lowpass.connect(master)

    const beat = 60 / (lofi ? 72 : 58)
    const chords = [
      [57, 60, 64, 67],
      [53, 57, 60, 64],
      [48, 55, 60, 64],
      [55, 59, 62, 65],
    ]
    const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

    const note = (midi: number, when: number, length: number, type: OscillatorType, gain: number) => {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      osc.type = type
      osc.frequency.value = frequency(midi)
      env.gain.setValueAtTime(0.0001, when)
      env.gain.linearRampToValueAtTime(gain, when + 0.02)
      env.gain.exponentialRampToValueAtTime(0.0001, when + length)
      osc.connect(env)
      env.connect(bus)
      osc.start(when)
      osc.stop(when + length + 0.05)
    }

    const kick = (when: number) => {
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      osc.frequency.setValueAtTime(130, when)
      osc.frequency.exponentialRampToValueAtTime(42, when + 0.16)
      env.gain.setValueAtTime(0.5, when)
      env.gain.exponentialRampToValueAtTime(0.0001, when + 0.22)
      osc.connect(env)
      env.connect(bus)
      osc.start(when)
      osc.stop(when + 0.25)
    }

    const hat = (when: number) => {
      const source = this.createNoiseSource(ctx)
      const highpass = ctx.createBiquadFilter()
      highpass.type = "highpass"
      highpass.frequency.value = 6000
      const env = ctx.createGain()
      env.gain.setValueAtTime(0.06, when)
      env.gain.exponentialRampToValueAtTime(0.0001, when + 0.05)
      source.connect(highpass)
      highpass.connect(env)
      env.connect(bus)
      source.start(when)
      source.stop(when + 0.08)
    }

    let step = 0
    let nextTime = ctx.currentTime + 0.1

    const schedule = () => {
      while (nextTime < ctx.currentTime + 0.5) {
        const chord = chords[Math.floor(step / 8) % chords.length]
        const eighth = step % 8

        if (lofi) {
          if (eighth === 0) {
            chord.forEach((midi) => note(midi, nextTime, beat * 3.6, "triangle", 0.07))
            note(chord[0] - 24, nextTime, beat * 1.8, "sine", 0.2)
          }
          if (eighth === 0 || eighth === 5) kick(nextTime)
          if (eighth % 2 === 1) hat(nextTime)
          if (Math.random() < 0.35) note(chord[Math.floor(Math.random() * 4)] + 12, nextTime, beat * 1.2, "sine", 0.07)
        } else {
          const midi = chord[eighth % 4] + (eighth >= 4 ? 12 : 0)
          note(midi, nextTime, beat * 2.2, "triangle", 0.11)
          note(midi + 12, nextTime, beat * 1.4, "sine", 0.035)
          if (eighth === 0) note(chord[0] - 12, nextTime, beat * 3, "sine", 0.12)
        }

        nextTime += beat / 2
        step += 1
      }
    }

    schedule()
    const timer = window.setInterval(schedule, 150)

    return () => {
      window.clearInterval(timer)
      bus.disconnect()
      lowpass.disconnect()
    }
  }

  private createNoiseSource(ctx: AudioContext): AudioBufferSourceNode {
    const length = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < length; i += 1) {
      // Brown-ish noise keeps rain and nature presets soft instead of harsh.
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.2
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    return source
  }

  pauseFilePlayback(): void {
    this.element?.pause()
  }

  resumeFilePlayback(): void {
    if (this.element) void this.element.play()
  }

  setVolume(volume: number): void {
    if (this.master) this.master.gain.value = volume
  }

  stop(): void {
    this.stops.forEach((stop) => stop())
    this.stops = []
    this.element = null
  }
}
