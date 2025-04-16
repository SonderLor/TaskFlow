import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  truncate?: boolean;
  maxLength?: number;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className,
  truncate = false,
  maxLength = 150
}) => {
  // Функция для обрезки Markdown текста
  const truncateMarkdown = (text: string, length: number): string => {
    if (text.length <= length) return text;
    
    // Обрезаем до указанной длины и находим последний пробел
    let truncated = text.substring(0, length);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
      truncated = truncated.substring(0, lastSpace);
    }
    
    return truncated + '...';
  };
  
  const displayContent = truncate ? truncateMarkdown(content, maxLength) : content;
  
  return (
    <div className={`markdown-body ${className || ''} ${truncate ? 'truncated' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
