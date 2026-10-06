import api from "@/lib/axios"
import type { ApiHealth } from "./api.types"

export async function getApiHealth(): Promise<ApiHealth> {
  const response = await api.get<ApiHealth>("/api/health")
  return response.data
}
