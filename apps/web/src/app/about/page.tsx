import type { Metadata } from "next"

import { StaticPage } from "@/components/shared/static-page"

export const metadata: Metadata = {
  title: "About",
  description:
    "Pasttime is a free hub for daily puzzles and classic games you can play instantly in the browser.",
}

export default function AboutPage() {
  return (
    <StaticPage
      title="About Pasttime"
      description="A free home for daily puzzles and classic games — play more, think sharper."
      sections={[
        {
          title: "What we are",
          content: [
            "Pasttime is a free game hub for quick, thoughtful play in the browser. No download, no account required — open a game and start.",
            "We focus on familiar classics and daily puzzles with clean controls, local progress, and a calm layout that stays out of the way.",
          ],
        },
        {
          title: "Our mission",
          content:
            "We believe short mental breaks should feel rewarding, not noisy. Pasttime exists to make high-quality puzzles and card games easy to reach every day — whether you have two minutes or twenty.",
        },
        {
          title: "What you can play",
          content: [
            "The hub currently includes word and logic games such as Crossword, Word Guess, Sudoku, Word Factory, Tile Words, Type Rush, and Type Shield; solitaire and card games such as Solitaire, Tongits, Pusoy Dos, and Spades; and board-style games such as Reversi and Fleet Grid.",
            "Catalog and features grow over time. Some games support local solo play; others offer multiplayer rooms when the live server is available.",
          ],
        },
        {
          title: "How Pasttime stays free",
          content: [
            "Pasttime is supported by advertising (Google AdSense). Ads help cover hosting and development so the games can remain free to play.",
            "We aim for clear, non-intrusive placements and follow Google’s publisher policies, including privacy disclosures and consent requirements where they apply.",
          ],
        },
        {
          title: "Privacy and progress",
          content: [
            "Gameplay progress and preferences are stored locally in your browser by default. You do not need to create an account to play.",
            "Details about advertising, cookies, and any information you choose to send through feedback are in our Privacy Policy.",
          ],
        },
        {
          title: "Get in touch",
          content:
            "Found a bug, have a game request, or want to say hello? Use the Feedback button in the footer, or email feedback@pasttime.xyz. We read every message we can.",
        },
      ]}
    />
  )
}
