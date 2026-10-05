"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownProps) {
  const { resolvedTheme } = useTheme();
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert prose-headings:scroll-m-20 prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base prose-p:my-2 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-muted px-0.5 prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:my-3 prose-th:text-left prose-th:bg-muted/40 prose-th:px-2 prose-td:border prose-td:border-border prose-td:px-2 prose-td:py-1",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code(props) {
            const { children, className: cn2, ...rest } = props;
            const match = /language-(\w+)/.exec(cn2 || "");
            const isBlock = Boolean(match);
            if (!isBlock) {
              return (
                <code className={cn2} {...rest}>
                  {children}
                </code>
              );
            }
            return (
              <SyntaxHighlighter
                style={resolvedTheme === "dark" ? oneDark : oneLight}
                language={match?.[1] ?? "text"}
                PreTag="div"
                customStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--muted)",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
