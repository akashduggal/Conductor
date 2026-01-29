export const Header = () => {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 h-14 px-6 flex items-center">
      <div className="flex items-baseline gap-2 flex-wrap min-w-0">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Conductor</h1>
        <span className="text-zinc-600" aria-hidden>
          ·
        </span>
        <span className="text-sm text-zinc-500 truncate">
          ML Training Orchestration Platform
        </span>
      </div>
    </header>
  );
};
