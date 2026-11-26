'use client';

import { Sparkles, Download, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface NotesCardProps {
  id: string;
  materialTitle: string;
  content: string;
  isAIGenerated: boolean;
  createdAt: string;
}

export function NotesCard({ materialTitle, content, isAIGenerated, createdAt }: NotesCardProps) {
  const handleDownload = () => {
    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${materialTitle.replace(/\s+/g, '_')}_Notes.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Notes downloaded');
    } catch {
      toast.error('Failed to download notes');
    }
  };

  return (
    <div
      className="clay clay-md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 500,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {materialTitle}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--clay-ink-soft)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} />
              {new Date(createdAt).toLocaleDateString()}
            </span>
            {isAIGenerated && (
              <span className="clay-pill" style={{ padding: '3px 10px', fontSize: 12 }}>
                <Sparkles size={12} />
                AI Generated
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          aria-label={`Download ${materialTitle} notes`}
          className="clay-btn clay-btn-ghost"
          style={{
            width: 40,
            height: 40,
            padding: 0,
            borderRadius: 14,
            flexShrink: 0,
          }}
          title="Download Markdown"
        >
          <Download size={18} color="var(--clay-purple-dark)" />
        </button>
      </div>

      <div
        className="markdown-body clay-row"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          fontSize: 14,
          color: 'var(--clay-ink)',
          lineHeight: 1.6,
        }}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      <style jsx global>{`
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          color: var(--clay-ink);
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .markdown-body h2 {
          font-size: 1.2em;
          border-bottom: 1px solid rgba(124, 108, 255, 0.14);
          padding-bottom: 0.3em;
        }
        .markdown-body p {
          margin-bottom: 1em;
        }
        .markdown-body ul, .markdown-body ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .markdown-body li {
          margin-bottom: 0.25em;
        }
        .markdown-body code {
          background: rgba(124, 108, 255, 0.1);
          color: var(--clay-purple-dark);
          padding: 0.2em 0.4em;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
        }
        .markdown-body pre {
          background: var(--clay-ink);
          color: #FFFFFF;
          padding: 1em;
          border-radius: 12px;
          overflow-x: auto;
          margin-bottom: 1em;
        }
        .markdown-body pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
