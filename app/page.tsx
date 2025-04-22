"use client"

import { useState, useEffect, useRef } from "react"
import { DiscordPresence } from "@/components/discord-presence"
import { Terminal } from "@/components/terminal"
import { SocialLinks } from "@/components/social-links"

const artworkData = [
  { id: 1, title: "Kiyosumi Fan-Art", filename: "kiynale.png", description: "An attempt to recreate 'The kiyosumi effect'" },
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

  // Modal & zoom/pan state
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = modalImage ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalImage])

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const h = now.getHours().toString().padStart(2, "0")
      const m = now.getMinutes().toString().padStart(2, "0")
      const s = now.getSeconds().toString().padStart(2, "0")
      setCurrentTime(`${h}:${m}:${s}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // Scroll arrows visibility
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const topOfArt = document.getElementById("artwork-section")?.offsetTop || 0
      setShowScrollDownArrow(y < 100 && showArtwork)
      setShowBackToTopArrow(y > topOfArt - 100 && showArtwork)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [showArtwork])

  // Unified pan handlers
  const startDrag = (x: number, y: number) => { dragging.current = true; lastPos.current = { x, y } }
  const dragMove = (x: number, y: number) => {
    if (!dragging.current) return
    const dx = x - lastPos.current.x
    const dy = y - lastPos.current.y
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
    lastPos.current = { x, y }
  }
  const endDrag = () => { dragging.current = false }

  const onMouseDown = (e: React.MouseEvent) => startDrag(e.clientX, e.clientY)
  const onMouseMove = (e: React.MouseEvent) => dragMove(e.clientX, e.clientY)
  const onMouseUp = () => endDrag()
  const onTouchStart = (e: React.TouchEvent) => startDrag(e.touches[0].clientX, e.touches[0].clientY)
  const onTouchMove = (e: React.TouchEvent) => { e.preventDefault(); dragMove(e.touches[0].clientX, e.touches[0].clientY) }
  const onTouchEnd = () => endDrag()

  // Open image in modal
  const openImage = (src: string, alt: string) => {
    setOffset({ x: 0, y: 0 })
    setZoom(1)
    setModalImage({ src, alt })
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })
  const scrollToArtwork = () => document.getElementById("artwork-section")?.scrollIntoView({ behavior: "smooth" })

  return (
    <div className="terminal-container relative">
      {/* Hero emoji */}
      <div
        className="absolute top-6 left-6 z-50 text-green-500 font-mono text-5xl md:text-6xl lg:text-7xl px-4 py-2 glow transition-all duration-300 ease-in-out"
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
      >
        {isHovering ? "☆*: .｡. o(≧▽≦)o .｡.:*☆" : "(/≧▽≦)/"}
      </div>

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
        <div className="my-8 flex flex-col items-center">
          <button
            onClick={() => setShowArtwork(!showArtwork)}
            className="bg-black border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-black transition-colors"
          >{showArtwork ? "Hide Artwork" : "Show Artwork"}</button>
          {showArtwork && (
            <div
              className={`mt-4 text-green-500 text-5xl transition-opacity duration-500 ${showScrollDownArrow ? "opacity-100" : "opacity-0 pointer-events-none"} animate-bounce glow cursor-pointer select-none`}
              onClick={scrollToArtwork}
            >↓</div>
          )}
        </div>
        {showArtwork && (
          <div id="artwork-section" className="mt-8">
            <h2 className="terminal-green mb-4 text-lg font-bold">$ ls ~/artwork</h2>
            <div className="masonry">
              {artworkData.map(a => (
                <div key={a.id} className="masonry-item border border-gray-800 p-4 hover:border-green-500 transition-colors rounded bg-black">
                  <img
                    src={`/${a.filename}`} alt={a.title}
                    className="w-full h-auto object-cover rounded shadow-lg mb-2 cursor-zoom-in"
                    onClick={() => openImage(`/${a.filename}`, a.title)}
                  />
                  <h3 className="terminal-white font-bold">{a.title}</h3>
                  <p className="terminal-white text-sm opacity-80">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showArtwork && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 rounded px-4 py-2 text-green-500 text-4xl transition-opacity duration-500 ${showBackToTopArrow ? "opcode
