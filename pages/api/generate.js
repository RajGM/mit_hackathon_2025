// Next.js API route for video generation using Shotstack API
const Shotstack = require('shotstack-sdk');
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Initialize Shotstack client using official SDK
const defaultClient = Shotstack.ApiClient.instance;
defaultClient.basePath = process.env.SHOTSTACK_HOST || 'https://api.shotstack.io/stage';

const DeveloperKey = defaultClient.authentications['DeveloperKey'];
DeveloperKey.apiKey = process.env.SHOTSTACK_API_KEY;

const api = new Shotstack.EditApi();

// OpenAI configuration
const openaiApiKey = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  // Only allow POST requests
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
    let audioUrl;
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

    // Step 3: Create video composition using Shotstack SDK
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

// Helper function to create video composition using Shotstack SDK classes
function createVideoComposition({ script, audioUrl, aspectRatio, music, captions, stats }) {
  // Calculate dimensions based on aspect ratio
  const dimensions = getDimensionsFromAspectRatio(aspectRatio);
  
  // Create timeline tracks
  const tracks = [];
  
  // Background track
  const backgroundClip = new Shotstack.Clip();
  backgroundClip.setAsset(new Shotstack.ColorAsset().setColor('#000000'));
  backgroundClip.setStart(0);
  backgroundClip.setLength(stats?.estDurationSec || 10);
  
  const backgroundTrack = new Shotstack.Track();
  backgroundTrack.setClips([backgroundClip]);
  tracks.push(backgroundTrack);

  // Audio track (TTS)
  if (audioUrl) {
    const audioClip = new Shotstack.Clip();
    audioClip.setAsset(new Shotstack.AudioAsset().setSrc(audioUrl));
    audioClip.setStart(0);
    audioClip.setLength(stats?.estDurationSec || 10);
    
    const audioTrack = new Shotstack.Track();
    audioTrack.setClips([audioClip]);
    tracks.push(audioTrack);
  }

  // Music track (if selected)
  if (music && music.id) {
    const musicClip = new Shotstack.Clip();
    musicClip.setAsset(new Shotstack.AudioAsset().setSrc(`/music/${music.id}.mp3`));
    musicClip.setStart(0);
    musicClip.setLength(stats?.estDurationSec || 10);
    musicClip.setVolume(0.3); // Lower volume for background music
    
    const musicTrack = new Shotstack.Track();
    musicTrack.setClips([musicClip]);
    tracks.push(musicTrack);
  }

  // Captions track using Shotstack's built-in caption generation
  if (captions && !captions.disabled) {
    const captionClip = new Shotstack.Clip();
    captionClip.setAsset(new Shotstack.TitleAsset()
      .setText(script)
      .setStyle(captions.style || 'minimal')
      .setColor('#FFFFFF')
      .setSize('large')
      .setPosition(captions.alignment === 'bottom' ? 'bottom' : 'center')
    );
    captionClip.setStart(0);
    captionClip.setLength(stats?.estDurationSec || 10);
    
    const captionTrack = new Shotstack.Track();
    captionTrack.setClips([captionClip]);
    tracks.push(captionTrack);
  }

  // Create timeline
  const timeline = new Shotstack.Timeline();
  timeline.setTracks(tracks);
  timeline.setBackground('#000000');

  // Create output
  const output = new Shotstack.Output();
  output.setFormat('mp4');
  output.setResolution(dimensions.resolution);
  output.setFps(30);

  // Create edit
  const edit = new Shotstack.Edit();
  edit.setTimeline(timeline);
  edit.setOutput(output);

  return edit;
}

// Helper function to get video dimensions from aspect ratio
function getDimensionsFromAspectRatio(aspectRatio) {
  switch (aspectRatio) {
    case '1:1':
      return { resolution: '1080x1080', width: 1080, height: 1080 };
    case '16:9':
      return { resolution: '1920x1080', width: 1920, height: 1080 };
    case '9:16':
      return { resolution: '1080x1920', width: 1080, height: 1920 };
    case '4:3':
      return { resolution: '1440x1080', width: 1440, height: 1080 };
    case '3:4':
      return { resolution: '1080x1440', width: 1080, height: 1440 };
    default:
      return { resolution: '1080x1080', width: 1080, height: 1080 };
  }
}
