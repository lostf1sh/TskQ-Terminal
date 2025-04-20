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
  state?: string
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
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`)

        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error("API request was not successful")
        }

        setPresenceData(data.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching Discord presence:", err)
        setError(`Failed to load Discord data: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchPresenceData()

    // Set up polling every 30 seconds
    const interval = setInterval(fetchPresenceData, 30000)

    return () => clearInterval(interval)
  }, [userId])

  // Format elapsed time
  const formatElapsedTime = (startTime: number) => {
    const now = Date.now()
    const elapsed = now - startTime
    const minutes = Math.floor(elapsed / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="text-right">
        <div className="terminal-green">$ fetching discord_status</div>
        <div className="terminal-white">loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-right">
        <div className="terminal-green">$ discord_status</div>
        <div className="terminal-white">error: connection failed</div>
      </div>
    )
  }

  if (!presenceData) {
    return (
      <div className="text-right">
        <div className="terminal-green">$ discord_status</div>
        <div className="terminal-white">no data available</div>
      </div>
    )
  }

  const { discord_user, discord_status, activities } = presenceData

  // Get the first non-Spotify activity (if any)
  const mainActivity = activities?.find((activity) => activity.type === 0 || activity.type === 1)

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
        <div className="terminal-white">
          {discord_user.username} [{discord_status}]
        </div>
      </div>

      {mainActivity && (
        <div className="mt-1">
          <div className="terminal-orange">
            {mainActivity.name}
            {mainActivity.timestamps?.start && ` (${formatElapsedTime(mainActivity.timestamps.start)})`}
          </div>
          {mainActivity.details && <div className="terminal-white text-xs">{mainActivity.details}</div>}
          {mainActivity.state && <div className="terminal-white text-xs">{mainActivity.state}</div>}
        </div>
      )}

      {presenceData.listening_to_spotify && presenceData.spotify && (
        <div className="mt-1">
          <div className="terminal-orange">spotify: {presenceData.spotify.song}</div>
          <div className="terminal-white text-xs">by {presenceData.spotify.artist}</div>
        </div>
      )}
    </div>
  )
}
