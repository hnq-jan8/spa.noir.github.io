import MarkdownContent from "@/components/ui/MarkdownContent";
import Reveal from "./Reveal";

interface ArticleContentProps {
  title: string;
  body: string;
}

export default function ArticleContent({ title, body }: ArticleContentProps) {
  return (
    <div>
      <Reveal>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
          {title}
        </h1>
        <hr className="border-gray-300 mb-6" />
      </Reveal>
      <Reveal delay={50}>
        <MarkdownContent content={body} className="text-sm text-gray-700" />
      </Reveal>
    </div>
  );
}
