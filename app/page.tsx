"use client"

import { useState, useEffect } from "react"
import { SocialLinks } from "@/components/social-links"
import { DiscordPresence } from "@/components/discord-presence"
import { Terminal } from "@/components/terminal"

export default function Home() {
  const [currentTime, setCurrentTime] = useState("")
  const [showArtwork, setShowArtwork] = useState(false)
  const userId = "1002839537644482611" // The user's Discord ID

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
    <div className="terminal-container">
      <div className="terminal-header">
        <div>
          <h1 className="terminal-white text-xl md:text-2xl font-bold">~/tskq-bio</h1>
        </div>
        <div className="text-right">
          <DiscordPresence userId={userId} />
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="mb-8">
          <p className="terminal-white mb-2">Interactive Terminal Interface</p>
          <Terminal showArtwork={showArtwork} setShowArtwork={setShowArtwork} />
        </div>

        {showArtwork && (
          <div className="mt-8">
            <h2 className="terminal-green mb-4 text-lg font-bold">$ ls ~/artwork</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((id) => (
                <div key={id} className="border border-gray-800 p-2">
                  <img src={`/placeholder.svg?height=200&width=300`} alt={`Artwork ${id}`} className="w-full h-auto" />
                  <p className="mt-2 terminal-white">artwork_{id}.png</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="my-8">
          <h2 className="terminal-green mb-4 text-lg font-bold">$ ls ~/social</h2>
          <SocialLinks />
        </div>
      </main>

      <div className="terminal-footer">
        <div className="terminal-white">© {new Date().getFullYear()} - TskQ (Not an actual copyright.)</div>
        <div className="text-right">
          <div className="terminal-white">system_time: {currentTime}</div>
        </div>
      </div>
    </div>
  )
}
