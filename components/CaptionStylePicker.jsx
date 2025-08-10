// components/CaptionsPanel.js
import { useState } from "react";

export default function CaptionStylePicker({
  defaultDisabled = false,
  defaultStyleId = "basic",
  defaultAlignment = "bottom",
  onChange,
}) {
  const [disabled, setDisabled] = useState(defaultDisabled);
  const [selected, setSelected] = useState(defaultStyleId);
  const [alignment, setAlignment] = useState(defaultAlignment);

  const CAPTION_STYLES = [
    { id: "basic", label: "BASIC", lineClass: "heavy-shadow-text-effect-line", textClass: "heavy-shadow-text-effect",
      cssVars: { "--text-content": "Basic", "--text-color": "#FFFFFF" },
      textStyle: { fontFamily: "Montserrat, sans-serif", fontWeight: 700, textTransform: "uppercase" },
    },
    { id: "revid", label: "REVID", lineClass: "lower-stroke-text-effect-line", textClass: "lower-stroke-text-effect",
      cssVars: { "--text-content": "Revid", "--text-color": "#FFFFFF", "--effect-color": "#000000", "--text-effect-color": "#000000" },
      textStyle: { fontFamily: "Poppins, sans-serif", fontWeight: 700, textTransform: "uppercase" },
    },
    { id: "hormozi", label: "HORMOZI", lineClass: "glow-text-effect-line", textClass: "glow-text-effect",
      cssVars: { "--text-content": "Hormozi", "--text-color": "#FFED38", "--effect-color": "#FFED38", "--text-effect-color": "#FFED38" },
      textStyle: { fontFamily: "Anton, sans-serif", fontWeight: 700, textTransform: "uppercase" },
    },
    { id: "ali", label: "Ali", lineClass: "wrap-text-effect-line", textClass: "wrap-text-effect",
      cssVars: { "--text-content": "Ali", "--text-color": "#1C1E1D", "--effect-color": "#FFFFFF", "--text-effect-color": "#FFFFFF" },
      textStyle: { fontFamily: "Poppins, sans-serif", fontWeight: 700 },
    },
    { id: "wrap-1", label: "Wrap 1", lineClass: "lower-stroke-text-effect-line", textClass: "lower-stroke-text-effect",
      cssVars: { "--text-content": "Wrap 1", "--text-color": "#f6f6db" },
      textStyle: { fontFamily: "Lexend, sans-serif", fontWeight: 700 },
      wrapBg: { background: "#F8423C", inset: "-0.2em -0.4em", borderRadius: "0.4em" },
    },
    { id: "wrap-2", label: "WRAP2", lineClass: "lower-stroke-text-effect-line", textClass: "lower-stroke-text-effect",
      cssVars: { "--text-content": "Wrap 2", "--text-color": "#ffffff" },
      textStyle: { fontFamily: "Poppins, sans-serif", fontWeight: 700, textTransform: "uppercase" },
      wrapBg: { background: "#79D4F6", inset: "-0.05em -0.5em", borderRadius: "0.2em" },
    },
    { id: "faceless", label: "FACELESS", lineClass: "bevel-text-effect-line", textClass: "bevel-text-effect",
      cssVars: { "--text-content": "Faceless", "--text-color": "#D8D7D7" },
      textStyle: { fontFamily: "Lexend, sans-serif", fontWeight: 700, textTransform: "uppercase" },
    },
    { id: "elegant", label: "Elegant", lineClass: "subtle-shadow-text-effect-line", textClass: "subtle-shadow-text-effect",
      cssVars: { "--text-content": "Elegant", "--text-color": "#ffffff" },
      textStyle: { fontFamily: '"Libre Baskerville", sans-serif', fontWeight: 700 },
    },
    { id: "difference", label: "Difference", filledTile: true,
      lineClass: "difference-text-effect-line", textClass: "difference-text-effect",
      cssVars: { "--text-content": "Difference", "--text-color": "#ffffff" },
      textStyle: { fontFamily: "Inter, sans-serif", fontWeight: 800 },
    },
    { id: "opacity", label: "Opacity", lineClass: "wrap-text-effect-line", textClass: "wrap-text-effect",
      cssVars: { "--text-content": "Opacity", "--text-color": "#ffffff", "--effect-color": "#000000b3", "--text-effect-color": "#000000b3" },
      textStyle: { fontFamily: "Inter, sans-serif", fontWeight: 300 },
    },
    { id: "playful", label: "Playful", lineClass: "outline-alternative-text-effect-line", textClass: "outline-alternative-text-effect",
      cssVars: { "--text-content": "Playful", "--text-color": "#ffffff", "--effect-color": "#543407", "--text-effect-color": "#543407" },
      textStyle: { fontFamily: "DynaPuff, sans-serif", fontWeight: 700 },
    },
    { id: "bold-punch", label: "BOLDPUNCH", lineClass: "outline-text-effect-line", textClass: "outline-text-effect",
      cssVars: { "--text-content": "Bold Punch", "--text-color": "#FFFF00", "--effect-color": "#000000" },
      textStyle: { fontFamily: '"Bebas Neue", sans-serif', fontWeight: 900, textTransform: "uppercase", WebkitTextStroke: "0.01em #ffffff" },
    },
    { id: "movie", label: "Movie", lineClass: "lower-stroke-text-effect-line", textClass: "lower-stroke-text-effect",
      cssVars: { "--text-content": "Movie", "--text-color": "#FFFFFF", "--effect-color": "#000000", "--text-effect-color": "#000000" },
      textStyle: { fontFamily: '"Roboto Slab", sans-serif', fontWeight: 400 },
    },
    { id: "outline", label: "Outline", darkTile: true,
      lineClass: "outline-text-effect-line", textClass: "outline-text-effect",
      cssVars: { "--text-content": "Outline", "--text-color": "#000000", "--effect-color": "#ffffff" },
      textStyle: { fontFamily: "Inter, sans-serif", fontWeight: 700, WebkitTextStroke: "0.01em #ffffff" },
    },
  ];

  const announce = (next = {}) =>
    onChange?.({
      disabled,
      style: CAPTION_STYLES.find((s) => s.id === selected),
      alignment,
      ...next,
    });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-800">Captions</h2>

      {/* Disable toggle */}
      <div className="mt-3 flex items-center justify-between">
        <div>
          <label htmlFor="toggle-captions" className="text-sm font-medium text-slate-700">
            Disable Captions
          </label>
          <p className="text-xs text-slate-500">Do not show captions in your video</p>
        </div>
        <button
          id="toggle-captions"
          type="button"
          onClick={() => {
            const val = !disabled;
            setDisabled(val);
            announce({ disabled: val });
          }}
          className={[
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            disabled ? "bg-slate-300" : "bg-emerald-500",
          ].join(" ")}
          aria-pressed={!disabled}
          aria-label="Toggle captions"
        >
          <span
            className={[
              "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
              disabled ? "translate-x-1" : "translate-x-5",
            ].join(" ")}
          />
        </button>
      </div>

      {/* Presets */}
      <p className="mt-5 mb-2 text-sm text-slate-600">Select a preset to add to your captions</p>

      <div
        className={[
          "grid grid-cols-2 lg:grid-cols-3 gap-3 w-full",
          disabled ? "opacity-50 pointer-events-none" : "",
        ].join(" ")}
        role="radiogroup"
        aria-label="Caption style"
      >
        {CAPTION_STYLES.map((s) => {
          const isActive = selected === s.id;
          const baseTile =
            "rounded-md px-2 py-4 flex items-center justify-center w-full relative gap-1 cursor-pointer border transition-all";
          const visualState = isActive
            ? "bg-white outline outline-2 outline-emerald-400 border-emerald-300"
            : "bg-white hover:bg-slate-50 border-slate-200";
          const variantBg = s.filledTile ? "bg-slate-600 text-white" : s.darkTile ? "bg-slate-900 text-white" : "";
          return (
            <div
              key={s.id}
              role="radio"
              aria-checked={isActive}
              tabIndex={0}
              onClick={() => {
                setSelected(s.id);
                announce({ style: s });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(s.id);
                  announce({ style: s });
                }
              }}
              className={[baseTile, visualState, variantBg].join(" ")}
            >
              <span className={s.lineClass} style={s.cssVars}>
                <span
                  className={s.textClass}
                  style={{
                    position: "relative",
                    color: s.cssVars["--text-color"],
                    ...s.textStyle,
                  }}
                >
                  {s.wrapBg ? (
                    <span
                      aria-hidden
                      style={{
                        background: s.wrapBg.background,
                        position: "absolute",
                        inset: s.wrapBg.inset,
                        borderRadius: s.wrapBg.borderRadius,
                        zIndex: -2,
                      }}
                    />
                  ) : null}
                  {s.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Alignment */}
      <div className="mt-6">
        <p className="text-sm text-slate-600 mb-2">Alignment</p>
        <div className="inline-flex w-full max-w-xl items-center justify-between gap-2">
          {["top", "middle", "bottom"].map((pos) => {
            const active = alignment === pos;
            return (
              <button
                key={pos}
                type="button"
                onClick={() => {
                  setAlignment(pos);
                  announce({ alignment: pos });
                }}
                className={[
                  "flex-1 rounded-md border px-4 py-2 text-sm transition",
                  active
                    ? "bg-white text-slate-900 border-emerald-400 ring-2 ring-emerald-400"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white",
                ].join(" ")}
                aria-pressed={active}
              >
                {pos === "top" && "Top"}
                {pos === "middle" && "Middle"}
                {pos === "bottom" && "Bottom"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Self-contained fallback CSS for the preview effects */}
      <style jsx global>{`
        /* Each ".*-line" wrapper just passes CSS vars through */
        .heavy-shadow-text-effect-line,
        .lower-stroke-text-effect-line,
        .glow-text-effect-line,
        .wrap-text-effect-line,
        .bevel-text-effect-line,
        .subtle-shadow-text-effect-line,
        .difference-text-effect-line,
        .outline-text-effect-line,
        .outline-alternative-text-effect-line {
          --text-color: var(--text-color, #fff);
          --effect-color: var(--effect-color, #000);
          --text-effect-color: var(--text-effect-color, var(--effect-color));
        }

        /* BASIC — thick shadow so white text shows on white tiles */
        .heavy-shadow-text-effect {
          text-shadow:
            0 1px 0 rgba(0, 0, 0, 0.8),
            0 2px 2px rgba(0, 0, 0, 0.6),
            0 0 8px rgba(0, 0, 0, 0.6);
        }

        /* REVID / MOVIE / WRAPS — bottom stroke illusion */
        .lower-stroke-text-effect {
          text-shadow:
            0 1px 0 var(--text-effect-color),
            0 0 2px var(--text-effect-color);
        }

        /* HORMOZI — glow */
        .glow-text-effect {
          text-shadow:
            0 0 6px var(--effect-color),
            0 0 12px var(--effect-color),
            0 0 18px var(--effect-color);
        }

        /* OPACITY — light outline with darker wrap effect color */
        .wrap-text-effect {
          text-shadow:
            0 0 2px var(--effect-color),
            0 0 6px var(--effect-color);
        }

        /* FACELESS — subtle bevel via dual shadows */
        .bevel-text-effect {
          text-shadow:
            0 1px 0 rgba(255, 255, 255, 0.7),
            0 -1px 0 rgba(0, 0, 0, 0.25);
        }

        /* ELEGANT — small shadow */
        .subtle-shadow-text-effect {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }

        /* DIFFERENCE — strong white on dark tile already handled by tile bg */

        /* OUTLINE styles */
        .outline-text-effect {
          -webkit-text-stroke: 1px var(--effect-color);
          text-shadow: 0 0 1px var(--effect-color);
        }
        .outline-alternative-text-effect {
          -webkit-text-stroke: 1px var(--effect-color);
          text-shadow: 0 0 2px var(--effect-color);
        }
      `}</style>
    </section>
  );
}
