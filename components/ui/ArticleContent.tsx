import MarkdownContent from "@/components/ui/MarkdownContent";

interface ArticleContentProps {
  title: string;
  body: string;
}

export default function ArticleContent({ title, body }: ArticleContentProps) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">{title}</h1>
      <hr className="border-gray-400 mb-6" />
      <MarkdownContent content={body} className="text-sm text-gray-700" />
    </div>
  );
}
