import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, backTo, backLabel = '返回', actions }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-coffee-100 px-8 py-6">
      <div className="flex items-start justify-between">
        <div>
          {backTo && (
            <Link
              to={backTo}
              className="inline-flex items-center gap-1 text-sm text-coffee-500 hover:text-coffee-700 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Link>
          )}
          <h1 className="font-serif text-2xl font-bold text-coffee-800">{title}</h1>
          {description && (
            <p className="text-coffee-500 mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
