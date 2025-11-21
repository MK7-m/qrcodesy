import { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, description, children, className = '' }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 ${className}`} dir="rtl">
      {(title || description) && (
        <div className="mb-4 md:mb-6">
          {title && (
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-slate-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

