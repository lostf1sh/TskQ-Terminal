"use client"

export function SocialLinks() {
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/tskq",
      icon: "GH>_",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/tskilca",
      icon: "IG>_",
    },
    {
      name: "SoundCloud",
      url: "https://soundcloud.com/floppydisc-825748608",
      icon: "SC>_",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@tskku",
      icon: "YT>_",
    },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {socialLinks.map((link) => (
        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="terminal-button">
          <div className="border border-green-500 px-4 py-2 hover:bg-green-500 hover:text-black transition-colors">
            <span className="terminal-green font-bold">{link.icon}</span>
          </div>
        </a>
      ))}
    </div>
  )
}
