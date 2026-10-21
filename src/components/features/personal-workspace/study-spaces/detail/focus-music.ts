export type MusicTrackSource =
  | { type: "generated"; preset: "rain" | "meadow" | "drone" }
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

  private buildPreset(ctx: AudioContext, master: GainNode, preset: "rain" | "meadow" | "drone"): StopHandle {
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
