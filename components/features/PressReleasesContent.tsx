"use client";

import ArticleContent from "@/components/ui/ArticleContent";
import { useContentData } from "@/hooks/useContentData";

export default function PressReleasesContent() {
  const data = useContentData();

  if (!data || !data.pressRelease) return null;

  const { title, body, imageSrc, imageAlt } = data.pressRelease;
  if (!body && !title) return null;
  const paragraphs = body ? body.split(/\n\n+/).filter(Boolean) : [];

  return (
    <div className="container-page pt-4 pb-8 md:py-8">
      <div className="md:bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-sm md:p-8">
        <ArticleContent
          title={title}
          body={paragraphs}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
        />
      </div>
    </div>
  );
}
