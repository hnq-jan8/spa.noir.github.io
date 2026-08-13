import MarkdownContent from "@/components/ui/MarkdownContent";
import Reveal from "./Reveal";

interface ArticleContentProps {
  title: string | null;
  body: string;
}

export default function ArticleContent({ title, body }: ArticleContentProps) {
  // A blank or null title is how a full-bleed CMS article (its own hero
  // already carries the headline) opts out of the default title + rule —
  // showing both would just double up the heading and clash with the custom
  // design.
  const hasTitle = !!title && title.trim().length > 0;

  return (
    <div>
      {hasTitle && (
        <Reveal>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4 text-balance">
            {title}
          </h1>
          <hr className="border-gray-300 mb-6" />
        </Reveal>
      )}
      <Reveal delay={50}>
        <MarkdownContent
          content={body}
          className="text-sm leading-relaxed text-gray-700"
        />
      </Reveal>
    </div>
  );
}
