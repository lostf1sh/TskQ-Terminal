"use client"

export function SocialLinks() {
  const socialLinks = [
    {
      name: "Bluesky",
      url: "https://bsky.app/profile/tskq.bsky.social",
      icon: "fas fa-cloud",
      platform: "bluesky",
      description: "Latest thoughts and updates"
    },
    {
      name: "Instagram",
      url: "https://instagram.com/tskilca",
      icon: "fab fa-instagram",
      platform: "instagram",
      description: "Visual stories and art"
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@tskilca",
      icon: "fab fa-tiktok",
      platform: "tiktok",
      description: "Creative short videos"
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@tskku",
      icon: "fab fa-youtube",
      platform: "youtube",
      description: "Tutorials and timelapses"
    },
    {
      name: "GitHub",
      url: "https://github.com/tskq",
      icon: "fab fa-github",
      platform: "github",
      description: "Code and projects"
    },
    {
      name: "Twitter",
      url: "https://x.com/TskDied",
      icon: "fab fa-twitter",
      platform: "twitter",
      description: "Quick updates and thoughts"
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {socialLinks.map((link, index) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link animate-bounce-in group"
          data-platform={link.platform}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center gap-3">
            <i className={`${link.icon} text-xl group-hover:scale-110 transition-transform`}></i>
            <div className="flex-1 text-left">
              <div className="font-semibold">{link.name}</div>
              <div className="text-xs text-muted-foreground group-hover:text-current transition-colors">
                {link.description}
              </div>
            </div>
          </div>
          <i className="fas fa-external-link-alt text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
        </a>
      ))}
    </div>
  )
}