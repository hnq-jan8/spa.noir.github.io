import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`space-y-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-xl font-bold mt-6 mb-2">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-lg font-bold mt-6 mb-2">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-base font-bold mt-4 mb-2">{children}</h4>
          ),
          p: ({ children }) => <p className="leading-relaxed">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gray-900"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-gray-300 pl-4 italic text-gray-600">
              {children}
            </blockquote>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={typeof src === "string" ? src : undefined}
              alt={alt ?? ""}
              className="w-full rounded object-cover"
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
