// components/MusicLibrary.js
import { useRef, useState } from "react";

// "A Future" -> "a-future"
const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function MusicLibrary({ basePath = "/music", onSelect }) {
  const TRACKS = [
    { title: "Observer",         tags: ["Tiktok", "Curious"] },
    { title: "A Future",         tags: ["Electro", "Tiktok"] },
    { title: "Burlesque",        tags: ["Calm", "Tiktok", "Curious"] },
    { title: "Bladerunner Remix",tags: ["Electro", "Tiktok"] },
    { title: "Corny Candy",      tags: ["Calm", "Tiktok", "Curious"] },
  ].map((t) => ({ ...t, id: slug(t.title) }));

  const [selectedId, setSelectedId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const audioRefs = useRef({}); // id -> HTMLAudioElement

  const srcFor = (id) => `${basePath}/${id}.mp3`;

  const playTrack = async (id) => {
    const current = audioRefs.current[playingId];
    const next = audioRefs.current[id];

    if (playingId && playingId !== id && current && !current.paused) {
      current.pause();
      current.currentTime = 0;
    }
    if (!next) return;

    if (playingId === id) {
      if (!next.paused) {
        next.pause();
        setPlayingId(null);
      } else {
        await next.play().catch(() => {});
        setPlayingId(id);
      }
      return;
    }

    await next.play().catch(() => {});
    setPlayingId(id);
  };

  const handleSelect = (track) => {
    setSelectedId(track.id);
    onSelect?.({ title: track.title, url: srcFor(track.id), tags: track.tags });
  };

  return (
    <div className="flex flex-col gap-2">
      {TRACKS.map((t) => {
        const isActive = selectedId === t.id;
        const isPlaying = playingId === t.id;

        return (
          <div
            key={t.id}
            className={[
              "flex items-center justify-between rounded-xl border bg-white/70 dark:bg-neutral-900",
              "px-3 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer",
              isActive
                ? "ring-2 ring-emerald-400 border-emerald-300"
                : "border-neutral-200 dark:border-neutral-700",
            ].join(" ")}
            role="radio"
            aria-checked={isActive}
            tabIndex={0}
            onClick={() => handleSelect(t)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(t);
              }
            }}
          >
            {/* Left: play button + avatar + text */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(t.id);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
                aria-label={isPlaying ? `Pause ${t.title}` : `Play ${t.title}`}
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
                    <line x1="10" y1="4" x2="10" y2="20" />
                    <line x1="14" y1="4" x2="14" y2="20" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-fuchsia-500 via-sky-500 to-emerald-400" />

              <div className="min-w-0">
                <div className="font-semibold truncate">{t.title}</div>
                <div className="text-xs text-neutral-500">Background music</div>
              </div>

              <audio
                ref={(el) => (audioRefs.current[t.id] = el)}
                src={srcFor(t.id)}
                preload="none"
                onEnded={() => setPlayingId((p) => (p === t.id ? null : p))}
              />
            </div>

            {/* Right: tags */}
            <div className="hidden sm:flex flex-wrap gap-2 justify-end">
              {t.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] leading-tight px-2 py-1 rounded-full border border-neutral-200 text-neutral-600 bg-neutral-50
                             dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
