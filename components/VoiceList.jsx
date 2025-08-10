// components/VoiceList.js
import { useRef, useState, useEffect } from "react";

// List your voices (files must exist in /public/voices/<name>.mp3)
const VOICES = [
  { id: "alloy",     label: "Alloy",     tags: ["American", "En", "Conversational"] },
  { id: "ash",       label: "Ash",       tags: ["Middle aged", "En", "Male"] },
  { id: "ballad",    label: "Ballad",    tags: ["Warm", "Narration", "En"] },
  { id: "coral",     label: "Coral",     tags: ["Friendly", "En", "Female"] },
  { id: "echo",      label: "Echo",      tags: ["Crisp", "Clear", "En"] },
  { id: "fable",     label: "Fable",     tags: ["Storytelling", "Soft", "En"] },
  { id: "nova",      label: "Nova",      tags: ["Young", "En", "Conversational"] },
  { id: "onyx",      label: "Onyx",      tags: ["Deep", "Male", "En"] },
  { id: "sage",      label: "Sage",      tags: ["Calm", "Informative", "En"] },
  { id: "shimmer",   label: "Shimmer",   tags: ["Bright", "Upbeat", "En"] },
];

export default function VoiceList({ basePath = "/voices" }) {
  const [playingId, setPlayingId] = useState(null);
  const audioRefs = useRef({}); // id -> HTMLAudioElement

  // Ensure only one plays at a time
  const playVoice = async (id) => {
    const current = audioRefs.current[playingId];
    const next = audioRefs.current[id];

    // If clicking the one already playing, toggle pause
    if (playingId === id) {
      if (!next) return;
      if (!next.paused) {
        next.pause();
        setPlayingId(null);
      } else {
        await next.play();
        setPlayingId(id);
      }
      return;
    }

    // Pause old if exists
    if (current && !current.paused) {
      current.pause();
      current.currentTime = 0;
    }

    if (next) {
      await next.play().catch(() => {}); // avoid unhandled promise on autoplay blocks
      setPlayingId(id);
    }
  };

  // When an audio ends, clear state if it was the one playing
  useEffect(() => {
    const entries = Object.entries(audioRefs.current);
    entries.forEach(([id, el]) => {
      const handler = () => {
        if (playingId === id) setPlayingId(null);
      };
      el?.addEventListener?.("ended", handler);
      return () => el?.removeEventListener?.("ended", handler);
    });
  }, [playingId]);

  return (
    <div className="flex flex-col gap-2">
      {VOICES.map((v) => {
        const src = `${basePath}/${v.id}.mp3`;
        const isActive = playingId === v.id;

        return (
          <div
            key={v.id}
            className={[
              "flex items-center justify-between rounded-xl border bg-white/70 dark:bg-neutral-900",
              "px-3 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition",
              isActive ? "ring-2 ring-emerald-400" : "border-neutral-200 dark:border-neutral-700",
            ].join(" ")}
          >
            {/* Left section: play button + avatar + text */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Play / Pause button */}
              <button
                type="button"
                onClick={() => playVoice(v.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
                aria-label={isActive ? `Pause ${v.label}` : `Play ${v.label}`}
              >
                {isActive ? (
                  // Pause icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="10" y1="4" x2="10" y2="20"></line>
                    <line x1="14" y1="4" x2="14" y2="20"></line>
                  </svg>
                ) : (
                  // Play icon
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"></path>
                  </svg>
                )}
              </button>

              {/* Gradient avatar */}
              <div className="h-9 w-9 rounded-md bg-gradient-to-br from-fuchsia-500 via-sky-500 to-emerald-400" />

              {/* Name + subtitle */}
              <div className="min-w-0">
                <div className="font-semibold truncate">{v.label}</div>
                <div className="text-xs text-neutral-500">Works with any language</div>
              </div>

              {/* Hidden audio element */}
              <audio
                ref={(el) => (audioRefs.current[v.id] = el)}
                src={src}
                preload="none"
              />
            </div>

            {/* Right section: tags */}
            <div className="hidden sm:flex flex-wrap gap-2 justify-end">
              {v.tags?.map((t, i) => (
                <span
                  key={i}
                  className="text-[11px] leading-tight px-2 py-1 rounded-full border border-neutral-200 text-neutral-600 bg-neutral-50
                             dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
