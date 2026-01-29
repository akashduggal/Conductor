import { Logo } from './Logo';

export const Header = () => {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-2">
      <div className="flex items-center gap-3">
        <Logo className="h-7 w-7 text-primary-400" />
        <div>
          <h1 className="text-xl font-bold text-zinc-100 leading-tight">Conductor</h1>
          <p className="text-xs text-zinc-500 leading-tight">ML Training Orchestration Platform</p>
        </div>
      </div>
    </header>
  );
};
