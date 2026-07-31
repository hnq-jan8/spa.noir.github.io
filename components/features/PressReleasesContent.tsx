"use client";

import ArticleContent from "@/components/ui/ArticleContent";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import { useContentState } from "@/hooks/useContentData";

export default function PressReleasesContent() {
  const { data, failed } = useContentState();

  if (!data) return failed ? <ContentLoadError /> : null;

  const pressRelease = data.pressReleases.pressRelease;
  const isEmpty = !pressRelease || (!pressRelease.body && !pressRelease.title);

  if (isEmpty) {
    return (
      <div className="container-page pt-4 pb-8 md:py-8">
        <EmptyState data={data} />
      </div>
    );
  }

  const { title, body } = pressRelease;

  return (
    <div className="relative z-0 container-page pt-4 pb-8 md:py-8">
      <div
        className="md:hidden absolute -top-[126px] inset-x-0 bottom-0 bg-white -z-10 pointer-events-none"
        aria-hidden="true"
      />
      <div className="md:bg-white md:border md:border-gray-200 md:rounded-2xl md:p-8">
        <ArticleContent title={title} body={body} />
      </div>
    </div>
  );
}
