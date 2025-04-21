"use client"

import { useState, useEffect } from "react"
import { DiscordPresence } from "@/components/discord-presence"
import { Terminal } from "@/components/terminal"
import { SocialLinks } from "@/components/social-links"

const artworkData = [
  {
    id: 1,
    title: "Kiyosumi Fan-Art",
    filename: "kiynale.png",
    description: "An attempt to recreate 'The kiyosumi effect'"
  },
  {
    id: 2,
    title: "Kiyosumi Fan-Art",
    filename: "kiyosketch.png",
    description: "More of that messy art-style."
  },
  {
    id: 3,
    title: "Mash",
    filename: "mashfr.png",
    description: "An accurate representation of Mash of the toes"
  },
  {
    id: 4,
    title: "Osage Fan-Art",
    filename: "osage.png",
    description: "My first attempt on the messy art-style."
  },
  {
    id: 5,
    title: "Cho",
    filename: "cho-reborn.png",
    description: "My first and probably last original character, reborn."
  },
]

export default function Home() {
  const [showArtwork, setShowArtwork] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const seconds = now.getSeconds().toString().padStart(2, "0")
      setCurrentTime(`${hours}:${minutes}:${seconds}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="terminal-container relative">
      {/* Static emoji hover text */}
      <div
        className="absolute top-4 left-4 z-50 inline-block text-green-500 font-mono text-sm md:text-base cursor-default glow transition-all duration-300 ease-in-out"
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
      >
        {isHovering ? "☆*: .｡. o(≧▽≦)o .｡.:*☆" : "(/≧▽≦)/"}
      </div>

      {/* DiscordPresence top-right */}
      <DiscordPresence userId="1002839537644482611" />

      <main className="flex-1 py-8">
        <div className="mb-8">
          <p className="terminal-white mb-2">> Interactive Terminal Interface</p>
          <Terminal showArtwork={showArtwork} setShowArtwork={setShowArtwork} />
        </div>

        <div className="my-8">
          <h2 className="terminal-green mb-4 text-lg font-bold">$ ls ~/social</h2>
          <SocialLinks />
        </div>

        {/* Show Artwork Button */}
        <div className="my-8 flex justify-center">
          <button
            onClick={() => setShowArtwork(!showArtwork)}
            className="bg-black border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-black transition-colors"
          >
            {showArtwork ? "Hide Artwork" : "Show Artwork"}
          </button>
        </div>

        {showArtwork && (
          <div className="mt-8">
            <h2 className="terminal-green mb-4 text-lg font-bold">$ ls ~/artwork</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start auto-rows-auto">
              {artworkData.map((artwork) => (
                <div
                  key={artwork.id}
                  className="flex flex-col border border-gray-800 p-4 hover:border-green-500 transition-colors rounded"
                >
                  <img
                    src={`/${artwork.filename}`}
                    alt={artwork.title}
                    className="w-full h-auto object-cover rounded shadow-lg mb-2"
                  />
                  <h3 className="terminal-white font-bold">{artwork.title}</h3>
                  <p className="terminal-white text-sm opacity-80">{artwork.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="terminal-footer">
        <div className="terminal-white">
          © {new Date().getFullYear()} – TskQ (Not an actual copyright.)
        </div>
        <div className="text-right">
          <div className="terminal-white">system time: {currentTime}</div>
        </div>
      </div>
    </div>
  )
}
