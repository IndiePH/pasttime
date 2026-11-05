import { StaticPage } from "@/components/shared/static-page"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "About",
  description:
    "Pasttime is a free hub for daily puzzles and classic games you can play instantly in the browser.",
  path: "/about",
})

export default function AboutPage() {
  return (
    <StaticPage
      title="About Pasttime"
      description="A free home for daily puzzles and classic games. Play more, think sharper."
      sections={[
        {
          title: "What we are",
          content: [
            "Pasttime is a free game hub for quick, thoughtful play in the browser. No download, no account required. Open a game and start.",
            "We focus on familiar classics and daily puzzles with clean controls, local progress, and a calm layout that stays out of the way.",
          ],
        },
        {
          title: "Our mission",
          content:
            "We believe short mental breaks should feel rewarding, not noisy. Pasttime exists to make high-quality puzzles and card games easy to reach every day, whether you have two minutes or twenty.",
        },
        {
          title: "What you can play",
          content: [
            "The hub currently offers Crossword, Word Guess, Sudoku, and Solitaire, free to play instantly in the browser. More classics are in development and will appear in the catalog when they are ready.",
            "Some games support local solo play with daily and endless modes; selected titles also offer multiplayer rooms when the live server is available.",
          ],
        },
        {
          title: "How Pasttime stays free",
          content: [
            "Browser games on this site are free to play and do not show display ads.",
            "The Word Guess Android app is supported by Unity LevelPlay advertising. That app’s data use is described in the Word Guess privacy policy.",
          ],
        },
        {
          title: "Privacy and progress",
          content: [
            "Gameplay progress and preferences are stored locally in your browser by default. You do not need to create an account to play.",
            "Details about the website, feedback, and the Word Guess app’s advertising are in our Privacy Policy and the Word Guess privacy policy.",
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
