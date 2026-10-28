import { useEffect, useState } from "react"

export type LightPhase = "morning" | "day" | "evening" | "night"
export type LightSetting = "auto" | LightPhase

export type LightingPreset = {
  background: string
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  ambient: number
  sunColor: string
  sunIntensity: number
  sunPosition: [number, number, number]
  // 0 = lamps off, 1 = lamps fully lit.
  lamps: number
}

export const LIGHTING: Record<LightPhase, LightingPreset> = {
  morning: {
    background: "#e6f0fb",
    hemiSky: "#f4f9ff",
    hemiGround: "#cfdbe9",
    hemiIntensity: 0.85,
    ambient: 0.5,
    sunColor: "#ffe9c7",
    sunIntensity: 1.2,
    sunPosition: [-14, 14, 10],
    lamps: 0,
  },
  day: {
    background: "#e8eef6",
    hemiSky: "#ffffff",
    hemiGround: "#cdd8e6",
    hemiIntensity: 0.9,
    ambient: 0.55,
    sunColor: "#ffffff",
    sunIntensity: 1.3,
    sunPosition: [12, 20, 9],
    lamps: 0,
  },
  evening: {
    background: "#f3dcc6",
    hemiSky: "#ffd7a8",
    hemiGround: "#b9a7a0",
    hemiIntensity: 0.65,
    ambient: 0.35,
    sunColor: "#ffb36b",
    sunIntensity: 1,
    sunPosition: [16, 8, 4],
    lamps: 0.6,
  },
  night: {
    background: "#1c2640",
    hemiSky: "#8ea4d6",
    hemiGround: "#2b3350",
    hemiIntensity: 0.45,
    ambient: 0.22,
    sunColor: "#a9bdf0",
    sunIntensity: 0.35,
    sunPosition: [-10, 18, -6],
    lamps: 1,
  },
}

export const LIGHT_LABELS: Record<LightSetting, string> = {
  auto: "Auto light",
  morning: "Morning light",
  day: "Daylight",
  evening: "Evening light",
  night: "Night light",
}

export const LIGHT_SETTINGS: LightSetting[] = ["auto", "morning", "day", "evening", "night"]

export function phaseForHour(hour: number): LightPhase {
  if (hour >= 5 && hour < 10) return "morning"
  if (hour >= 10 && hour < 17) return "day"
  if (hour >= 17 && hour < 20) return "evening"
  return "night"
}

// Outdoor look for the study hall city at each phase.
export const HALL_LIGHTING: Record<LightPhase, { sky: string; ground: string; hemi: number; sun: string; sunIntensity: number; sunPosition: [number, number, number]; ambient: number; lamps: number }> = {
  morning: { sky: "#dcebfb", ground: "#b6dc8c", hemi: 1, sun: "#ffe6bf", sunIntensity: 1.3, sunPosition: [-0.6, 0.7, 0.5], ambient: 0.3, lamps: 0 },
  day: { sky: "#e3f1fb", ground: "#a8cf8e", hemi: 1.1, sun: "#ffffff", sunIntensity: 1.5, sunPosition: [0.4, 0.9, 0.55], ambient: 0.35, lamps: 0 },
  evening: { sky: "#f6cfa6", ground: "#a59a7a", hemi: 0.75, sun: "#ffa45c", sunIntensity: 1.1, sunPosition: [0.9, 0.35, 0.2], ambient: 0.28, lamps: 0.6 },
  // Dark night sky like the study room; street lamps and windows provide the light.
  night: { sky: "#141d36", ground: "#2a3350", hemi: 0.4, sun: "#9fb4ec", sunIntensity: 0.3, sunPosition: [-0.4, 0.8, -0.3], ambient: 0.2, lamps: 1 },
}

const LIGHT_STORAGE_KEY = "owlio.study-light.v1"

function loadLightSetting(): LightSetting {
  if (typeof window === "undefined") return "auto"
  try {
    const stored = window.localStorage.getItem(LIGHT_STORAGE_KEY)
    return LIGHT_SETTINGS.includes(stored as LightSetting) ? (stored as LightSetting) : "auto"
  } catch {
    return "auto"
  }
}

// One browser-local light setting shared by the study hall and every room.
export function useSharedLightSetting() {
  const [setting, setSetting] = useState<LightSetting>(loadLightSetting)

  useEffect(() => {
    try {
      window.localStorage.setItem(LIGHT_STORAGE_KEY, setting)
    } catch {
      return
    }
  }, [setting])

  const cycle = () => setSetting((current) => LIGHT_SETTINGS[(LIGHT_SETTINGS.indexOf(current) + 1) % LIGHT_SETTINGS.length])
  return { setting, cycle }
}

// Follows the local clock in "auto", checking once a minute.
export function useLightPhase(setting: LightSetting): LightPhase {
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    if (setting !== "auto") return
    const interval = window.setInterval(() => setHour(new Date().getHours()), 60_000)
    return () => window.clearInterval(interval)
  }, [setting])

  return setting === "auto" ? phaseForHour(hour) : setting
}
