import { filterGamesByStatus } from "@pasttime/domain/games"

import { SITE_URL } from "@/lib/seo"

function englishList(items: readonly string[]): string {
  return new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  }).format(items)
}

export type HubFaq = {
  question: string
  answer: string
}

/** Visible hub answers. FAQ JSON-LD must use this same text. */
export function hubFaqs(): HubFaq[] {
  const playable = filterGamesByStatus("available")
  const titles = englishList(playable.map((game) => game.title))
  const withFriends = playable.filter((game) =>
    game.tags.includes("multiplayer"),
  )
  const solo = playable.filter((game) => !game.tags.includes("multiplayer"))
  const friendsAnswer =
    withFriends.length > 0
      ? `${withFriends
          .map(
            (game) =>
              `${game.title} supports ${game.playerCount ?? "more than one player"}`,
          )
          .join(
            ". ",
          )}. ${englishList(solo.map((game) => game.title))} are solo.`
      : `The playable games are solo: ${titles}.`

  return [
    {
      question: "What is Pasttime?",
      answer: `Pasttime is a free website for daily puzzles and classic games at ${SITE_URL}. You play in the browser. No download and no account are required.`,
    },
    {
      question: "Which games can I play on Pasttime?",
      answer: `You can play ${titles} for free in the browser. Other titles are labeled Coming soon until they launch.`,
    },
    {
      question: "Is Pasttime free?",
      answer:
        "Yes. Browser games on Pasttime are free to play. Banner ads from Adsterra support the site. The Word Guess Android app is a separate product supported by Unity LevelPlay.",
    },
    {
      question: "Do I need an account to play?",
      answer:
        "No. Progress, streaks, and preferences stay in this browser. Clearing site data removes that device-only history.",
    },
    {
      question: "Can I play Pasttime with friends?",
      answer: friendsAnswer,
    },
  ]
}
