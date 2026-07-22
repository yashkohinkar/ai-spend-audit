export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="AI Spend Audit"
    >
      {/* Bar chart falling into a checkmark — spend going down */}
      <path
        d="M5 22h4v5H5zM12 17h4v10h-4zM19 12h4v15h-4z"
        className="fill-primary"
        opacity="0.35"
      />
      <path
        d="M4 20l7-7 5 5 9-11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
    </svg>
  );
}
