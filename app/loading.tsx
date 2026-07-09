export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-white/30">
          Loading...
        </p>
      </div>
    </div>
  )
}
