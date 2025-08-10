// pages/video/[id].js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white ${className}`}>
      {title && (
        <header className="px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function VideoPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // { status, url, thumbnail, ... }
  const [ytConnected, setYtConnected] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  // Works with BOTH:
  // 1) your /api/status flattened shape
  // 2) raw Shotstack { response: { ... } } shape
  const normalizeStatus = (data) => {
    if (!data) return null;

    // If it's your backend's flattened shape:
    if (typeof data.status === "string" && ("url" in data || "progress" in data)) {
      return {
        status: data.status,
        url: data.url || null,
        thumbnail: data.thumbnail || data.poster || null,
        duration: data.duration,
        message: data.message || "",
        progress: typeof data.progress === "number" ? data.progress : 0,
        error: data.error || null,
      };
    }

    // Fallback for Shotstack raw:
    const r = data.response ?? {};
    return {
      status: r.status,
      url: r.url || null,
      thumbnail: r.poster || r.thumbnail || null,
      duration: r.duration,
      message: r.message || "",
      progress: typeof r.progress === "number" ? r.progress : 0,
      error: r.error || null,
    };
  };

  // Poll your backend /api/status
  useEffect(() => {
    if (!id) return;
    let alive = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/status?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;

        const normalized = normalizeStatus(data);
        setStatus(normalized);
        setLoading(false);

        if (normalized?.status !== "done" && normalized?.status !== "failed") {
          setTimeout(poll, 4000);
        }
      } catch (e) {
        console.error(e);
        if (alive) setTimeout(poll, 5000);
      }
    };

    poll();
    return () => {
      alive = false;
    };
  }, [id]);

  // Check YT connection
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/youtube/status", { cache: "no-store" });
        const j = await res.json();
        setYtConnected(Boolean(j?.connected));
      } catch {
        setYtConnected(false);
      }
    };
    run();
  }, []);

  const defaultTitle = useMemo(() => `Rendered video ${id}`, [id]);

  const connectYouTube = () => {
    const returnTo = `/video/${encodeURIComponent(id)}`;
    window.location.href = `/api/youtube/auth?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const publishToYouTube = async (e) => {
    e.preventDefault();
    if (!status?.url) return;
    setPublishing(true);
    setPublishMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      videoUrl: status.url,
      title: fd.get("title") || defaultTitle,
      description: fd.get("description") || "",
      privacyStatus: fd.get("privacyStatus") || "unlisted",
    };

    try {
      const res = await fetch("/api/youtube/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setPublishMsg(`Published! YouTube URL: https://youtu.be/${data.videoId}`);
    } catch (err) {
      setPublishMsg(err.message || "Upload failed");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-sm text-slate-600 hover:text-slate-800">
            &larr; Back
          </button>
          <h1 className="text-base font-semibold text-slate-800">Your Rendered Video</h1>
          <div />
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Preview">
            {loading && <p className="text-sm text-slate-600">Loading status…</p>}

            {!loading && status?.status === "failed" && (
              <p className="text-sm text-red-600">Render failed. Please try again.</p>
            )}

            {!loading && status?.status === "done" && status?.url && (
              <video
                key={status.url}                  // reloads if signed URL refreshes
                src={status.url}
                poster={status.thumbnail || undefined}
                controls
                autoPlay
                muted                             // prevents autoplay blocking
                className="w-full rounded-lg outline-none bg-black"
              />
            )}

            {!loading && status?.message && (
              <p className="mt-2 text-xs text-slate-600">{status.message}</p>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Card title="Publish">
            {!status?.url ? (
              <p className="text-sm text-slate-600">Video not ready yet.</p>
            ) : (
              <>
                {!ytConnected ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-700">Connect your YouTube account to publish with one click.</p>
                    <button
                      onClick={connectYouTube}
                      className="rounded-md bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700"
                    >
                      Connect YouTube
                    </button>
                  </div>
                ) : (
                  <form onSubmit={publishToYouTube} className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Title</label>
                      <input
                        name="title"
                        defaultValue={defaultTitle}
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        placeholder="Optional description…"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Visibility</label>
                      <select
                        name="privacyStatus"
                        defaultValue="unlisted"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={publishing}
                      className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {publishing ? "Publishing…" : "Publish to YouTube"}
                    </button>

                    {publishMsg && (
                      <p className={`text-xs mt-2 ${publishMsg.startsWith("Published!") ? "text-green-700" : "text-red-600"}`}>
                        {publishMsg}
                      </p>
                    )}
                  </form>
                )}
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
