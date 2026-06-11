import { Link, useLocalSearchParams } from "expo-router"
import { StyleSheet, Text, View } from "react-native"

import { gamePlayPath, getGameById } from "@pasttime/domain/games"

export default function GameLaunchScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const game = getGameById(slug ?? "")

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game not found</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{game.title}</Text>
      <Text style={styles.description}>{game.description}</Text>
      <Link href={`/games/${game.id}/play`} style={styles.button}>
        <Text style={styles.buttonText}>Play solo</Text>
      </Link>
      <Text style={styles.meta}>Web play path: {gamePlayPath(game.id)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0a0a0a",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fafafa",
  },
  description: {
    marginTop: 12,
    color: "#a3a3a3",
    lineHeight: 22,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#0a0a0a",
    fontWeight: "600",
    fontSize: 16,
  },
  meta: {
    marginTop: 16,
    fontSize: 12,
    color: "#525252",
  },
})
