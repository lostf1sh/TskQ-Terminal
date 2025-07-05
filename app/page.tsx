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
}

const initialArtworkData: Artwork[] = [
  {
    id: 2,
    title: "Kiyosumi Fan-Art",
    filename: "kiynale.png",
    description: "An attempt to recreate 'The kiyosumi effect'",
  },
  {
    id: 4,
    title: "Practice Hand",
    filename: "hand.png",
    description: "Referenced from Pinterest",
  },
  {
    id: 3,
    title: "Jacket Practice",
    filename: "jacket.png",
    description: "Leather jacket folds/textures",
  },
  {
    id: 1,
    title: "Yuuri",
    filename: "Yuuri.jpeg",
    description: "From 'Girls last tour' my fav character, yuuri. :)",
  },
  {
    id: 5,
    title: "Eve shopping O-o",
    filename: "offscript.jpg",
    description: "Submission for off-script (F.A)",
  },
  {
    id: 6,
    title: "Frieren",
    filename: "Frieren.jpg",
    description: "M backkkk! Haven't drawn in a while:p",
  },
  {
    id: 7,
    title: "Ryo",
    filename: "sip.png",
    description: "ryo yamada sips the coffee ☕",
  },
  {
    id: 8,
    title: "More Kiyosumi",
    filename: "just-as-you-are.jpg",
    description:
      "only because kiyo herself said that there might be a reward :>",
  },
  {
    id: 9,
    title: "Colors... !",
    filename: "nande.png",
    description:
      "First drawing after finals, yes I used colors. You're not hallucinating.",
  },
];

// Modal component for zoom + pan
function ZoomableModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
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
    const delta = -e.deltaY * 0.001;
    setZoom((z) => Math.max(z + delta, 0.1));
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

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      onMouseUp={endDrag}
    >
      <div
        className="relative cursor-grab w-[80vw] h-[80vh]"
        onWheel={handleWheel}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 left-4 z-10 modern-button-secondary"
        >
          ✕
        </button>
        <img
          src={src}
          alt={alt}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          className="w-full h-full object-contain select-none transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          }}
        />
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 modern-card text-sm px-4 py-2"
          onClick={(e) => e.stopPropagation()}
        >
          Scroll to zoom in/out
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
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const url = URL.createObjectURL(file);
    onSubmit({ id: Date.now(), title, description, url });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6">Upload Artwork</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="modern-input"
              placeholder="Enter artwork title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              className="modern-input"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="modern-input"
              required
            />
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="modern-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modern-button"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main page
export default function Home() {
  const [showArtwork, setShowArtwork] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [hoverEmoji, setHoverEmoji] = useState(false);
  const [scrollArrows, setScrollArrows] = useState({ down: true, up: false });
  const [modal, setModal] = useState<{ src: string; alt: string } | null>(null);
  const [artworkData, setArtworkData] = useState<Artwork[]>(initialArtworkData);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Always show vertical scrollbar to prevent layout shift
  useEffect(() => {
    document.body.style.overflowY = "scroll";
    setIsLoaded(true);
    return () => {
      document.body.style.overflowY = "";
    };
  }, []);

  // Clock
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll arrow visibility
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const artSection = document.getElementById("artwork-section");
      const artTop = artSection?.offsetTop || Infinity;
      setScrollArrows({
        down: y < 100 && showArtwork,
        up: y > artTop - 100 && showArtwork,
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [showArtwork]);

  const scrollToArtwork = () =>
    window.scrollTo({
      top: document.getElementById("artwork-section")?.offsetTop || 0,
      behavior: "smooth",
    });
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const openImage = (src: string, alt: string) => setModal({ src, alt });
  const handleAddArtwork = (art: Artwork) => {
    setArtworkData((prev) => [...prev, art]);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="loading-skeleton w-32 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span
              className="text-3xl cursor-pointer transition-transform duration-200 hover:scale-110"
              onMouseEnter={() => setHoverEmoji(true)}
              onMouseLeave={() => setHoverEmoji(false)}
            >
              {hoverEmoji ? "(づ￣ 3￣)づ" : "(/≧▽≦)/"}
            </span>
            <div>
              <h1 className="text-xl font-semibold">TskQ</h1>
              <p className="text-sm text-muted-foreground">Digital Artist & Developer</p>
            </div>
          </div>
          <DiscordPresence
            userId="1002839537644482611"
            onAdminUpload={() => setShowUploadForm(true)}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Welcome Section */}
        <section className="text-center space-y-6 animate-slide-in">
          <h2 className="text-4xl font-bold text-gradient">Welcome to my creative space</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I'm a digital artist and developer passionate about creating immersive experiences.
            My work spans across various mediums including digital art, web development, and interactive installations.
          </p>
        </section>

        {/* Social Links Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-2xl font-semibold text-center mb-8">Connect with me</h3>
          <SocialLinks />
        </section>

        {/* Artwork Toggle */}
        <section className="text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setShowArtwork((v) => !v)}
            className="modern-button"
          >
            {showArtwork ? "Hide Artwork" : "Show Artwork"}
          </button>
          
          {/* Scroll down indicator */}
          {showArtwork && scrollArrows.down && (
            <div
              className="mt-8 text-primary text-4xl cursor-pointer select-none transition-all duration-300 hover:transform hover:scale-110 animate-bounce"
              onClick={scrollToArtwork}
            >
              ↓
            </div>
          )}
        </section>

        {/* Artwork Gallery */}
        {showArtwork && (
          <section id="artwork-section" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">My Artwork</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hope you enjoy my art, dear visitor! If you have any questions regarding my work, 
                feel free to drop a dm on discord~ ^-^
              </p>
            </div>
            
            <div className="masonry">
              {artworkData.map((artwork, index) => (
                <div
                  key={artwork.id}
                  className="masonry-item animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={artwork.url ?? `/${artwork.filename}`}
                    alt={artwork.title}
                    className="cursor-zoom-in"
                    onClick={() => openImage(artwork.url ?? `/${artwork.filename}`, artwork.title)}
                  />
                  <div className="masonry-item-content">
                    <h3>{artwork.title}</h3>
                    <p>{artwork.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Back to top button */}
      {scrollArrows.up && (
        <button
          className="fixed bottom-8 right-8 modern-button rounded-full w-12 h-12 flex items-center justify-center text-xl shadow-lg"
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} TskQ. All rights reserved.</p>
          <p className="text-sm mt-2">System time: {currentTime}</p>
        </div>
      </footer>

      {/* Modals */}
      {modal && (
        <ZoomableModal
          src={modal.src}
          alt={modal.alt}
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