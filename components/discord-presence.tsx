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
  onAdminUpload?: () => void
}

export function DiscordPresence({ userId, onAdminUpload }: DiscordPresenceProps) {
  const [presenceData, setPresenceData] = useState<DiscordPresence | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

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

  const handleStatusClick = (e: React.MouseEvent) => {
    if (e.detail === 3) {
      if (isAdmin) {
        onAdminUpload?.()
      } else {
        setShowLogin(true)
      }
    }
  }

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "tskq" && password === "1234") {
      setIsAdmin(true)
      setShowLogin(false)
      setUsername("")
      setPassword("")
    } else {
      alert("Invalid credentials")
    }
  }

  const formatElapsed = (start: number) => {
    const diff = Date.now() - start
    const mins = Math.floor(diff / 60_000)
    const hrs = Math.floor(mins / 60)
    return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`
  }

  if (loading) return (
    <div className="modern-card animate-fade-in">
      <div className="loading-skeleton h-4 w-32 mb-2"></div>
      <div className="loading-skeleton h-3 w-24"></div>
    </div>
  )

  if (error) return (
    <div className="modern-card">
      <p className="text-destructive text-sm">Error: {error}</p>
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

  const customStatus = activities.find(a => a.type === 4 && a.state)
  const mainActivity = activities.find(a => a.type === 0 || a.type === 1)

  const statusColorClass = {
    online: "status-online",
    idle: "status-idle",
    dnd: "status-dnd",
    offline: "status-offline",
  }[discord_status]

  return (
    <div className="modern-card animate-slide-in">
      <div
        className="cursor-pointer select-none"
        onClick={handleStatusClick}
      >
        <div className="flex items-center gap-3 mb-3">
          {discord_user.avatar && (
            <img
              src={`https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=32`}
              alt={discord_user.username}
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex items-center gap-2">
            <span className={`status-indicator ${statusColorClass}`} />
            <span className="font-medium">{discord_user.username}</span>
          </div>
        </div>

        {/* Custom Status */}
        {customStatus && (
          <div className="flex items-center gap-2 mb-2">
            {customStatus.assets?.small_image && (
              <img
                src={`https://cdn.discordapp.com/app-assets/${customStatus.id}/${customStatus.assets.small_image}.png`}
                alt={customStatus.assets.small_text}
                className="w-4 h-4"
              />
            )}
            <span className="text-sm text-muted-foreground">{customStatus.state}</span>
          </div>
        )}

        {/* Main Activity */}
        {mainActivity && (
          <div className="mb-2">
            <div className="text-sm font-medium">
              {mainActivity.name}
              {mainActivity.timestamps?.start && (
                <span className="text-muted-foreground ml-1">
                  ({formatElapsed(mainActivity.timestamps.start)})
                </span>
              )}
            </div>
            {mainActivity.details && (
              <div className="text-xs text-muted-foreground">{mainActivity.details}</div>
            )}
            {mainActivity.state && (
              <div className="text-xs text-muted-foreground">{mainActivity.state}</div>
            )}
          </div>
        )}

        {/* Spotify */}
        {listening_to_spotify && spotify && (
          <div className="border-t border-border pt-2">
            <div className="text-sm font-medium text-success">♪ {spotify.song}</div>
            <div className="text-xs text-muted-foreground">by {spotify.artist}</div>
          </div>
        )}
      </div>

      {showLogin && (
        <div className="modal-overlay">
          <div className="modal-content p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Admin Login</h3>
            <form onSubmit={submitLogin} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="modern-input"
                  placeholder="Username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="modern-input"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="modern-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modern-button"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}