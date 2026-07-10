"use client";

import EmptyState from "@/components/ui/EmptyState";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { useContentData } from "@/hooks/useContentData";

export default function FaqsContent() {
  const data = useContentData();

  if (!data) return null;

  const faqs = data.faqs.faqs;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 md:py-8">
      {faqs.length === 0 ? (
        <EmptyState data={data} />
      ) : (
        <FaqAccordion items={faqs} />
      )}
    </div>
  );
}
