// components/VoiceList.js
import { useRef, useState } from "react";

// Files must exist in /public/voices/<id>.mp3
const VOICES = [
  { id: "alloy",   label: "Alloy",   tags: ["American", "En", "Conversational"] },
  { id: "ash",     label: "Ash",     tags: ["Middle aged", "En", "Male"] },
  { id: "ballad",  label: "Ballad",  tags: ["Warm", "Narration", "En"] },
  { id: "coral",   label: "Coral",   tags: ["Friendly", "En", "Female"] },
  { id: "echo",    label: "Echo",    tags: ["Crisp", "Clear", "En"] },
  { id: "fable",   label: "Fable",   tags: ["Storytelling", "Soft", "En"] },
  { id: "nova",    label: "Nova",    tags: ["Young", "En", "Conversational"] },
  { id: "onyx",    label: "Onyx",    tags: ["Deep", "Male", "En"] },
  { id: "sage",    label: "Sage",    tags: ["Calm", "Informative", "En"] },
  { id: "shimmer", label: "Shimmer", tags: ["Bright", "Upbeat", "En"] },
];

export default function VoiceList({
  basePath = "/voices",
  onSelect,              // (voiceObj) => void
  initialSelectedId = null,
}) {
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [playingId, setPlayingId] = useState(null);
  const audioRefs = useRef({}); // id -> HTMLAudioElement

  const srcFor = (id) => `${basePath}/${id}.mp3`;

  // Ensure only one plays at a time
  const playVoice = async (id) => {
    const current = audioRefs.current[playingId];
    const next = audioRefs.current[id];

    // pause the currently playing one (if different)
    if (playingId && playingId !== id && current && !current.paused) {
      current.pause();
      current.currentTime = 0;
    }

    if (!next) return;

    // toggle if same item
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

  const handleSelect = (voice) => {
    setSelectedId(voice.id);
    onSelect?.({ ...voice, url: srcFor(voice.id) });
  };

  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label="Voice selection">
      {VOICES.map((v) => {
        const isSelected = selectedId === v.id;
        const isPlaying = playingId === v.id;
        const src = srcFor(v.id);

        return (
          <div
            key={v.id}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onClick={() => handleSelect(v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelect(v);
              }
            }}
            className={[
              "flex items-center justify-between rounded-xl border bg-white/70 dark:bg-neutral-900",
              "px-3 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer",
              isSelected
                ? "ring-2 ring-emerald-400 border-emerald-300"
                : "border-neutral-200 dark:border-neutral-700",
            ].join(" ")}
          >
            {/* Left: play button + avatar + text */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playVoice(v.id);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
                aria-label={isPlaying ? `Pause ${v.label}` : `Play ${v.label}`}
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
                <div className="font-semibold truncate">{v.label}</div>
                <div className="text-xs text-neutral-500">Works with any language</div>
              </div>

              <audio
                ref={(el) => (audioRefs.current[v.id] = el)}
                src={src}
                preload="none"
                onEnded={() => setPlayingId((p) => (p === v.id ? null : p))}
              />
            </div>

            {/* Right: tags */}
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
