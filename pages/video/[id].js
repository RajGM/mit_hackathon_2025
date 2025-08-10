// pages/video/[id].js
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

function Card({ title, children, className = "" }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white ${className}`}>
      {title && <header className="px-4 py-3 border-b border-slate-200"><h3 className="text-sm font-semibold text-slate-800">{title}</h3></header>}
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function VideoPage() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // { status, url, thumbnail, duration, ... }
  const [ytConnected, setYtConnected] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  // fetch render status (in case user arrived before it finished)
  useEffect(() => {
    if (!id) return;
    let alive = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/status?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;

        setStatus(data);
        setLoading(false);

        if (data.status !== "done" && data.status !== "failed") {
          setTimeout(poll, 4000);
        }
      } catch (e) {
        console.error(e);
        if (alive) setTimeout(poll, 5000);
      }
    };
    poll();

    return () => { alive = false; };
  }, [id]);

  // check YT connection
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/youtube/status", { cache: "no-store" });
        const j = await res.json();
        setYtConnected(Boolean(j?.connected));
      } catch {}
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
          <button onClick={() => router.push("/")} className="text-sm text-slate-600 hover:text-slate-800">&larr; Back</button>
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
                src={status.url}
                poster={status.thumbnail || undefined}
                controls
                autoPlay
                className="w-full rounded-lg outline-none bg-black"
              />
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
                    <p className="text-sm text-slate-700">
                      Connect your YouTube account to publish with one click.
                    </p>
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
                      <p className="text-xs mt-2 {publishMsg.startsWith('Published!') ? 'text-green-700' : 'text-red-600'}">
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
