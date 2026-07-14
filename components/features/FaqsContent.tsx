"use client";

import EmptyState from "@/components/ui/EmptyState";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { useContentData } from "@/hooks/useContentData";
import Reveal from "../ui/Reveal";

export default function FaqsContent() {
  const data = useContentData();

  if (!data) return null;

  const faqs = data.faqs.faqs;

  if (faqs.length === 0) {
    return (
      <div className="container-page pt-4 pb-8 md:py-8">
        <EmptyState data={data} />
      </div>
    );
  }

  return (
    <div className="container-page pt-4 pb-8 md:py-8">
      <Reveal>
        <FaqAccordion items={faqs} />
      </Reveal>
    </div>
  );
}
