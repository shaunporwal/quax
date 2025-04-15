interface ErrorAlertProps {
  error: {
    title: string;
    message: string;
  } | null;
  onDismiss: () => void;
}

export function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onDismiss}
    >
      <div 
        className="bg-white rounded-lg shadow-lg max-w-sm mx-4 p-5" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-destructive mr-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <h3 className="font-medium text-lg">{error.title}</h3>
            <p className="text-neutral-500">{error.message}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-4 py-2 rounded transition"
            onClick={onDismiss}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
