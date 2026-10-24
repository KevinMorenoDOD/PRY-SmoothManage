import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import type { Components } from 'react-markdown';
import './MarkdownView.css';

const WIKI_PREFIX = '#wiki=';
const TAG_PREFIX = '#tag=';

const preprocessLine = (line: string) =>
  line
    .split(/(`+[^`]*`+)/g)
    .map((part, index) => {
      if (index % 2 === 1) return part;

      const wikiLinks: string[] = [];
      const protectedPart = part.replace(
        /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
        (_match, target: string, label?: string) => {
          const text = (label || target).trim();
          wikiLinks.push(
            `[${text}](${WIKI_PREFIX}${encodeURIComponent(target.trim())})`
          );
          return `@@SM_WIKI_${wikiLinks.length - 1}@@`;
        }
      );

      const markdownLinks: string[] = [];
      const linkedPart = protectedPart.replace(
        /(!?\[[^\]]*\]\([^)]*\))/g,
        (match) => {
          markdownLinks.push(match);
          return `@@SM_LINK_${markdownLinks.length - 1}@@`;
        }
      );

      return linkedPart
        .replace(
          /(^|\s)#([\wáéíóúñÁÉÍÓÚÑ-]+)/g,
          (_match, lead: string, tag: string) =>
            `${lead}[#${tag}](${TAG_PREFIX}${encodeURIComponent(tag)})`
        )
        .replace(/@@SM_LINK_(\d+)@@/g, (_match, index: string) => markdownLinks[Number(index)])
        .replace(/@@SM_WIKI_(\d+)@@/g, (_match, index: string) => wikiLinks[Number(index)]);
    })
    .join('');

const preprocessMarkdown = (text: string) => {
  let fence: string | null = null;

  return text
    .split('\n')
    .map((line) => {
      const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
      if (match) {
        if (!fence) fence = match[1][0];
        else if (match[1][0] === fence) fence = null;
        return line;
      }

      return fence ? line : preprocessLine(line);
    })
    .join('\n');
};

const components: Components = {
  a: ({ node: _node, href, children, ...props }) => {
    if (href?.startsWith(WIKI_PREFIX)) {
      const title = decodeURIComponent(href.slice(WIKI_PREFIX.length));
      return (
        <span className="wl" data-t={title} role="link" tabIndex={0}>
          {children}
        </span>
      );
    }

    if (href?.startsWith(TAG_PREFIX)) {
      return <span className="tg">{children}</span>;
    }

    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
        {children}
      </a>
    );
  },
  table: ({ node: _node, children, ...props }) => (
    <div className="md-table">
      <table {...props}>{children}</table>
    </div>
  ),
  img: ({ node: _node, ...props }) => <img loading="lazy" {...props} />,
};

export interface MarkdownViewProps {
  text: string;
  className?: string;
}

export const MarkdownView = ({ text, className }: MarkdownViewProps) => (
  <div className={className ? `md-view ${className}` : 'md-view'}>
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
      {preprocessMarkdown(text)}
    </ReactMarkdown>
  </div>
);
