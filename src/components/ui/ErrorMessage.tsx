import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-2xl p-4 md:p-6 ${className}`} dir="rtl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm md:text-base text-red-800 font-medium mb-2">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-red-600 hover:text-red-700 underline font-medium"
            >
              المحاولة مرة أخرى
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

