"use client"

import { useState, useEffect } from "react"

interface DiscordUser {
  username: string
  avatar: string
  id: string
  discriminator: string
}

interface DiscordActivity {
  type: number
  name: string
  state?: string            // custom‐status text or activity “state”
  details?: string
  timestamps?: {
    start?: number
    end?: number
  }
  assets?: {
    large_image?: string
    large_text?: string
    small_image?: string
    small_text?: string
  }
}

interface DiscordPresence {
  discord_user: DiscordUser
  discord_status: "online" | "idle" | "dnd" | "offline"
  activities: DiscordActivity[]
  listening_to_spotify: boolean
  spotify?: {
    song: string
    artist: string
    album_art_url: string
    timestamps: {
      start: number
      end: number
    }
  }
}

interface DiscordPresenceProps {
  userId: string
}

export function DiscordPresence({ userId }: DiscordPresenceProps) {
  const [presenceData, setPresenceData] = useState<DiscordPresence | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPresenceData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`)
        if (!res.ok) throw new Error(`API returned ${res.status}`)
        const json = await res.json()
        if (!json.success) throw new Error("Lanyard said failed")
        setPresenceData(json.data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchPresenceData()
    const iv = setInterval(fetchPresenceData, 30_000)
    return () => clearInterval(iv)
  }, [userId])

  // helper for “Listening since”
  const formatElapsed = (start: number) => {
    const diff = Date.now() - start
    const mins = Math.floor(diff / 60_000)
    const hrs = Math.floor(mins / 60)
    return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`
  }

  if (loading) return (
    <div className="text-right">
      <div className="terminal-green">$ fetching discord_status</div>
      <div className="terminal-white">loading...</div>
    </div>
  )
  if (error) return (
    <div className="text-right">
      <div className="terminal-green">$ discord_status</div>
      <div className="terminal-white">error: {error}</div>
    </div>
  )
  if (!presenceData) return null

  const {
    discord_user,
    discord_status,
    activities,
    listening_to_spotify,
    spotify,
  } = presenceData

  // pick out custom status (type 4), game (0) or competing (1)
  const customStatus = activities.find(a => a.type === 4 && a.state)
  const mainActivity = activities.find(a => a.type === 0 || a.type === 1)

  // map presence to coloured dot
  const statusColor = {
    online: "bg-green-500",
    idle:   "bg-yellow-500",
    dnd:    "bg-red-500",
    offline:"bg-gray-500",
  }[discord_status]

  return (
    <div className="text-right">
      <div className="terminal-green">$ discord_status</div>

      <div className="flex items-center justify-end gap-2">
        {discord_user.avatar && (
          <img
            src={`https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=32`}
            alt={discord_user.username}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${statusColor}`} />
          <span className="terminal-white">
            {discord_user.username}
          </span>
        </div>
      </div>

      {/* Custom Status message */}
      {customStatus && (
        <div className="mt-1 flex items-center justify-end gap-1">
          {customStatus.assets?.small_image && (
            <img
              src={`https://cdn.discordapp.com/app-assets/${customStatus.id}/${customStatus.assets.small_image}.png`}
              alt={customStatus.assets.small_text}
              className="w-4 h-4"
            />
          )}
          <span className="terminal-magenta text-xs">
            {customStatus.state}
          </span>
        </div>
      )}

      {/* Main Activity (game, stream, etc) */}
      {mainActivity && (
        <div className="mt-1">
          <div className="terminal-orange">
            {mainActivity.name}
            {mainActivity.timestamps?.start && (
              <> ({formatElapsed(mainActivity.timestamps.start)})</>
            )}
          </div>
          {mainActivity.details  && <div className="terminal-white text-xs">{mainActivity.details}</div>}
          {mainActivity.state    && <div className="terminal-white text-xs">{mainActivity.state}</div>}
        </div>
      )}

      {/* Spotify */}
      {listening_to_spotify && spotify && (
        <div className="mt-1">
          <div className="terminal-orange">spotify: {spotify.song}</div>
          <div className="terminal-white text-xs">by {spotify.artist}</div>
        </div>
      )}
    </div>
  )
}
