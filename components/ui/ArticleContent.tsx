import MarkdownContent from "@/components/ui/MarkdownContent";
import {
  ArticleBodySkeleton,
  ArticleTitleSkeleton,
} from "@/components/ui/skeletons/ArticleDetailSkeleton";
import Reveal from "./Reveal";

interface ArticleContentProps {
  /** `null` cả hai khi bài chưa về — mỗi <Reveal> tự dựng placeholder. */
  title: string | null;
  body: string | null;
}

export default function ArticleContent({ title, body }: ArticleContentProps) {
  const loading = body === null;

  // A blank or null title is how a full-bleed CMS article (its own hero
  // already carries the headline) opts out of the default title + rule —
  // showing both would just double up the heading and clash with the custom
  // design. Lúc chờ thì vẫn giữ chỗ tiêu đề: đó là dạng bài phổ biến.
  const hasTitle = loading || (!!title && title.trim().length > 0);

  return (
    <div>
      {hasTitle && (
        <Reveal>
          {loading ? (
            <ArticleTitleSkeleton />
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4 text-balance">
                {title}
              </h1>
              <hr className="border-gray-300 mb-6" />
            </>
          )}
        </Reveal>
      )}
      <Reveal delay={50}>
        {loading ? (
          <ArticleBodySkeleton />
        ) : (
          <MarkdownContent
            content={body}
            className="text-sm leading-relaxed text-gray-700"
          />
        )}
      </Reveal>
    </div>
  );
}
