import { createPasttimeClient, getDefaultApiUrl } from "@pasttime/api-client"

export const pasttimeClient = createPasttimeClient({
  apiUrl: getDefaultApiUrl(),
  wsUrl: process.env.NEXT_PUBLIC_WS_URL,
})
