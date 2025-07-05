"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DiscordPresence } from "@/components/discord-presence";
import { SocialLinks } from "@/components/social-links";
import { cn } from "@/lib/utils";

// Artwork metadata
interface Artwork {
  id: number
  title: string
  filename?: string
  url?: string
  description: string
  dimensions?: string
}

const initialArtworkData: Artwork[] = [
  {
    id: 2,
    title: "Kiyosumi Fan-Art",
    filename: "kiynale.png",
    description: "An attempt to recreate 'The kiyosumi effect'",
    dimensions: "1920x1080"
  },
  {
    id: 4,
    title: "Practice Hand",
    filename: "hand.png",
    description: "Referenced from Pinterest",
    dimensions: "800x1200"
  },
  {
    id: 3,
    title: "Jacket Practice",
    filename: "jacket.png",
    description: "Leather jacket folds/textures",
    dimensions: "1024x1024"
  },
  {
    id: 1,
    title: "Yuuri",
    filename: "Yuuri.jpeg",
    description: "From 'Girls last tour' my fav character, yuuri. :)",
    dimensions: "900x1200"
  },
  {
    id: 5,
    title: "Eve shopping O-o",
    filename: "offscript.jpg",
    description: "Submission for off-script (F.A)",
    dimensions: "1080x1350"
  },
  {
    id: 6,
    title: "Frieren",
    filename: "Frieren.jpg",
    description: "M backkkk! Haven't drawn in a while:p",
    dimensions: "1200x1600"
  },
  {
    id: 7,
    title: "Ryo",
    filename: "sip.png",
    description: "ryo yamada sips the coffee ☕",
    dimensions: "800x1000"
  },
  {
    id: 8,
    title: "More Kiyosumi",
    filename: "just-as-you-are.jpg",
    description: "only because kiyo herself said that there might be a reward :>",
    dimensions: "1080x1350"
  },
  {
    id: 9,
    title: "Colors... !",
    filename: "nande.png",
    description: "First drawing after finals, yes I used colors. You're not hallucinating.",
    dimensions: "1024x1280"
  },
];

// Enhanced Modal component with smooth animations
function ArtworkModal({
  artwork,
  onClose,
}: {
  artwork: { src: string; title: string; description: string; dimensions?: string };
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    setZoom((z) => Math.max(Math.min(z + delta, 3), 0.5));
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const endDrag = () => {
    dragging.current = false;
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onMouseUp={endDrag}
    >
      <div className="modal-content w-[90vw] h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border relative z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gradient">{artwork.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{artwork.description}</p>
            {artwork.dimensions && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <i className="fas fa-expand-arrows-alt"></i>
                {artwork.dimensions}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetView();
              }}
              className="modern-button-secondary text-sm px-3 py-2"
              title="Reset view"
            >
              <i className="fas fa-undo"></i>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="modern-button-secondary text-sm px-3 py-2"
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={startDrag}
          onMouseMove={onDrag}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card">
              <div className="animate-shimmer w-32 h-8 rounded"></div>
            </div>
          )}
          <img
            src={artwork.src}
            alt={artwork.title}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full object-contain select-none transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/30 relative z-10">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <i className="fas fa-mouse-pointer"></i>
                Drag to pan
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-search-plus"></i>
                Scroll to zoom
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Zoom: {Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadArtworkModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (data: Artwork) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsSubmitting(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const url = URL.createObjectURL(file);
    onSubmit({ 
      id: Date.now(), 
      title, 
      description, 
      url,
      dimensions: dimensions || undefined
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content p-0 w-full max-w-md">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-gradient flex items-center gap-2">
            <i className="fas fa-upload"></i>
            Upload Artwork
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Share your creative work with the world
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-heading mr-2"></i>
              Title
            </label>
            <input
              className="modern-input"
              placeholder="Enter artwork title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-align-left mr-2"></i>
              Description
            </label>
            <textarea
              className="modern-input resize-none"
              rows={3}
              placeholder="Describe your artwork"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-expand-arrows-alt mr-2"></i>
              Dimensions (optional)
            </label>
            <input
              className="modern-input"
              placeholder="e.g., 1920x1080"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-image mr-2"></i>
              Image File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="modern-input"
              required
            />
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="modern-button-secondary"
              disabled={isSubmitting}
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button
              type="submit"
              className="modern-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload mr-2"></i>
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main page
export default function Home() {
  const [hoverEmoji, setHoverEmoji] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [modal, setModal] = useState<{ src: string; title: string; description: string; dimensions?: string } | null>(null);
  const [artworkData, setArtworkData] = useState<Artwork[]>(initialArtworkData);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Page load animation
  useEffect(() => {
    document.body.style.overflowY = "scroll";
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => {
      document.body.style.overflowY = "";
      clearTimeout(timer);
    };
  }, []);

  // Scroll progress
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", updateScrollProgress);
    updateScrollProgress();
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  const scrollToArtwork = () => {
    const element = document.getElementById("artwork-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const openImage = (src: string, title: string, description: string, dimensions?: string) => {
    setModal({ src, title, description, dimensions });
  };

  const handleAddArtwork = (art: Artwork) => {
    setArtworkData((prev) => [art, ...prev]);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-shimmer w-32 h-8 rounded mx-auto"></div>
          <div className="animate-shimmer w-48 h-4 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Scroll progress indicator */}
      <div 
        className="scroll-indicator" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Clean Header */}
      <header className="sticky top-0 z-40 header-blur animate-slide-in-up">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
                className="text-4xl cursor-pointer transition-all duration-300 hover:scale-110 micro-bounce"
                onMouseEnter={() => setHoverEmoji(true)}
                onMouseLeave={() => setHoverEmoji(false)}
              >
                {hoverEmoji ? "(づ￣ 3￣)づ" : "(/≧▽≦)/"}
              </span>
              <div>
                <h1 className="text-2xl font-bold text-gradient">TskQ</h1>
                <p className="text-sm text-muted-foreground">Digital Artist & Developer</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={scrollToArtwork}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Gallery
              </button>
              <a 
                href="#contact" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8 py-12 animate-bounce-in">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold text-gradient animate-float">
              Welcome to my creative space
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              I'm a digital artist and developer passionate about creating immersive experiences.
              My work spans across various mediums including digital art, web development, and interactive installations.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <button 
              onClick={scrollToArtwork}
              className="modern-button"
            >
              <i className="fas fa-palette mr-2"></i>
              View My Art
            </button>
            <a 
              href="#contact" 
              className="modern-button-secondary"
            >
              <i className="fas fa-envelope mr-2"></i>
              Get In Touch
            </a>
          </div>
        </section>

        {/* Discord Presence Section */}
        <section className="flex justify-center animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
          <DiscordPresence
            userId="1002839537644482611"
            onAdminUpload={() => setShowUploadForm(true)}
          />
        </section>

        {/* Social Links Section */}
        <section className="animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-gradient flex items-center justify-center gap-3">
              <i className="fas fa-share-alt micro-pulse"></i>
              Connect with me
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow my journey across different platforms and stay updated with my latest creations
            </p>
          </div>
          <SocialLinks />
        </section>

        {/* Artwork Gallery */}
        <section id="artwork-section" className="animate-fade-in-scale" style={{ animationDelay: '0.6s' }}>
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6 text-gradient flex items-center justify-center gap-3">
              <i className="fas fa-palette micro-wiggle"></i>
              My Artwork Gallery
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Hope you enjoy my art, dear visitor! Each piece tells a story and represents a moment in my creative journey. 
              Click on any artwork to view it in full detail. If you have any questions regarding my work, 
              feel free to drop a dm on discord~ ^-^
            </p>
          </div>
          
          <div className="masonry">
            {artworkData.map((artwork, index) => (
              <div
                key={artwork.id}
                className="masonry-item animate-bounce-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => openImage(
                  artwork.url ?? `/${artwork.filename}`, 
                  artwork.title, 
                  artwork.description,
                  artwork.dimensions
                )}
              >
                <img
                  src={artwork.url ?? `/${artwork.filename}`}
                  alt={artwork.title}
                  className="cursor-zoom-in"
                  loading="lazy"
                />
                <div className="masonry-item-content">
                  <h3 className="flex items-center gap-2">
                    <i className="fas fa-image text-primary text-sm"></i>
                    {artwork.title}
                  </h3>
                  <p>{artwork.description}</p>
                  {artwork.dimensions && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <i className="fas fa-expand-arrows-alt"></i>
                      {artwork.dimensions}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="text-center py-16 animate-fade-in-scale">
          <div className="modern-card max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold mb-6 text-gradient">Let's Create Together</h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Interested in collaborating or have a project in mind? I'd love to hear from you! 
              Whether it's digital art, web development, or something entirely new, let's make it happen.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="mailto:contact@tskq.dev" 
                className="modern-button"
              >
                <i className="fas fa-envelope mr-2"></i>
                Email Me
              </a>
              <a 
                href="https://discord.com/users/1002839537644482611" 
                target="_blank" 
                rel="noopener noreferrer"
                className="modern-button-secondary"
              >
                <i className="fab fa-discord mr-2"></i>
                Discord
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Back to top button */}
      {scrollProgress > 20 && (
        <button
          className="floating-action-button animate-bounce-in"
          onClick={scrollToTop}
          title="Back to top"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}

      {/* Enhanced Footer */}
      <footer className="border-t border-border bg-muted/20 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center items-center gap-3 text-2xl">
              <span className="micro-bounce">(/≧▽≦)/</span>
              <span className="text-gradient font-bold">TskQ</span>
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">
              Creating digital art and immersive experiences with passion and creativity.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <i className="fas fa-copyright"></i>
                {new Date().getFullYear()} TskQ
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-heart text-red-400"></i>
                Made with love
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-coffee text-yellow-400"></i>
                Powered by coffee
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {modal && (
        <ArtworkModal
          artwork={modal}
          onClose={() => setModal(null)}
        />
      )}

      {showUploadForm && (
        <UploadArtworkModal
          onSubmit={handleAddArtwork}
          onClose={() => setShowUploadForm(false)}
        />
      )}
    </div>
  );
}