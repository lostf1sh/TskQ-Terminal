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

type ConnectionStatus = 'loading' | 'connected' | 'error'

export function DiscordPresence({ userId, onAdminUpload }: DiscordPresenceProps) {
  const [presenceData, setPresenceData] = useState<DiscordPresence | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading')
  const [showLogin, setShowLogin] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  // HTTP polling for Discord presence
  useEffect(() => {
    const fetchPresence = async () => {
      try {
        setConnectionStatus('loading')
        const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`)
        if (!res.ok) throw new Error(`API returned ${res.status}`)
        const json = await res.json()
        if (json.success) {
          setPresenceData(json.data)
          setConnectionStatus('connected')
        } else {
          throw new Error('API returned unsuccessful response')
        }
      } catch (error) {
        console.error('Failed to fetch Discord presence:', error)
        setConnectionStatus('error')
      }
    }

    // Initial fetch
    fetchPresence()

    // Set up polling every 30 seconds
    const interval = setInterval(fetchPresence, 30000)

    return () => clearInterval(interval)
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

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'loading': return 'Loading...'
      case 'connected': return 'Connected'
      case 'error': return 'Offline'
      default: return 'Unknown'
    }
  }

  if (connectionStatus === 'loading' && !presenceData) {
    return (
      <div className="discord-presence animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="loading-skeleton w-12 h-12 rounded-full"></div>
          <div>
            <div className="loading-skeleton h-4 w-24 mb-2"></div>
            <div className="loading-skeleton h-3 w-16"></div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <i className="fas fa-circle-notch fa-spin"></i>
          Loading Discord status...
        </div>
      </div>
    )
  }

  if (!presenceData) {
    return (
      <div className="discord-presence">
        <div className="text-center text-muted-foreground">
          <i className="fas fa-exclamation-triangle text-warning mb-2"></i>
          <p className="text-sm">Unable to load Discord presence</p>
          <button 
            onClick={() => window.location.reload()} 
            className="modern-button-secondary mt-2 text-xs"
          >
            <i className="fas fa-refresh mr-1"></i>
            Retry
          </button>
        </div>
      </div>
    )
  }

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

  const statusText = {
    online: "Online",
    idle: "Away",
    dnd: "Do Not Disturb",
    offline: "Offline",
  }[discord_status]

  return (
    <>
      {/* Connection status indicator */}
      <div className={`connection-status ${connectionStatus}`}>
        <i className={`fas ${
          connectionStatus === 'connected' ? 'fa-check-circle' :
          connectionStatus === 'loading' ? 'fa-circle-notch fa-spin' :
          'fa-exclamation-triangle'
        } mr-2`}></i>
        {getConnectionStatusText()}
      </div>

      <div className="discord-presence animate-slide-in">
        <div
          className="cursor-pointer select-none"
          onClick={handleStatusClick}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              {discord_user.avatar && (
                <img
                  src={`https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=64`}
                  alt={discord_user.username}
                  className="discord-avatar"
                />
              )}
              <div className={`absolute -bottom-1 -right-1 status-indicator ${statusColorClass}`} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{discord_user.username}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <i className="fab fa-discord"></i>
                {statusText}
              </p>
            </div>
          </div>

          {/* Custom Status */}
          {customStatus && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-accent rounded-lg">
              {customStatus.assets?.small_image && (
                <img
                  src={`https://cdn.discordapp.com/app-assets/${customStatus.id}/${customStatus.assets.small_image}.png`}
                  alt={customStatus.assets.small_text}
                  className="w-4 h-4"
                />
              )}
              <span className="text-sm">{customStatus.state}</span>
            </div>
          )}

          {/* Main Activity */}
          {mainActivity && (
            <div className="mb-3 p-3 bg-accent rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-gamepad text-primary"></i>
                <span className="text-sm font-medium">{mainActivity.name}</span>
                {mainActivity.timestamps?.start && (
                  <span className="text-xs text-muted-foreground">
                    {formatElapsed(mainActivity.timestamps.start)}
                  </span>
                )}
              </div>
              {mainActivity.details && (
                <div className="text-xs text-muted-foreground mb-1">{mainActivity.details}</div>
              )}
              {mainActivity.state && (
                <div className="text-xs text-muted-foreground">{mainActivity.state}</div>
              )}
            </div>
          )}

          {/* Spotify */}
          {listening_to_spotify && spotify && (
            <div className="spotify-card">
              <div className="flex items-center gap-2 mb-2">
                <i className="fab fa-spotify spotify-icon"></i>
                <span className="text-sm font-medium">Listening to Spotify</span>
              </div>
              <div className="text-sm font-medium">{spotify.song}</div>
              <div className="text-xs opacity-90">by {spotify.artist}</div>
              {spotify.timestamps && (
                <div className="mt-2 bg-black/20 rounded-full h-1">
                  <div 
                    className="bg-white rounded-full h-1 transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, ((Date.now() - spotify.timestamps.start) / (spotify.timestamps.end - spotify.timestamps.start)) * 100)}%`
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {showLogin && (
          <div className="modal-overlay">
            <div className="modal-content p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-lock text-primary"></i>
                Admin Login
              </h3>
              <form onSubmit={submitLogin} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-user mr-2"></i>
                    Username
                  </label>
                  <input
                    className="modern-input"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-key mr-2"></i>
                    Password
                  </label>
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
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modern-button"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}