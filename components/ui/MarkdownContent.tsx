import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MarkdownImage from "./MarkdownImage";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

// Module scope, not inline: React keys components by identity, so rebuilding
// this map per render would remount all the rendered markdown and discard
// MarkdownImage's memory of a failed load. Same for the plugin arrays.
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw];

// Directus's editor reformats saved HTML (one attribute per line, indented
// nesting), which trips two CommonMark rules: a blank line inside a tag's
// attributes ends its HTML block early, and 4+ leading spaces read as a code
// block. Collapsing in-tag whitespace and dedenting fixes both; fenced code
// blocks are skipped so real samples aren't reflowed.
function normalizeRawHtmlWhitespace(content: string): string {
  const segments = content.split(/(```[\s\S]*?```)/g);
  return segments
    .map((segment, i) => {
      if (i % 2 === 1) return segment;
      const dedented = segment
        .split("\n")
        .map((line) => (line.trimStart().startsWith("<") ? line.trimStart() : line))
        .join("\n");
      return dedented.replace(/<[^>]*>/g, (tag) => tag.replace(/\s+/g, " "));
    })
    .join("");
}

// Forwarding `style` lets hand-authored HTML in the CMS override these
// defaults instead of having its inline styles dropped.
const COMPONENTS: Components = {
  h1: ({ children, style }) => (
    <h2 className="text-xl font-bold mt-6 mb-2" style={style}>
      {children}
    </h2>
  ),
  h2: ({ children, style }) => (
    <h3 className="text-lg font-bold mt-6 mb-2" style={style}>
      {children}
    </h3>
  ),
  h3: ({ children, style }) => (
    <h4 className="text-base font-bold mt-4 mb-2" style={style}>
      {children}
    </h4>
  ),
  p: ({ children, style }) => (
    <p className="leading-relaxed" style={style}>
      {children}
    </p>
  ),
  a: ({ href, children, style }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 hover:text-gray-900 active:text-gray-900"
      style={style}
    >
      {children}
    </a>
  ),
  ul: ({ children, style }) => (
    <ul className="list-disc pl-5 space-y-1" style={style}>
      {children}
    </ul>
  ),
  ol: ({ children, style }) => (
    <ol className="list-decimal pl-5 space-y-1" style={style}>
      {children}
    </ol>
  ),
  blockquote: ({ children, style }) => (
    <blockquote
      className="rounded-r-lg border-l-4 border-gray-300 bg-gray-50 px-4 py-3 italic text-gray-600"
      style={style}
    >
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
  table: ({ children, style }) => (
    <div className="inline-block max-w-full overflow-x-auto rounded-xl border border-gray-200 bg-white [&_tr:last-child>td]:border-b-0">
      <table className="border-collapse" style={style}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, style }) => <thead style={style}>{children}</thead>,
  tr: ({ children, style }) => <tr style={style}>{children}</tr>,
  th: ({ children, style }) => (
    <th
      className="border-b border-r border-gray-200 bg-gray-50 px-3 py-2 text-left font-bold last:border-r-0"
      style={style}
    >
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td
      className="border-b border-r border-gray-100 px-3 py-2 last:border-r-0"
      style={style}
    >
      {children}
    </td>
  ),
  pre: ({ children, style }) => (
    <pre
      className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0"
      style={style}
    >
      {children}
    </pre>
  ),
  code: ({ children, style }) => (
    <code
      className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.85em] font-mono"
      style={style}
    >
      {children}
    </code>
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
        {normalizeRawHtmlWhitespace(content)}
      </ReactMarkdown>
    </div>
  );
}
