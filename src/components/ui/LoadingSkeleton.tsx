export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 rounded w-1/5"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200"></div>
      <div className="p-4">
        <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-slate-200 rounded w-full"></div>
      </div>
    </div>
  );
}

