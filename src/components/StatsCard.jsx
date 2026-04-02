function StatsCard({ label, value, tone }) {
  const toneClass = {
    total: "text-cyan-300",
    free: "text-emerald-400",
    occupied: "text-rose-400"
  };

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-glass">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${toneClass[tone] || "text-slate-100"}`}>{value}</p>
    </article>
  );
}

export default StatsCard;
