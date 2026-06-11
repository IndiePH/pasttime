import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: "Pasttime" }} />
        <Stack.Screen name="games/[slug]/index" options={{ title: "Game" }} />
        <Stack.Screen name="games/[slug]/play" options={{ title: "Play" }} />
        <Stack.Screen
          name="games/[slug]/room/[code]"
          options={{ title: "Room" }}
        />
      </Stack>
    </>
  )
}
