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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

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
          setLastUpdate(new Date())
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
      case 'loading': return 'Connecting...'
      case 'connected': return 'Live Status'
      case 'error': return 'Offline'
      default: return 'Unknown'
    }
  }

  const formatLastUpdate = () => {
    if (!lastUpdate) return ''
    const now = new Date()
    const diff = now.getTime() - lastUpdate.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes === 1) return '1 minute ago'
    return `${minutes} minutes ago`
  }

  if (connectionStatus === 'loading' && !presenceData) {
    return (
      <div className="discord-presence animate-bounce-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="loading-skeleton w-14 h-14 rounded-full"></div>
          <div className="flex-1">
            <div className="loading-skeleton h-5 w-32 mb-2"></div>
            <div className="loading-skeleton h-4 w-20"></div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <i className="fas fa-circle-notch fa-spin text-primary"></i>
          Loading Discord status...
        </div>
      </div>
    )
  }

  if (!presenceData) {
    return (
      <div className="discord-presence">
        <div className="text-center text-muted-foreground space-y-4">
          <div className="text-4xl">
            <i className="fas fa-exclamation-triangle text-warning"></i>
          </div>
          <div>
            <p className="font-medium">Unable to load Discord presence</p>
            <p className="text-sm">Check your connection and try again</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="modern-button-secondary text-sm"
          >
            <i className="fas fa-refresh mr-2"></i>
            Retry Connection
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

  const statusIcon = {
    online: "fas fa-circle",
    idle: "fas fa-moon",
    dnd: "fas fa-minus-circle",
    offline: "fas fa-circle",
  }[discord_status]

  return (
    <>
      {/* Connection status indicator */}
      <div className={`connection-status ${connectionStatus} animate-slide-in-up`}>
        <i className={`fas ${
          connectionStatus === 'connected' ? 'fa-wifi' :
          connectionStatus === 'loading' ? 'fa-circle-notch fa-spin' :
          'fa-wifi-slash'
        } mr-2`}></i>
        {getConnectionStatusText()}
      </div>

      <div className="discord-presence animate-bounce-in">
        <div
          className="cursor-pointer select-none"
          onClick={handleStatusClick}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
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
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gradient">{discord_user.username}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <i className={`${statusIcon} text-xs`}></i>
                <span>{statusText}</span>
                <span>•</span>
                <i className="fab fa-discord"></i>
                <span>Discord</span>
              </div>
            </div>
          </div>

          {/* Custom Status */}
          {customStatus && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-accent/50 rounded-xl border border-border/50">
              {customStatus.assets?.small_image && (
                <img
                  src={`https://cdn.discordapp.com/app-assets/${customStatus.id}/${customStatus.assets.small_image}.png`}
                  alt={customStatus.assets.small_text}
                  className="w-5 h-5 rounded"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{customStatus.state}</p>
                <p className="text-xs text-muted-foreground">Custom Status</p>
              </div>
            </div>
          )}

          {/* Main Activity */}
          {mainActivity && (
            <div className="mb-4 p-4 bg-accent/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-gamepad text-primary"></i>
                <span className="text-sm font-semibold">{mainActivity.name}</span>
                {mainActivity.timestamps?.start && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {formatElapsed(mainActivity.timestamps.start)}
                  </span>
                )}
              </div>
              {mainActivity.details && (
                <div className="text-sm text-muted-foreground mb-1">{mainActivity.details}</div>
              )}
              {mainActivity.state && (
                <div className="text-sm text-muted-foreground">{mainActivity.state}</div>
              )}
            </div>
          )}

          {/* Spotify */}
          {listening_to_spotify && spotify && (
            <div className="spotify-card">
              <div className="flex items-center gap-2 mb-3">
                <i className="fab fa-spotify spotify-icon text-xl"></i>
                <div className="flex-1">
                  <span className="text-sm font-semibold">Listening to Spotify</span>
                  <div className="text-xs opacity-90">Music is life 🎵</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold">{spotify.song}</div>
                <div className="text-xs opacity-90">by {spotify.artist}</div>
              </div>
              {spotify.timestamps && (
                <div className="mt-3">
                  <div className="bg-black/20 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-white rounded-full h-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((Date.now() - spotify.timestamps.start) / (spotify.timestamps.end - spotify.timestamps.start)) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Last Update Info */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <i className="fas fa-clock"></i>
                Last updated: {formatLastUpdate()}
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-sync-alt"></i>
                Auto-refresh: 30s
              </span>
            </div>
          </div>
        </div>

        {showLogin && (
          <div className="modal-overlay">
            <div className="modal-content p-0 w-full max-w-sm">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-gradient flex items-center gap-2">
                  <i className="fas fa-shield-alt"></i>
                  Admin Access
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter credentials to access admin features
                </p>
              </div>
              
              <form onSubmit={submitLogin} className="p-6 space-y-4">
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-user mr-2"></i>
                    Username
                  </label>
                  <input
                    className="modern-input"
                    placeholder="Enter username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
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
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
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