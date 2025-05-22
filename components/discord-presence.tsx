"use client";

import { useState, useEffect } from "react";

interface DiscordUser { /* … */ }
interface DiscordActivity { /* … */ }
interface DiscordPresence { /* … */ }
interface DiscordPresenceProps { userId: string }

export function DiscordPresence({ userId }: DiscordPresenceProps) {
  const [presenceData, setPresenceData] = useState<DiscordPresence | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPresenceData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`)
        if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`)
        const data = await response.json()
        if (!data.success) throw new Error("Lanyard API error")
        setPresenceData(data.data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError(`Failed to load: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchPresenceData()
    const interval = setInterval(fetchPresenceData, 30_000)
    return () => clearInterval(interval)
  }, [userId])

  const formatElapsedTime = (start: number) => {
    const diff = Date.now() - start
    const m = Math.floor(diff / 60000)
    const h = Math.floor(m / 60)
    return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
  }

  if (loading)
    return (
      <div className="text-right transform scale-[3] origin-top-right">
        <div className="terminal-green">$ fetching discord_status</div>
        <div className="terminal-white">loading…</div>
      </div>
    )
  if (error)
    return (
      <div className="text-right transform scale-[3] origin-top-right">
        <div className="terminal-green">$ discord_status</div>
        <div className="terminal-white">error: connection failed</div>
      </div>
    )
  if (!presenceData)
    return (
      <div className="text-right transform scale-[3] origin-top-right">
        <div className="terminal-green">$ discord_status</div>
        <div className="terminal-white">no data available</div>
      </div>
    )

  const { discord_user, discord_status, activities, listening_to_spotify, spotify } = presenceData
  const mainActivity = activities?.find(a => a.type === 0 || a.type === 1)

  return (
    <div className="text-right transform scale-[3] origin-top-right">
      <div className="terminal-green">$ discord_status</div>
      <div className="flex items-center justify-end gap-2">
        {discord_user.avatar && (
          <img
            src={`https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=128`}
            alt={discord_user.username}
            className="w-24 h-24 rounded-full"
          />
        )}
        <div className="terminal-white text-3xl">
          {discord_user.username} <span className="text-xl">[{discord_status}]</span>
        </div>
      </div>

      {mainActivity && (
        <div className="mt-2">
          <div className="terminal-orange text-2xl">
            {mainActivity.name}
            {mainActivity.timestamps?.start && ` (${formatElapsedTime(mainActivity.timestamps.start)})`}
          </div>
          {mainActivity.details && <div className="terminal-white text-xl">{mainActivity.details}</div>}
          {mainActivity.state   && <div className="terminal-white text-xl">{mainActivity.state}</div>}
        </div>
      )}

      {listening_to_spotify && spotify && (
        <div className="mt-2">
          <div className="terminal-orange text-2xl">spotify: {spotify.song}</div>
          <div className="terminal-white text-xl">by {spotify.artist}</div>
        </div>
      )}
    </div>
  )
}
