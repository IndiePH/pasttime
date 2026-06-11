import { useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

import { getGameById } from "@pasttime/domain/games"
import {
  createWordGuessRound,
  submitWordGuessGuess,
  type WordGuessRoundState,
} from "@pasttime/domain/games/word-guess"
import { mobileStorage } from "@/lib/storage"

const STORAGE_KEY = "word-guess:mobile:round"

export default function GamePlayScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const game = getGameById(slug ?? "")
  const [round, setRound] = useState<WordGuessRoundState | null>(null)
  const [guess, setGuess] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (game?.id !== "word-guess") {
      return
    }
    void (async () => {
      const saved = await mobileStorage.get<WordGuessRoundState>(STORAGE_KEY)
      if (saved && saved.status === "playing") {
        setRound(saved)
        return
      }
      const next = createWordGuessRound({
        length: 5,
        mode: "random",
      })
      setRound(next)
      await mobileStorage.set(STORAGE_KEY, next)
    })()
  }, [game?.id])

  const submit = useCallback(async () => {
    if (!round || game?.id !== "word-guess") {
      return
    }
    const result = submitWordGuessGuess(round, guess)
    if (!result.ok) {
      setMessage(result.reason)
      return
    }
    setMessage(null)
    setGuess("")
    setRound(result.round)
    await mobileStorage.set(STORAGE_KEY, result.round)
  }, [round, guess, game?.id])

  if (!game) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game not found</Text>
      </View>
    )
  }

  if (game.id !== "word-guess") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{game.title}</Text>
        <Text style={styles.description}>
          Mobile play UI for this game is coming soon. Open the web app to
          play now.
        </Text>
      </View>
    )
  }

  if (!round) {
    return (
      <View style={styles.container}>
        <Text style={styles.description}>Loading…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Word Guess</Text>
      <Text style={styles.description}>
        Guess {round.length}-letter word · {round.guesses.length}/{round.maxTries}
      </Text>
      {round.guesses.map((entry, index) => (
        <Text key={`${entry.guess}-${index}`} style={styles.guessRow}>
          {entry.guess}
        </Text>
      ))}
      {round.status === "playing" ? (
        <>
          <TextInput
            value={guess}
            onChangeText={(text) => setGuess(text.toUpperCase())}
            maxLength={round.length}
            autoCapitalize="characters"
            style={styles.input}
          />
          <Pressable style={styles.button} onPress={() => void submit()}>
            <Text style={styles.buttonText}>Submit</Text>
          </Pressable>
        </>
      ) : (
        <Text style={styles.result}>
          {round.status === "won" ? "You won!" : `Answer: ${round.answer}`}
        </Text>
      )}
      {message ? <Text style={styles.error}>{message}</Text> : null}
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
    marginTop: 8,
    color: "#a3a3a3",
  },
  guessRow: {
    marginTop: 8,
    fontFamily: "monospace",
    fontSize: 18,
    color: "#fafafa",
    letterSpacing: 4,
  },
  input: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 8,
    padding: 12,
    color: "#fafafa",
    fontSize: 20,
    letterSpacing: 4,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#0a0a0a",
    fontWeight: "600",
  },
  result: {
    marginTop: 16,
    fontSize: 18,
    color: "#fafafa",
  },
  error: {
    marginTop: 8,
    color: "#f87171",
  },
})
