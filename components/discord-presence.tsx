"use client"

import { useState, useEffect, useRef } from "react"

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

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function DiscordPresence({ userId, onAdminUpload }: DiscordPresenceProps) {
  const [presenceData, setPresenceData] = useState<DiscordPresence | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  const [showLogin, setShowLogin] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // WebSocket connection with Lanyard
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        setConnectionStatus('connecting')
        const ws = new WebSocket('wss://api.lanyard.rest/socket')
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected to Lanyard')
          setConnectionStatus('connected')
          setRetryCount(0)
          
          // Subscribe to user presence
          ws.send(JSON.stringify({
            op: 2,
            d: {
              subscribe_to_id: userId
            }
          }))
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.op === 0) { // Event
              if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
                setPresenceData(data.d)
              }
            } else if (data.op === 1) { // Hello
              // Send heartbeat
              const heartbeatInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ op: 3 }))
                }
              }, data.d.heartbeat_interval)

              // Clean up interval when connection closes
              ws.onclose = () => {
                clearInterval(heartbeatInterval)
              }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setConnectionStatus('error')
        }

        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          setConnectionStatus('disconnected')
          
          // Attempt to reconnect with exponential backoff
          if (retryCount < 5) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
            console.log(`Reconnecting in ${delay}ms...`)
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setRetryCount(prev => prev + 1)
              connectWebSocket()
            }, delay)
          }
        }
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error)
        setConnectionStatus('error')
      }
    }

    connectWebSocket()

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [userId, retryCount])

  // Fallback HTTP polling if WebSocket fails
  useEffect(() => {
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') {
      const fallbackFetch = async () => {
        try {
          const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`)
          if (!res.ok) throw new Error(`API returned ${res.status}`)
          const json = await res.json()
          if (json.success) {
            setPresenceData(json.data)
            setConnectionStatus('connected')
          }
        } catch (error) {
          console.error('Fallback fetch failed:', error)
        }
      }

      const interval = setInterval(fallbackFetch, 30000)
      fallbackFetch() // Initial fetch

      return () => clearInterval(interval)
    }
  }, [userId, connectionStatus])

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
      case 'connecting': return 'Connecting...'
      case 'connected': return 'Live'
      case 'disconnected': return 'Reconnecting...'
      case 'error': return 'Offline'
      default: return 'Unknown'
    }
  }

  if (connectionStatus === 'connecting' && !presenceData) {
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
          Connecting to Discord...
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
          connectionStatus === 'connected' ? 'fa-wifi' :
          connectionStatus === 'connecting' ? 'fa-circle-notch fa-spin' :
          connectionStatus === 'disconnected' ? 'fa-wifi' :
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

          {/* Footer info */}
          <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            <i className="fas fa-info-circle mr-1"></i>
            Real-time via Lanyard API
          </div>
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