import { Play } from "lucide-react";

export function VideoPlaceholder() {
  return (
    <div className="surface-panel overflow-hidden p-4">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#d8c7ac_0%,#b49772_35%,#6d5846_100%)] p-8 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <p className="section-eyebrow text-white/70">Embed placeholder</p>
            <h3 className="mt-3 text-4xl text-white md:text-5xl">
              Campaign video, UGC, atau product try-on bisa ditempatkan di sini.
            </h3>
            <p className="mt-4 max-w-2xl text-white/75">
              Ruang ini disiapkan untuk video pendek yang memperkuat trust dari traffic iklan,
              terutama saat user membutuhkan visual gerak kain dan detail pemakaian.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/20 bg-black/15 p-6 backdrop-blur">
            <div className="flex aspect-video items-center justify-center rounded-[1.2rem] border border-white/15 bg-black/20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-stone-900">
                <Play className="ml-1 h-7 w-7 fill-current" />
              </div>
            </div>
            <p className="mt-4 text-sm text-white/80">
              Placeholder ini bisa diganti menjadi embed YouTube, Vimeo, atau hosted campaign
              video saat materi iklan sudah siap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
