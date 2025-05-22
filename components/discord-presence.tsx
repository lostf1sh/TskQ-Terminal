// components/DiscordPresence.tsx
"use client";

import { useState, useEffect } from "react";

interface DiscordUser {
  username: string;
  avatar: string;
  id: string;
  discriminator: string;
}

interface DiscordActivity {
  type: number;
  name: string;
  state?: string;
  details?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

interface DiscordPresence {
  discord_user: DiscordUser;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: DiscordActivity[];
  listening_to_spotify: boolean;
  spotify?: {
    song: string;
    artist: string;
    album_art_url: string;
    timestamps: {
      start: number;
      end: number;
    };
  };
}

interface DiscordPresenceProps {
  userId: string;
}

export function DiscordPresence({ userId }: DiscordPresenceProps) {
  const [presenceData, setPresenceData] = useState<DiscordPresence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresenceData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
        const json = await res.json();
        if (!json.success) throw new Error("API returned success=false");
        setPresenceData(json.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(`Failed to load Discord data: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPresenceData();
    const interval = setInterval(fetchPresenceData, 30_000);
    return () => clearInterval(interval);
  }, [userId]);

  const formatElapsedTime = (start: number) => {
    const now = Date.now();
    const diff = now - start;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="text-right space-y-0.5">
        <div className="terminal-green text-xs">$ fetching discord_status</div>
        <div className="terminal-white text-xs">loading…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-right space-y-0.5">
        <div className="terminal-green text-xs">$ discord_status</div>
        <div className="terminal-white text-xs">error: connection failed</div>
      </div>
    );
  }
  if (!presenceData) {
    return (
      <div className="text-right space-y-0.5">
        <div className="terminal-green text-xs">$ discord_status</div>
        <div className="terminal-white text-xs">no data available</div>
      </div>
    );
  }

  const { discord_user, discord_status, activities, listening_to_spotify, spotify } = presenceData;
  const mainActivity = activities.find(a => a.type === 0 || a.type === 1);

  return (
    <div className="text-right space-y-1">
      <div className="terminal-green text-xs">$ discord_status</div>

      <div className="flex items-center justify-end space-x-2">
        {discord_user.avatar && (
          <img
            src={`https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=64`}
            alt={discord_user.username}
            className="w-6 h-6 rounded-full"
          />
        )}
        <div className="terminal-white text-xs">
          {discord_user.username} [{discord_status}]
        </div>
      </div>

      {mainActivity && (
        <>
          <div className="terminal-orange text-xs">
            {mainActivity.name}
            {mainActivity.timestamps?.start && ` (${formatElapsedTime(mainActivity.timestamps.start)})`}
          </div>
          {mainActivity.details && <div className="terminal-white text-[10px]">{mainActivity.details}</div>}
          {mainActivity.state   && <div className="terminal-white text-[10px]">{mainActivity.state}</div>}
        </>
      )}

      {listening_to_spotify && spotify && (
        <>
          <div className="terminal-orange text-xs">spotify: {spotify.song}</div>
          <div className="terminal-white text-[10px]">by {spotify.artist}</div>
        </>
      )}
    </div>
  );
}
