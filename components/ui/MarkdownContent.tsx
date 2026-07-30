import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MarkdownImage from "./MarkdownImage";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// Defined once at module scope, not inline in the JSX below. React identifies a
// component by the function itself, so rebuilding this map on every render
// would hand React a brand new type for every tag each time and make it throw
// the rendered markdown away and mount it again from scratch — discarding the
// children's state with it, which MarkdownImage relies on to remember that a
// load already failed. None of these close over props, so there is nothing to
// rebuild per render anyway. Same reasoning for the plugin arrays.
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

const COMPONENTS: Components = {
  h1: ({ children }) => <h2 className="text-xl font-bold mt-6 mb-2">{children}</h2>,
  h2: ({ children }) => <h3 className="text-lg font-bold mt-6 mb-2">{children}</h3>,
  h3: ({ children }) => (
    <h4 className="text-base font-bold mt-4 mb-2">{children}</h4>
  ),
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:text-gray-900 active:text-gray-900"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-gray-300 pl-4 italic text-gray-600">
      {children}
    </blockquote>
  ),
  img: ({ src, alt, width, height, style }) => (
    <MarkdownImage
      src={typeof src === "string" ? src : undefined}
      alt={alt}
      width={width}
      height={height}
      style={style}
    />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="border-collapse border border-gray-300">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="border border-gray-300 px-3 py-2 text-left font-bold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-3 py-2">{children}</td>
  ),
};

export default function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  return (
    <div
      className={`space-y-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
