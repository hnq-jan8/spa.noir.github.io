import { Inbox } from "lucide-react";
import type { ContentData } from "@/lib/contentData";
import Reveal from "./Reveal";

export default function EmptyState({ data }: { data: ContentData }) {
  const es = data.common.labels["emptyState"];
  const title = es?.["title"];
  const description = es?.["description"];

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 px-4">
      <Reveal className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-4">
        <Inbox className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
      </Reveal>
      <Reveal delay={50}>
        {title && (
          <p className="text-base font-semibold text-gray-900">{title}</p>
        )}
        {description && (
          <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
        )}
      </Reveal>
    </div>
  );
}
