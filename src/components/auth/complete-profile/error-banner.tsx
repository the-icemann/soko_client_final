/** Dismissible error banner — shows a retry link on session expiry */

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="rounded-[10px] bg-destructive/10 border border-destructive/20 px-4 py-3 mb-4">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm text-destructive underline underline-offset-2 mt-1 hover:opacity-80 transition-opacity"
        >
          Sign in with Google again →
        </button>
      )}
    </div>
  );
}
