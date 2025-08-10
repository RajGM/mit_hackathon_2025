// Next.js API route for video generation using Shotstack API (Correct Format)
const Shotstack = require('shotstack-sdk');
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Initialize Shotstack client using official SDK
const defaultClient = Shotstack.ApiClient.instance;
defaultClient.basePath = process.env.SHOTSTACK_HOST || 'https://api.shotstack.io/edit/stage';

const DeveloperKey = defaultClient.authentications['DeveloperKey'];
DeveloperKey.apiKey = process.env.SHOTSTACK_API_KEY;

const api = new Shotstack.EditApi();

// OpenAI configuration
const openaiApiKey = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  // Only allow POST requests
  console.log('Received request:', req.method, req.body);

  return res.status(405).json({ error: 'Method not allowed. Use POST.' });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const {
      script,
      preset,
      aspectRatio,
      voice,
      music,
      captions,
      stats
    } = req.body;

    // Validate required fields
    if (!script || !script.trim()) {
      return res.status(400).json({ error: 'Script is required' });
    }

    if (!voice || !voice.id) {
      return res.status(400).json({ error: 'Voice selection is required' });
    }

    if (!aspectRatio) {
      return res.status(400).json({ error: 'Aspect ratio is required' });
    }

    // Log the received data for debugging
    console.log('Received generation request:', {
      script: script.substring(0, 100) + (script.length > 100 ? '...' : ''),
      preset,
      aspectRatio,
      voice,
      music,
      captions,
      stats
    });

    // Step 1: Generate TTS audio using OpenAI
    let audioBuffer;
    try {
      const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: script,
          voice: voice.id,
          response_format: 'mp3',
          speed: 1.0
        })
      });

      if (!ttsResponse.ok) {
        throw new Error(`OpenAI TTS failed: ${ttsResponse.status}`);
      }

      // Get the audio as a buffer
      audioBuffer = await ttsResponse.arrayBuffer();
      console.log('TTS audio generated successfully');
    } catch (error) {
      console.error('TTS generation failed:', error);
      return res.status(500).json({ error: 'Failed to generate TTS audio' });
    }

    // Step 2: Upload audio to Firebase Storage
    let audioUrl = "https://firebasestorage.googleapis.com/v0/b/foss-mentoring.appspot.com/o/audio%2Ftts-audio-1754814216281-qrrju6d6b.mp3?alt=media&token=f064c1a4-0379-4702-8a8b-f9e859478452";

    /*
    try {
      const timestamp = Date.now();
      const audioFileName = `tts-audio-${timestamp}-${Math.random().toString(36).substr(2, 9)}.mp3`;
      const audioRef = ref(storage, `audio/${audioFileName}`);
      
      // Upload the audio buffer to Firebase Storage
      await uploadBytes(audioRef, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: 'public, max-age=3600'
      });
      
      // Get the download URL
      audioUrl = await getDownloadURL(audioRef);
      console.log('Audio uploaded to Firebase Storage:', audioUrl);
    } catch (error) {
      console.error('Firebase Storage upload failed:', error);
      return res.status(500).json({ error: 'Failed to upload audio to storage' });
    }
*/
    // Step 3: Create video composition using correct Shotstack format
    const videoComposition = createVideoComposition({
      script,
      audioUrl,
      aspectRatio,
      music,
      captions,
      stats
    });

    // Step 4: Submit render job to Shotstack
    let renderResponse;
    try {
      renderResponse = await api.postRender(videoComposition);
      console.log('Shotstack render job submitted:', renderResponse);
    } catch (error) {
      console.error('Shotstack render failed:', error);
      return res.status(500).json({ error: 'Failed to submit video render job' });
    }

    const response = {
      success: true,
      message: 'Video generation submitted successfully',
      jobId: renderResponse.response.id,
      estimatedDuration: stats?.estDurationSec || 0,
      wordCount: stats?.wordCount || 0,
      shotstackId: renderResponse.response.id,
      status: 'submitted',
      audioUrl: audioUrl, // Return the uploaded audio URL for reference
      requestDetails: {
        scriptLength: script.length,
        aspectRatio,
        voice: voice.label || voice.id,
        music: music ? music.name || music.id : 'None',
        captions: captions?.disabled ? 'Disabled' : `Enabled (${captions?.style || 'Default'})`,
        preset: preset || 'Custom'
      }
    };

    console.log('Response:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error in generate API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Helper function to create video composition using correct Shotstack format
function createVideoComposition({ script, audioUrl, aspectRatio, music, captions, stats }) {
  // Calculate dimensions based on aspect ratio
  const dimensions = getDimensionsFromAspectRatio(aspectRatio);

  // Create timeline tracks
  const tracks = [];

  // Background track (solid color)
  const backgroundTrack = {
    clips: [
      {
        asset: {
          type: "color",
          color: "#000000"
        },
        start: 0,
        length: stats?.estDurationSec || 10
      }
    ]
  };
  tracks.push(backgroundTrack);

  // Audio track (TTS) - using text-to-speech asset type
  if (script) {
    const audioTrack = {
      clips: [
        {
          asset: {
            type: "text-to-speech",
            text: script,
            voice: "Joanna" // Default voice, can be customized based on user selection
          },
          start: 0,
          length: "auto"
        }
      ]
    };
    tracks.push(audioTrack);
  }

  // Music track (if selected)
  if (music && music.id) {
    const musicTrack = {
      clips: [
        {
          asset: {
            type: "audio",
            src: `/music/${music.id}.mp3`
          },
          start: 0,
          length: stats?.estDurationSec || 10,
          volume: 0.3 // Lower volume for background music
        }
      ]
    };
    tracks.push(musicTrack);
  }

  // Captions track using Shotstack's caption asset type
  if (captions && !captions.disabled) {
    const captionTrack = {
      clips: [
        {
          asset: {
            type: "caption",
            src: "alias://voiceover", // Reference to the TTS audio
            font: {
              color: "#ffffff",
              family: "Montserrat ExtraBold",
              size: 30,
              lineHeight: 0.8
            },
            margin: {
              top: 0.25
            }
          },
          start: 0,
          length: "end"
        }
      ]
    };
    tracks.push(captionTrack);
  }

  // Create the composition object in the correct Shotstack format
  const composition = {
    timeline: {
      tracks: tracks
    },
    output: {
      format: "mp4",
      size: {
        width: dimensions.width,
        height: dimensions.height
      }
    }
  };

  return composition;
}

// Helper function to get video dimensions from aspect ratio
function getDimensionsFromAspectRatio(aspectRatio) {
  switch (aspectRatio) {
    case '1:1':
      return { width: 1080, height: 1080 };
    case '16:9':
      return { width: 1280, height: 720 };
    case '9:16':
      return { width: 720, height: 1280 };
    case '4:3':
      return { width: 1280, height: 960 };
    case '3:4':
      return { width: 960, height: 1280 };
    default:
      return { width: 1280, height: 720 };
  }
}
