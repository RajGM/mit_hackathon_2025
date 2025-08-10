// pages/index.js
import { useMemo, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import PresetPicker from "../components/PresetPicker";
import AspectRatioSelector from "../components/AspectRatioSelector";
import VoiceList from "../components/VoiceList";
import MusicLibrary from "../components/MusicLibrary";
import CaptionStylePicker from "../components/CaptionStylePicker";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// simple card wrapper
function Card({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white ${className}`}>
      {(title || subtitle) && (
        <header className="px-4 py-3 border-b border-slate-200">
          {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function Home() {
  // SCRIPT (controlled so you can type)
  const [script, setScript] = useState(
    `Hi, welcome to MIT Hackathon! This is a state of the art Text to Speech model that you can use for your viral videos.`
  );
  const wordCount = useMemo(() => (script.trim() ? script.trim().split(/\s+/).length : 0), [script]);
  const estDurationSec = useMemo(() => Math.ceil(wordCount / 2.5), [wordCount]); // ~150 wpm

  // Selections coming from children
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedAspect, setSelectedAspect] = useState("1:1");
  const [selectedVoice, setSelectedVoice] = useState(null);   // e.g. { id, label, ... }
  const [selectedMusic, setSelectedMusic] = useState(null);   // e.g. { id/name, ... }
  const [captionConfig, setCaptionConfig] = useState({
    disabled: false,
    style: null,
    alignment: "bottom",
  });

  // Generate state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentJob, setCurrentJob] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);

  const handlePreset = (p) => setSelectedPreset(p);
  const handleAspect = (a) => setSelectedAspect(a);
  const handleVoice = (v) => setSelectedVoice(v);
  const handleMusic = (m) => setSelectedMusic(m);
  const handleCaption = (c) => setCaptionConfig(c);

  const monitorJobStatus = async (jobId, audioUrl) => {
    setCurrentJob(jobId);
    
    // Store initial job info including audio URL
    setJobStatus({
      status: 'submitted',
      message: 'Job submitted successfully',
      audioUrl: audioUrl
    });
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/status?id=${jobId}`);
        if (res.ok) {
          const statusData = await res.json();
          setJobStatus(statusData);
          
          // If job is complete or failed, stop monitoring
          if (statusData.status === 'done' || statusData.status === 'failed') {
            return;
          }
          
          // Continue monitoring every 5 seconds
          setTimeout(checkStatus, 5000);
        }
      } catch (error) {
        console.error('Error checking job status:', error);
      }
    };
    
    // Start monitoring
    checkStatus();
  };

  const handleGenerate = async () => {
    setSubmitting(true);
    setErrorMsg("");

    console.log(
      script,
      selectedPreset,     // whatever your PresetPicker returns
      selectedAspect,
      selectedVoice,       // e.g. { id: "alloy", label: "Alloy" }
      selectedMusic,       // e.g. { id: "observer", name: "Observer" }
      captionConfig,    // { disabled, style, alignment }
      { wordCount, estDurationSec },
    )

    try {
      const res = await fetch("/api/generate2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          preset: selectedPreset,     // whatever your PresetPicker returns
          aspectRatio: selectedAspect,
          voice: selectedVoice,       // e.g. { id: "alloy", label: "Alloy" }
          music: selectedMusic,       // e.g. { id: "observer", name: "Observer" }
          captions: captionConfig,    // { disabled, style, alignment }
          stats: { wordCount, estDurationSec },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || "Failed to generate"}`);
      }
      const data = await res.json();
      console.log("Generation submitted:", data);
      
      if (data.success && data.shotstackId) {
        // Show success message and start monitoring status
        setErrorMsg(""); // Clear any previous errors
        // You can add toast notification here using react-hot-toast
        // toast.success("Video generation started! Check status below.");
        
        // Start monitoring the job status
        monitorJobStatus(data.shotstackId, data.audioUrl);
      } else {
        throw new Error(data.error || "Failed to submit generation job");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen bg-slate-50`}>
      {/* Top bar */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-semibold text-slate-800">Script to Video</h1>
          <div className="flex items-center gap-2">
            <button className="rounded-md border px-3 py-1.5 text-sm bg-white hover:bg-slate-50">Rewrite</button>
            <button className="rounded-md bg-slate-900 text-white px-3 py-1.5 text-sm hover:bg-slate-800">
              Script Generator
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="mx-auto max-w-7xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT column */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Your Video Narrator Script">
            <textarea
              className="w-full min-h-[160px] rounded-md border border-slate-300 bg-transparent
               text-black placeholder-slate-500 p-3 text-sm leading-relaxed
               caret-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
               selection:bg-emerald-100 selection:text-black"
              placeholder={`Enter your script exactly as you want it spoken...\nUse <break time="1.0s" /> for pauses.`}
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-600">Number of words: {wordCount}</span>
              <span className="text-xs text-slate-600">Estimated video duration: {estDurationSec}s</span>
            </div>
          </Card>



          <Card title="Choose a generation preset">
            <PresetPicker onSelect={handlePreset} />
          </Card>

          <Card title="Select audio or Generate Music">
            <MusicLibrary onSelect={handleMusic} />
          </Card>

          <Card title="Captions">
            <CaptionStylePicker onChange={handleCaption} />
          </Card>

          <Card title="Select Voice or Record Yourself">
            <div className="space-y-3">
              <VoiceList onSelect={handleVoice} />
              {/* Generate button lives directly under Voices */}
              <div className="flex items-center justify-end gap-3 pt-1">
                {errorMsg ? <p className="text-xs text-red-600">{errorMsg}</p> : null}
                <button
                  onClick={handleGenerate}
                  disabled={submitting || !script.trim()}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>Generate video</>
                  )}
                </button>
              </div>
            </div>
          </Card>

        </div>

        {/* RIGHT sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <Card title="" className="sticky top-4">
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-800">Aspect Ratio</h4>
                </div>
                <AspectRatioSelector onSelect={handleAspect} />
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Job Status Section */}
      {currentJob && jobStatus && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg border border-slate-200 shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Video Generation Status</h3>
            <button 
              onClick={() => setCurrentJob(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Status:</span>
              <span className={`font-medium ${
                jobStatus.status === 'done' ? 'text-green-600' : 
                jobStatus.status === 'failed' ? 'text-red-600' : 
                'text-blue-600'
              }`}>
                {jobStatus.status}
              </span>
            </div>
            
            {jobStatus.progress > 0 && (
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${jobStatus.progress}%` }}
                ></div>
              </div>
            )}
            
            {jobStatus.message && (
              <p className="text-xs text-slate-600">{jobStatus.message}</p>
            )}
            
            {jobStatus.audioUrl && (
              <div className="text-xs">
                <span className="text-slate-600">Audio:</span>
                <a 
                  href={jobStatus.audioUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 ml-1 underline"
                >
                  View Audio
                </a>
              </div>
            )}
            
            {jobStatus.url && jobStatus.status === 'done' && (
              <a 
                href={jobStatus.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-600 text-white text-xs py-2 px-3 rounded-md hover:bg-green-700 transition-colors"
              >
                Download Video
              </a>
            )}
            
            {jobStatus.error && (
              <p className="text-xs text-red-600">{jobStatus.error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
