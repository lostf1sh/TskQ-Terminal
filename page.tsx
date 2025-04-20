"use client"

import { useState, useEffect } from "react"
import { SocialLinks } from "@/components/social-links"
import { DiscordPresence } from "@/components/discord-presence"
import { Terminal } from "@/components/terminal"

// Define your artwork data
const artworkData = [
  {
    id: 1,
    title: "Digital Painting 1",
    filename: "artwork1.jpg",
    description: "A digital painting created in 2023"
  },
  {
    id: 2,
    title: "Digital Painting 2", 
    filename: "artwork2.jpg",
    description: "Abstract composition"
  },
  // Add more artworks as needed
]

export default function Home() {
  const [currentTime, setCurrentTime] = useState("")
  const [showArtwork, setShowArtwork] = useState(false)
  const userId = "1002839537644482611"

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
      {/* ... existing header code ... */}

      {showArtwork && (
        <div className="mt-8">
          <h2 className="terminal-green mb-4 text-lg font-bold">$ ls ~/artwork</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artworkData.map((artwork) => (
              <div key={artwork.id} className="border border-gray-800 p-4 hover:border-green-500 transition-colors">
                <img 
                  src={`/${artwork.filename}`} 
                  alt={artwork.title}
                  className="w-full h-auto mb-2"
                />
                <h3 className="terminal-white font-bold">{artwork.title}</h3>
                <p className="terminal-white text-sm opacity-80">{artwork.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ... rest of your existing code ... */}
    </div>
  )
}
