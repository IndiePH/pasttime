import { contextBridge, shell } from "electron"

contextBridge.exposeInMainWorld("pasttimeDesktop", {
  platform: "desktop" as const,
  openExternal: (url: string) => {
    void shell.openExternal(url)
  },
})
