type ButtonSpinnerProps = Readonly<{
  inverse?: boolean;
  className?: string;
}>;

export function ButtonSpinner({
  inverse = false,
  className = "",
}: ButtonSpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-solid ${
        inverse
          ? "border-white/30 border-t-white"
          : "border-slate-300 border-t-slate-900"
      } ${className}`.trim()}
    />
  );
}
