/**
 * Conductor logo – ML Training Orchestration Platform.
 * Conductor baton (leading line) + workflow nodes (orchestration / pipeline).
 */
export const Logo = ({ className = 'h-8 w-8 text-primary-600' }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    {/* Conductor baton */}
    <path d="M6 2v28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="6" cy="2" r="2" fill="currentColor" />
    {/* Orchestration nodes (training pipeline) */}
    <circle cx="22" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="22" cy="16" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="22" cy="24" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Flow from conductor to nodes */}
    <path
      d="M9 6 L19 8 M9 16 L19 16 M9 26 L19 24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
