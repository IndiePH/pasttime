import { createPasttimeClient } from "@pasttime/api-client"
import Constants from "expo-constants"

const extra = Constants.expoConfig?.extra as
  | { apiUrl?: string; wsUrl?: string }
  | undefined

export const pasttimeClient = createPasttimeClient({
  apiUrl: extra?.apiUrl ?? "http://localhost:4000",
  wsUrl: extra?.wsUrl,
})
