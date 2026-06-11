import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@pasttime/domain",
    "@pasttime/storage",
    "@pasttime/api-client",
  ],
  async redirects() {
    return [
      {
        source: "/games/sample-word",
        destination: "/games/word-guess",
        permanent: true,
      },
      {
        source: "/games/sample-word/play",
        destination: "/games/word-guess/play",
        permanent: true,
      },
      {
        source: "/games/sample-word/room/:code",
        destination: "/games/word-guess/room/:code",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
