import axios from "axios"

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? (error.code === "ERR_NETWORK"
      ? "Could not reach the API. Check that it is running at the configured VITE_API_URL."
      : fallback)
  }

  return error instanceof Error ? error.message : fallback
}
