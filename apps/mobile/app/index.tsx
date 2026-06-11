import { Link } from "expo-router"
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"

import {
  GAME_REGISTRY,
  gameLaunchPath,
  sortGamesByTitle,
} from "@pasttime/domain/games"

const games = sortGamesByTitle(
  GAME_REGISTRY.filter((game) => game.status !== "coming_soon"),
)

export default function HubScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pasttime</Text>
      <Text style={styles.subtitle}>Daily puzzles and games in one hub.</Text>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={`/games/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </Pressable>
          </Link>
        )}
      />
      <Text style={styles.hint}>
        Web paths: {gameLaunchPath("word-guess")}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 56,
    backgroundColor: "#0a0a0a",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fafafa",
  },
  subtitle: {
    marginTop: 8,
    color: "#a3a3a3",
  },
  list: {
    marginTop: 24,
    gap: 12,
  },
  card: {
    backgroundColor: "#171717",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#262626",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fafafa",
  },
  cardDescription: {
    marginTop: 6,
    color: "#a3a3a3",
    fontSize: 14,
  },
  hint: {
    marginTop: 16,
    fontSize: 11,
    color: "#525252",
  },
})
