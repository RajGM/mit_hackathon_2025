// download-music.js
const fs = require("fs");
const path = require("path");

if (typeof fetch !== "function") {
  console.error("This script requires Node 18+ (fetch is not available).");
  process.exit(1);
}

const tracks = [
  { title: "Observer", url: "https://cdn.revid.ai/audio/observer.mp3" },
  { title: "upbeat electronic music with a driving beat, suitable for a fast-paced social media reel music", url: "https://cdn.revid.ai/audio/upbeat-electronic-music-with-a-driving-beat-suitable-for-a-fast-paced-social-media-reel-music.mp3" },
  { title: "A Future", url: "https://cdn.revid.ai/audio/a-future.mp3" },
  { title: "Paris - Else", url: "https://cdn.revid.ai/audio/paris-else.mp3" },
  { title: "Cartoon", url: "https://cdn.revid.ai/audio/cartoon.mp3" },
  { title: "Burlesque", url: "https://cdn.revid.ai/audio/burlesque.mp3" },
  { title: "Snowfall", url: "https://cdn.revid.ai/audio/snowfall.mp3" },
  { title: "Bladerunner Remix", url: "https://cdn.revid.ai/audio/bladerunner-remix.mp3" },
  { title: "Izzamuzzic", url: "https://cdn.revid.ai/audio/izzamuzzic.mp3" },
  { title: "Corny Candy", url: "https://cdn.revid.ai/audio/corny-candy.mp3" },
];

const outDir = path.resolve("./public/music");

function filenameFromUrl(u, fallback) {
  try {
    const last = new URL(u).pathname.split("/").pop();
    return last || fallback;
  } catch {
    return fallback;
  }
}

async function downloadOne({ title, url }) {
  const fname = filenameFromUrl(
    url,
    `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.mp3`
  );
  const outPath = path.join(outDir, fname);

  console.log(`→ Downloading: ${title} (${fname})`);
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed ${res.status} ${res.statusText} for URL: ${url}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(outPath, buf);
  console.log(`   Saved: ${outPath}`);
}

async function main() {
  await fs.promises.mkdir(outDir, { recursive: true });

  const results = await Promise.allSettled(tracks.map(downloadOne));
  const failed = results
    .map((r, i) => ({ ...r, track: tracks[i] }))
    .filter(r => r.status === "rejected");

  console.log(`\n✅ Done. Success: ${results.length - failed.length}, Failed: ${failed.length}`);

  if (failed.length) {
    console.error("\n❌ Failed Downloads:");
    failed.forEach((f, i) => {
      console.error(`${i + 1}. Title: ${f.track.title}`);
      console.error(`   URL:   ${f.track.url}`);
      console.error(`   Error: ${f.reason.message}`);
    });
    process.exitCode = 1;
  }
}

main();
