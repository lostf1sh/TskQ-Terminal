"use client"

import {
  Instagram,
  Youtube,
  Music2,
  Camera
} from "lucide-react"

export function SocialLinks() {
  const socialLinks = [
    {
      name: "Bsky",
      url: "https://bsky.app/profile/tskq.bsky.social",
      icon: <Camera size={20} />,
    },
    {
      name: "Instagram",
      url: "https://instagram.com/tskilca",
      icon: <Instagram size={20} />,
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@tskilca",
      icon: <Music2 size={20} />,
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@tskku",
      icon: <Youtube size={20} />,
    },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {socialLinks.map((link, index) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <span className="text-primary">
            {link.icon}
          </span>
          <span>{link.name}</span>
        </a>
      ))}
    </div>
  )
}