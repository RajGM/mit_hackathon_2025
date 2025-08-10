import { useState } from "react";

const presets = [
  { name: "Default", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FDEFAULT.webp&w=360&q=75" },
  { name: "Ghibli Studio", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FGHIBLI.webp&w=360&q=75" },
  { name: "Educational", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FR_TECHNICAL_DRAWING.webp&w=360&q=75" },
  { name: "Pixar", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FPIXAR.webp&w=360&q=75" },
  { name: "Anime", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FANIME.webp&w=360&q=75" },
  { name: "Realist", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FREALISM.webp&w=360&q=75" },
  { name: "Flat Animation", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FFLAT_ANIMATION.webp&w=360&q=75" },
  { name: "Sketch Color", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FSKETCH_COLOR.webp&w=360&q=75" },
  { name: "Sketch B&W", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FSKETCH_BW.webp&w=360&q=75" },
  { name: "Ultra Realism", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FULTRA_REALISM.webp&w=360&q=75" },
  { name: "Japanese Ink", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FINK.webp&w=360&q=75" },
  { name: "3D Render", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FRENDER_3D.webp&w=360&q=75" },
  { name: "Lego", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FLEGO.webp&w=360&q=75" },
  { name: "Sci-Fi", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FSCIFI.webp&w=360&q=75" },
  { name: "Retro Cartoon", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FRECRO_CARTOON.webp&w=360&q=75" },
  { name: "Pixel Art", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FPIXEL_ART.webp&w=360&q=75" },
  { name: "Anime Realism", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FANIME_SR.webp&w=360&q=75" },
  { name: "Fantasy", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FFANTASY.webp&w=360&q=75" },
  { name: "Movie", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FMOVIE.webp&w=360&q=75" },
  { name: "Stylized Illustration", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FSTYLIZED_ILLUSTRATION.webp&w=360&q=75" },
  { name: "Manga", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FMANGA.webp&w=360&q=75" },
  { name: "Technical Drawing", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FR_TECHNICAL_DRAWING_RECRAFT.webp&w=360&q=75" },
  { name: "Creative", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FCREATIVE.webp&w=360&q=75" },
  { name: "Photography", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FPHOTOGRAPHY.webp&w=360&q=75" },
  { name: "Raytraced", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FRAYTRACED.webp&w=360&q=75" },
  { name: "Environment", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FENVIRONMENT.webp&w=360&q=75" },
  { name: "Illustration", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FILLUSTRATION.webp&w=360&q=75" },
  { name: "Alternative 2", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FALTERNATIVE_2.webp&w=360&q=75" },
  { name: "Spider", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FSPIDER.webp&w=360&q=75" },
  { name: "Kids Book", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FCHILDRENS_BOOK_ILLUSTRATIONS.webp&w=360&q=75" },
  { name: "Nintendo", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FNINTENDO.webp&w=360&q=75" },
  { name: "Minecraft", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FMINECRAFT.webp&w=360&q=75" },
  { name: "New Yorker Cartoon", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FNEW_YORKER.webp&w=360&q=75" },
  { name: "1950s Advertisement", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2F1950S_ADVERTISEMENT.webp&w=360&q=75" },
  { name: "Renaissance Fresco", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FRENAISSANCE_FRESCO.webp&w=360&q=75" },
  { name: "Modern Noir", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FMODERN_NOIR_MINIMALISM.webp&w=360&q=75" },
  { name: "Expressive Ink", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FEXPRESSIVE_INK_MINIMALISM.webp&w=360&q=75" },
  { name: "Cosmic Baroque", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FGILDED_COSMIC_BAROQUE.webp&w=360&q=75" },
  { name: "Epic Lineburst", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FEPIC_LINEBURST.webp&w=360&q=75" },
  { name: "Haunted Linework", img: "https://www.revid.ai/_next/image?url=%2Fpresets%2FHAUNTED_LINEWORK.webp&w=360&q=75" }
];

export default function PresetPicker({ onSelect }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (preset) => {
    setSelected(preset);
    onSelect?.(preset);
  };

  return (
    <div className="w-full">
      {/* Scrollable container */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => handleSelect(p)}
            className={`flex-shrink-0 w-36 rounded-lg overflow-hidden border-2 transition 
              ${selected?.name === p.name ? "border-blue-500" : "border-transparent"}`}
          >
            <img src={p.img} alt={p.name} className="w-full h-36 object-cover" />
            <div className="text-center text-sm py-1">{p.name}</div>
          </button>
        ))}
      </div>

      {/* Selected info */}
      {selected && (
        <div className="mt-3 text-sm">
          Selected: <span className="font-semibold">{selected.name}</span>
        </div>
      )}
    </div>
  );
}
