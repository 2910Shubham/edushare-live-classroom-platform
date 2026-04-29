'use client';

import { FileText, Sparkles, Download, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface NotesCardProps {
  id: string;
  materialTitle: string;
  content: string;
  isAIGenerated: boolean;
  createdAt: string;
}

export function NotesCard({ id, materialTitle, content, isAIGenerated, createdAt }: NotesCardProps) {
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
    } catch (err) {
      toast.error('Failed to download notes');
    }
  };

  return (
    <div
      className="edu-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: 500,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D2B55', marginBottom: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {materialTitle}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#A8A6C8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} />
              {new Date(createdAt).toLocaleDateString()}
            </span>
            {isAIGenerated && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6C63FF', background: 'rgba(108,99,255,0.1)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                <Sparkles size={12} />
                AI Generated
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDownload}
          style={{
            background: 'rgba(108,99,255,0.05)',
            border: 'none',
            borderRadius: 8,
            padding: 8,
            color: '#6C63FF',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="Download Markdown"
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(108,99,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(108,99,255,0.05)'}
        >
          <Download size={18} />
        </button>
      </div>

      <div
        className="markdown-body"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          background: '#FAFAFA',
          borderRadius: 12,
          border: '1px solid rgba(108,99,255,0.08)',
          fontSize: 14,
          color: '#2D2B55',
          lineHeight: 1.6,
        }}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      <style jsx global>{`
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          color: #2D2B55;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .markdown-body h2 {
          font-size: 1.2em;
          border-bottom: 1px solid rgba(108,99,255,0.1);
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
          background: rgba(108,99,255,0.08);
          color: #6C63FF;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9em;
        }
        .markdown-body pre {
          background: #2D2B55;
          color: #FFFFFF;
          padding: 1em;
          border-radius: 8px;
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
