"use client"

import { useState, useEffect } from "react"
import { DiscordPresence } from "@/components/discord-presence"
import { Terminal } from "@/components/terminal"
import { SocialLinks } from "@/components/social-links"

const artworkData = [
  { id: 1, title: "Kiyosumi Fan-Art", filename: "kiynale.png", description: "An attempt to recreate 'The kiyosumi effect'" },
  { id: 2, title: "Kiyosumi Fan-Art", filename: "kiyosketch.png", description: "More of that messy art-style." },
  { id: 3, title: "Mash", filename: "mashfr.png", description: "An accurate representation of Mash of the toes" },
  { id: 4, title: "Osage Fan-Art", filename: "osage.png", description: "My first attempt on the messy art-style." },
  { id: 5, title: "Cho", filename: "cho-reborn.png", description: "My first and probably last original character, reborn." },
  { id: 6, title: "Practice Hand", filename: "hand.png", description: "Hand from practice day, referenced from pinterest." },
  { id: 7, title: "Jacket practice", filename: "jacket.png", description: "Trying to improve drawing folds and different textures (Leather jacket in this case)." },
]

export default function Home() {
  const [showArtwork, setShowArtwork] = useState(true)
  const [currentTime, setCurrentTime] = useState("")
  const [isHovering, setIsHovering] = useState(false)
  const [showScrollDownArrow, setShowScrollDownArrow] = useState(true)
  const [showBackToTopArrow, setShowBackToTopArrow] = useState(false)

  // Modal & zoom state
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null)
  const [zoom, setZoom] = useState(1)

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (modalImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalImage])

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const artworkSection = document.getElementById("artwork-section")
      const artworkOffset = artworkSection?.offsetTop || 0

      setShowScrollDownArrow(scrollY < 100 && showArtwork)
      setShowBackToTopArrow(scrollY > artworkOffset - 100 && showArtwork)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [showArtwork])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const scrollToArtwork = () => {
    const target = document.getElementById("artwork-section")
    if (target) target.scrollIntoView({ behavior: "smooth" })
  }

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

      {/* DiscordPresence */}
      <DiscordPresence userId="1002839537644482611" />

      <main className="flex-1 py-8">
        <div className="mb-8">
          <p className="terminal-white mb-2">&gt; Interactive Terminal Interface</p>
          <Terminal showArtwork={showArtwork} setShowArtwork={setShowArtwork} />
        </div>

        <div className="my-8">
          <h2 className="terminal-green mb-4 text-lg font-bold">$ ls ~/social</h2>
          <SocialLinks />
        </div>

        {/* Toggle button + arrows */}
        <div className="my-8 flex flex-col items-center">
          <button
            onClick={() => setShowArtwork(!showArtwork)}
            className="bg-black border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-black transition-colors"
          >
            {showArtwork ? "Hide Artwork" : "Show Artwork"}
          </button>

          {/* Scroll down arrow */}
          {showArtwork && (
            <div
              className={`mt-4 text-green-500 text-5xl transition-opacity duration-500 ${
                showScrollDownArrow ? "opacity-100" : "opacity-0 pointer-events-none"
              } animate-bounce glow cursor-pointer select-none`}
              onClick={scrollToArtwork}
            >
              ↓
            </div>
          )}
        </div>

        {/* Artwork Grid */}
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
                    className="w-full h-auto object-cover rounded shadow-lg mb-2 cursor-zoom-in"
                    onClick={() => {
                      setModalImage({ src: `/${artwork.filename}`, alt: artwork.title })
                      setZoom(1)
                    }}
                  />
                  <h3 className="terminal-white font-bold">{artwork.title}</h3>
                  <p className="terminal-white text-sm opacity-80">{artwork.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Back to top arrow */}
      {showArtwork && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 rounded px-4 py-2 text-green-500 text-4xl transition-opacity duration-500 ${
            showBackToTopArrow ? "opacity-100" : "opacity-0 pointer-events-none"
          } cursor-pointer glow`}
          onClick={scrollToTop}
        >
          ↑
        </div>
      )}

      {/* Modal for full-image & zoom */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative cursor-zoom-out"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.preventDefault()
              const delta = -e.deltaY * 0.001
              setZoom((prev) => Math.min(Math.max(prev + delta, 1), 5))
            }}
          >
            <img
              src={modalImage.src}
              alt={modalImage.alt}
              style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="terminal-footer" id="top">
        <div className="terminal-white">© {new Date().getFullYear()} – TskQ (Not an actual copyright.)</div>
        <div className="text-right">
          <div className="terminal-white">system time: {currentTime}</div>
        </div>
      </div>
    </div>
  )
}
