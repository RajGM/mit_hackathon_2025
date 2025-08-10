import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import PresetPicker from "../components/PresetPicker";
import AspectRatioSelector from "../components/AspectRatioSelector";
import VoiceList from "../components/VoiceList";
import MusicLibrary from "../components/MusicLibrary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

const aspectRatios = [
  { label: "Square", value: "1:1" },
  { label: "Landscape", value: "16:9" },
  { label: "Portrait", value: "9:16" }
];

export default function Home() {
  const handleSelect = (preset) => {
    console.log("Selected preset:", preset);
    // send to backend here
  };


  return (
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20`}
    >
      <PresetPicker presets={presets} onSelect={handleSelect} />
      <AspectRatioSelector onSelect={handleSelect} />
      <VoiceList /> {/* expects files in /public/voices/<id>.mp3 */}
      <MusicLibrary onSelect={(track) => console.log("Selected:", track)} />

    </div>
  );
}
