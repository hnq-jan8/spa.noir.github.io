"use client";

import ArticleContent from "@/components/ui/ArticleContent";
import EmptyState from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import { useContentData } from "@/hooks/useContentData";

export default function PressReleasesContent() {
  const data = useContentData();

  if (!data) return null;

  const pressRelease = data.pressReleases.pressRelease;
  const isEmpty = !pressRelease || (!pressRelease.body && !pressRelease.title);

  if (isEmpty) {
    const es = data.common.labels["emptyState"];
    return (
      <div className="container-page pt-4 pb-8 md:py-8">
        <EmptyState title={es?.["title"]} description={es?.["description"]} />
      </div>
    );
  }

  const { title, body } = pressRelease;

  return (
    <div className="container-page pt-4 pb-8 md:py-8">
      <Reveal className="md:bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-sm md:p-8">
        <ArticleContent title={title} body={body} />
      </Reveal>
    </div>
  );
}
