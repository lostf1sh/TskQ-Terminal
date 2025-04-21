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
  const [showArtwork, setShowArtwork] = useState(true)
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
      {/* Hero emoji */}
      <div
        className="absolute top-6 left-6 z-50 text-green-500 font-mono text-5xl md:text-6xl lg:text-7xl leading-tight px-4 py-2 glow transition-all duration-300 ease-in-out"
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
      >
        {isHovering ? "☆*: .｡. o(≧▽≦)o .｡.:*☆" : "(/≧▽≦)/"}
      </div>

      {/* Discord presence top-right */}
      <DiscordPresence userId="1002839537644482611" />

      <main className="flex-1 py-8">
        <div className="mb-8">
          <p className="terminal-white mb-2">> Interactive Terminal Interface</p>
          <Terminal showArtwork={showArtwork} setShowArtwork={setShowArtwork} />
        </div>

        {/* Social links */}
        <div className="my-8">
          <h2 className="terminal-green mb-4 text-lg font-bold">$ ls ~/social</h2>
          <SocialLinks />
        </div>

        {/* Show/Hide Button + Down Arrow */}
        <div className="my-8 flex flex-col items-center">
          <button
            onClick={() => setShowArtwork(!showArtwork)}
            className="bg-black border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-black transition-colors"
          >
            {showArtwork ? "Hide Artwork" : "Show Artwork"}
          </button>

          {/* Scroll down arrow */}
          <button
            onClick={() => {
              const target = document.getElementById("artwork-section")
              if (target) {
                target.scrollIntoView({ behavior: "smooth" })
              }
            }}
            className="mt-4 text-green-500 text-5xl animate-bounce glow cursor-pointer select-none"
            aria-label="Scroll to artwork"
          >
            ↓
          </button>
        </div>

        {/* Artwork Section */}
        {showArtwork && (
          <div id="artwork-section" className="mt-8">
            <h2 className="terminal-green mb-4 text-lg font-bold">$ ls ~/artwork</h2>
            <div className="masonry">
              {artworkData.map((artwork) => (
                <div
                  key={artwork.id}
                  className="masonry-item border border-gray-800 p-4 hover:border-green-500 transition-colors rounded bg-black"
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
