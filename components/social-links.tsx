"use client"

import {
  Github,
  Instagram,
  Youtube,
  Music2,
  Twitter
} from "lucide-react"

export function SocialLinks() {
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/tskq",
      icon: <Github size={20} />,
    },
    {
      name: "Instagram",
      url: "https://instagram.com/tskilca",
      icon: <Instagram size={20} />,
    },
    {
      name: "X",
      url: "https://x.com/TskDied",
      icon: <Twitter size={20} />,
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@tskku",
      icon: <Youtube size={20} />,
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@tskilca",
      icon: <Music2 size={20} />,
    },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="flex items-center gap-2 bg-black border border-green-500 text-green-500 px-4 py-2 rounded hover:bg-green-500 hover:text-black transition-colors">
            <span className="text-green-500 hover:text-black transition-colors">
              {link.icon}
            </span>
            <span className="font-bold">{link.name}</span>
          </button>
        </a>
      ))}
    </div>
  )
}
