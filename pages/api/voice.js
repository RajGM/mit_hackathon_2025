// voice.js
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Voices to render
const voices = [
  "alloy", "ash", "ballad", "coral", "echo",
  "fable", "nova", "onyx", "sage", "shimmer"
];

const text =
  'Hi, welcome to MIT Hackathon this is a state of the art Text to Speech model that you can use for your viral videos';

const outDir = path.resolve("./public/voices"); // adjust as needed

async function main() {
  await fs.promises.mkdir(outDir, { recursive: true });

  for (const voice of voices) {
    console.log(`→ Generating: ${voice}.mp3`);
    try {
      const mp3 = await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
        instructions:
          "Speak in a clear, energetic, welcoming tone suitable for short social videos."
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const file = path.join(outDir, `${voice}.mp3`);
      await fs.promises.writeFile(file, buffer);
      console.log(`   Saved: ${file}`);
    } catch (err) {
      console.error(`   Failed for ${voice}:`, err?.message || err);
    }
  }

  console.log("✅ Done.");
}

main();
