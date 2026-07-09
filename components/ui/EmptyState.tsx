import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-4">
      <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4">
        <Inbox className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold text-gray-900">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      <div className="mt-6" />
    </div>
  );
}
