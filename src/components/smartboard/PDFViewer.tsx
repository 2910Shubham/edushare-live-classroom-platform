'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  readOnly?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function PDFViewer({ url, readOnly = false, currentPage = 1, onPageChange }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(currentPage);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    setPageNumber(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById('pdf-container');
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function changePage(offset: number) {
    const newPage = pageNumber + offset;
    if (newPage > 0 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
      if (onPageChange && !readOnly) {
        onPageChange(newPage);
      }
    }
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <div id="pdf-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div 
        style={{ 
          flex: 1, 
          width: '100%', 
          overflow: 'auto', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: 'transparent'
        }}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#6C63FF' }}>
              <Loader2 className="animate-spin" size={32} />
              <span style={{ fontWeight: 500 }}>Loading PDF...</span>
            </div>
          }
          error={
            <div style={{ color: '#FF4757', padding: 20, textAlign: 'center' }}>
              Failed to load PDF.
            </div>
          }
        >
          {containerWidth > 0 && (
            <Page
              pageNumber={pageNumber}
              width={Math.min(containerWidth - 40, 800)} // max width 800px, responsive
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pdf-page-shadow"
            />
          )}
        </Document>
      </div>

      {numPages && numPages > 1 && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            padding: '12px 24px', 
            background: '#FFFFFF',
            borderRadius: 20,
            boxShadow: '0 4px 20px rgba(108,99,255,0.15)',
            position: 'absolute',
            bottom: 24,
            zIndex: 20
          }}
        >
          <button
            type="button"
            disabled={pageNumber <= 1 || readOnly}
            onClick={previousPage}
            style={{ 
              background: 'rgba(108,99,255,0.08)', 
              border: 'none', 
              borderRadius: 8, 
              padding: 6, 
              cursor: (pageNumber <= 1 || readOnly) ? 'not-allowed' : 'pointer',
              opacity: (pageNumber <= 1 || readOnly) ? 0.5 : 1,
              color: '#6C63FF',
              display: 'flex'
            }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2D2B55', fontFamily: "'JetBrains Mono', monospace" }}>
            {pageNumber} <span style={{ color: '#A8A6C8' }}>/</span> {numPages}
          </span>
          
          <button
            type="button"
            disabled={pageNumber >= numPages || readOnly}
            onClick={nextPage}
            style={{ 
              background: 'rgba(108,99,255,0.08)', 
              border: 'none', 
              borderRadius: 8, 
              padding: 6, 
              cursor: (pageNumber >= numPages || readOnly) ? 'not-allowed' : 'pointer',
              opacity: (pageNumber >= numPages || readOnly) ? 0.5 : 1,
              color: '#6C63FF',
              display: 'flex'
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
      <style jsx global>{`
        .pdf-page-shadow canvas {
          box-shadow: 0 8px 32px rgba(108,99,255,0.1) !important;
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
}
