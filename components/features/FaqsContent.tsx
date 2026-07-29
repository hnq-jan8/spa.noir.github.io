"use client";

import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { useContentState } from "@/hooks/useContentData";
import Reveal from "../ui/Reveal";

export default function FaqsContent() {
  const { data, failed } = useContentState();

  if (!data) return failed ? <ContentLoadError /> : null;

  const faqs = data.faqs.faqs;

  if (faqs.length === 0) {
    return (
      <div className="container-page pt-4 pb-8 md:py-8 max-w-3xl mx-auto">
        <EmptyState data={data} />
      </div>
    );
  }

  return (
    <div className="container-page pt-4 pb-8 md:py-8 max-w-3xl mx-auto">
      <Reveal>
        <FaqAccordion items={faqs} />
      </Reveal>
    </div>
  );
}
