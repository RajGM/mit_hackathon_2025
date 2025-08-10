// pages/api/generate.js
// Calls revid.ai API v2 to render a TikTok-style video

import { storage } from '../../lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

const REVID_ENDPOINT = 'https://www.revid.ai/api/public/v2/render';
const REVID_API_KEY = process.env.REVID_API_KEY;

// Map our aspect values ("9:16") => Revid ratio ("9 / 16")
const ratioMap = (v = '9:16') => v.replace(':', ' / ');

// Keep only Revid-supported caption names
const mapCaption = (styleObj) => {
  if (!styleObj || styleObj.disabled) return null;
  // Normalize and map our internal IDs/labels to revid allowed labels
  const allowed = new Set(['Basic', 'Revid', 'Hormozi', 'Ali', 'Wrap 1', 'Wrap 2', 'Faceless']);
  const guess =
    styleObj?.label ||
    styleObj?.style?.label ||
    styleObj?.style?.id ||
    styleObj?.id ||
    'Wrap 1';

  // common aliases
  const normalized = String(guess).toLowerCase().replace(/\s+/g, '');
  const table = {
    basic: 'Basic',
    revid: 'Revid',
    hormozi: 'Hormozi',
    ali: 'Ali',
    wrap1: 'Wrap 1',
    'wrap-1': 'Wrap 1',
    wrap2: 'Wrap 2',
    'wrap-2': 'Wrap 2',
    faceless: 'Faceless',
  };
  const mapped = table[normalized] || guess;
  return allowed.has(mapped) ? mapped : 'Wrap 1';
};

// Map our preset name to a Revid generationPreset
// If your PresetPicker already uses the same names, this is mostly pass-through.
const mapPreset = (name = 'CREATIVE') => {
  const n = String(name).toUpperCase().replace(/\s+/g, '_');
  const allowed = new Set([
    'LEONARDO','ANIME','REALISM','ILLUSTRATION','SKETCH_COLOR','SKETCH_BW','PIXAR','INK',
    'RENDER_3D','LEGO','SCIFI','RECRO_CARTOON','PIXEL_ART','CREATIVE','PHOTOGRAPHY',
    'RAYTRACED','ENVIRONMENT','FANTASY','ANIME_SR','MOVIE','STYLIZED_ILLUSTRATION','MANGA','DEFAULT'
  ]);
  // quick aliases from your UI list
  const aliases = {
    'STYLIZED ILLUSTRATION': 'STYLIZED_ILLUSTRATION',
    'TECHNICAL DRAWING': 'ILLUSTRATION', // closest
    'ULTRA REALISM': 'REALISM',
    'REALIST': 'REALISM',
    'SKETCH COLOR': 'SKETCH_COLOR',
    'SKETCH B&W': 'SKETCH_BW',
    '3D RENDER': 'RENDER_3D',
    'RETRO CARTOON': 'RECRO_CARTOON',
    'PIXEL ART': 'PIXEL_ART',
    'ANIME REALISM': 'ANIME_SR',
    'STYLIZED_ILLUSTRATION': 'STYLIZED_ILLUSTRATION',
  };
  const mapped = aliases[n.replace(/_/g, ' ')] || n;
  return allowed.has(mapped) ? mapped : 'CREATIVE';
};

// Resolve public/music/<id>.mp3 -> Firebase Storage download URL for Revid
async function getMusicStorageUrl(id) {
  if (!id) return null;
  const r = ref(storage, `music/${id}.mp3`);
  try {
    return await getDownloadURL(r);
  } catch (e) {
    console.warn(`Music not found in storage for id "${id}"`);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  if (!REVID_API_KEY)
    return res.status(500).json({ error: 'Missing REVID_API_KEY env var' });

  try {
    const {
      // from your UI
      script,
      aspectRatio,           // "1:1" | "16:9" | "9:16"
      preset,                // e.g. "Pixar" (we map)
      music,                 // { id, title } (UI uses /public playback)
      captions,              // { disabled, style, label, alignment }
      hasToSearchMedia = true,
      mediaType = 'movingImage', // 'movingImage' | 'stockVideo' | 'aiVideo'
      enhanced = true,           // hasEnhancedGeneration
      generationPrompt,          // optional user prompt
      // optional control params
      resolution = '1080p',      // '1080p' | '720p'
      compression = 18,          // 9|18|33
      frameRate = 30,            // 30|60
      webhook = process.env.REVID_WEBHOOK || null,
      // optional: if you have a real ElevenLabs voice id
      revidVoiceId = null,
    } = req.body || {};

    if (!script?.trim())
      return res.status(400).json({ error: 'Script is required' });
    if (!aspectRatio)
      return res.status(400).json({ error: 'Aspect ratio is required' });

    // Resolve music to Firebase URL for the API
    const musicUrl = await getMusicStorageUrl(music?.id);

    // Build creationParams for Revid
    const creationParams = {
      inputText: script,
      flowType: 'text-to-video',
      slug: 'create-tiktok-video',
      origin: '/create',

      // Media search & generation
      hasToSearchMedia: Boolean(hasToSearchMedia),
      mediaType, // 'movingImage' recommended for your flow
      generationPreset: mapPreset(preset || 'CREATIVE'),
      hasEnhancedGeneration: Boolean(enhanced),
      ...(generationPrompt ? { generationUserPrompt: generationPrompt } : {}),

      // Voiceover – let Revid generate it (selectedVoice optional)
      hasToGenerateVoice: true,
      ...(revidVoiceId ? { selectedVoice: revidVoiceId } : {}),

      // Background music
      ...(musicUrl ? { audioUrl: musicUrl } : {}),
      ...(music?.title ? { selectedAudio: music.title } : {}), // optional, they show this in example

      // Captions
      ...(captions && !captions.disabled
        ? { captionPresetName: mapCaption(captions) }
        : {}),

      // Ratio
      ratio: ratioMap(aspectRatio),
    };

    // Top-level options
    const payload = {
      ...(webhook ? { webhook } : {}),
      creationParams,
      resolution,  // '1080p' (default) or '720p'
      compression, // 9|18|33
      frameRate,   // 30|60
    };

    // Fire request
    const resp = await fetch(REVID_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        key: REVID_API_KEY,         // revid.ai header
      },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error('Revid error:', data);
      return res.status(resp.status).json({
        error: 'Revid API error',
        status: resp.status,
        details: data,
      });
    }

    // Success — return the job info to the client
    return res.status(200).json({
      success: true,
      message: 'Revid job submitted',
      data,
      echo: {
        preset: creationParams.generationPreset,
        ratio: creationParams.ratio,
        captionPresetName: creationParams.captionPresetName || 'Disabled',
        hasToSearchMedia: creationParams.hasToSearchMedia,
        mediaType: creationParams.mediaType,
        audioUrl: creationParams.audioUrl || null,
      },
    });
  } catch (err) {
    console.error('Generate API fatal:', err);
    return res.status(500).json({ error: 'Internal server error', message: err?.message });
  }
}
