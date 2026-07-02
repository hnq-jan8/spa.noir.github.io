"use client";

import ArticleContent from "@/components/ui/ArticleContent";
import { useContentData } from "@/hooks/useContentData";

export default function PressReleasesContent() {
  const data = useContentData();

  if (!data || !data.pressReleases.pressRelease) return null;

  const { title, body } = data.pressReleases.pressRelease;
  if (!body && !title) return null;

  return (
    <div className="container-page pt-4 pb-8 md:py-8">
      <div className="md:bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-sm md:p-8">
        <ArticleContent title={title} body={body} />
      </div>
    </div>
  );
}
