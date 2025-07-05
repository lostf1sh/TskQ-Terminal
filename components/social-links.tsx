"use client"

export function SocialLinks() {
  const socialLinks = [
    {
      name: "Bluesky",
      url: "https://bsky.app/profile/tskq.bsky.social",
      icon: "fas fa-cloud",
      platform: "bluesky",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/tskilca",
      icon: "fab fa-instagram",
      platform: "instagram",
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@tskilca",
      icon: "fab fa-tiktok",
      platform: "tiktok",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@tskku",
      icon: "fab fa-youtube",
      platform: "youtube",
    },
    {
      name: "GitHub",
      url: "https://github.com/tskq",
      icon: "fab fa-github",
      platform: "github",
    },
    {
      name: "Twitter",
      url: "https://x.com/TskDied",
      icon: "fab fa-twitter",
      platform: "twitter",
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
          data-platform={link.platform}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <i className={link.icon}></i>
          <span>{link.name}</span>
        </a>
      ))}
    </div>
  )
}