"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  src?: string;
};

export default function HeroVideoIntro({ children, src = "/smartech_main.mp4" }: Props) {
  const [showVideo, setShowVideo] = useState(true);
  const [cardsIn, setCardsIn] = useState(false);
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    document.documentElement.classList.add("intro-playing");
    document.documentElement.classList.add("intro-mounted");
    return () => {
      document.documentElement.classList.remove("intro-playing");
    };
  }, []);

  useEffect(() => {
    if (!showVideo) {
      const raf = requestAnimationFrame(() => setCardsIn(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [showVideo]);

  const handleEnded = () => {
    document.documentElement.classList.remove("intro-playing");
    window.dispatchEvent(new Event("intro:done"));
    setShowVideo(false);
  };

  return (
    <div className="relative">
      <div
        style={{
          opacity: showVideo ? 0 : cardsIn ? 1 : 0,
          transform: cardsIn ? "translateY(0)" : "translateY(10px)",
          transition: showVideo ? "none" : "opacity .7s ease-out, transform .7s ease-out",
        }}
      >
        {children}
      </div>

      {showVideo && (
        <div className="absolute inset-0 bg-ink overflow-hidden border hair">
          <video
            src={src}
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={handleEnded}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration > 0) setProgress((v.currentTime / v.duration) * 100);
            }}
            style={{ objectPosition: "center" }}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-ink/10">
            <div className="h-full bg-edred" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
