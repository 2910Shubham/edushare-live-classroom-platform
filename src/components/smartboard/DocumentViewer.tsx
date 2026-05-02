'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { Material } from '@/types';
import { X, Maximize2, Minimize2, ExternalLink, Loader2, FileText } from 'lucide-react';

const PDFViewer = dynamic(
  () => import('./PDFViewer').then((m) => m.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          backgroundColor: '#f3f4f6',
        }}
      >
        <Loader2 size={32} className="animate-spin" color="#6C63FF" />
        <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>Loading PDF viewer…</p>
      </div>
    ),
  },
);

interface DocumentViewerProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Extensionless Cloudinary raw URLs break Office/Google viewers; proxy can fix MIME via deliveryExt.
 */
function proxyDocumentUrl(origin: string, material: Pick<Material, 'type' | 'fileUrl' | 'mimeType'>): string {
  const { fileUrl, type, mimeType } = material;
  const params = new URLSearchParams({ url: fileUrl });
  
  if (type === 'PPT') {
    // Enhanced extension detection for Cloudinary URLs
    const hasExtension = /\.(ppt|pptx)(\?|$)/i.test(fileUrl);
    
    if (!hasExtension) {
      // Improved MIME type detection for PPT files
      let ext = 'pptx'; // Default to pptx for modern files
      
      if (mimeType === 'application/vnd.ms-powerpoint' || 
          mimeType === 'application/mspowerpoint' ||
          mimeType === 'application/x-mspowerpoint') {
        ext = 'ppt';
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                 mimeType === 'application/zip' && fileUrl.includes('pptx')) {
        ext = 'pptx';
      }
      
      params.set('deliveryExt', ext);
      console.log(`PPT: Adding extension ${ext} for MIME type ${mimeType}`);
    }
  }
  
  return `${origin}/api/proxy/document?${params.toString()}`;
}

/**
 * Office Online and Google Docs Viewer fetch `src` from Microsoft/Google servers.
 * Those servers cannot reach http://localhost/... — use public Cloudinary URLs first in dev.
 * In production, proxy-first can normalize Content-Type and apply signed Cloudinary URLs.
 */
function buildIframeViewerUrls(material: Pick<Material, 'type' | 'fileUrl' | 'mimeType'>, origin: string): string[] {
  const { type, fileUrl, mimeType } = material;
  
  // For direct URLs, convert raw URLs to publicly accessible URLs
  let enhancedFileUrl = fileUrl;
  
  // Convert Cloudinary raw URLs to image URLs for external viewer compatibility
  if (fileUrl.includes('/raw/upload/')) {
    console.log('PPT Debug: Converting raw URL to public URL');
    enhancedFileUrl = fileUrl.replace('/raw/upload/', '/image/upload/');
    console.log('PPT Debug: Converted URL:', enhancedFileUrl);
  }
  
  // Add deliveryExt parameter if needed for PPT files
  if (type === 'PPT' && !/\.(ppt|pptx)(\?|$)/i.test(enhancedFileUrl)) {
    const ext = mimeType === 'application/vnd.ms-powerpoint' ? 'ppt' : 'pptx';
    const separator = enhancedFileUrl.includes('?') ? '&' : '?';
    enhancedFileUrl = `${enhancedFileUrl}${separator}deliveryExt=${ext}`;
    console.log(`PPT Debug: Added deliveryExt=${ext} to direct URL`);
  }
  
  const directUrl = encodeURIComponent(enhancedFileUrl);
  const proxyAbsolute = proxyDocumentUrl(origin, material);
  const encodedProxyUrl = encodeURIComponent(proxyAbsolute);

  let localDev = false;
  try {
    const { hostname } = new URL(origin);
    localDev = hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    localDev = true;
  }

  const officeProxy = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(proxyAbsolute)}`;
  const officeDirect = `https://view.officeapps.live.com/op/embed.aspx?src=${directUrl}`;
  const googleProxy = `https://docs.google.com/viewer?url=${encodedProxyUrl}&embedded=true`;
  const googleDirect = `https://docs.google.com/viewer?url=${directUrl}&embedded=true`;
  const gviewProxy = `https://docs.google.com/gview?url=${encodedProxyUrl}&embedded=true`;
  const gviewDirect = `https://docs.google.com/gview?url=${directUrl}&embedded=true`;

  // PPT-specific debugging
  if (type === 'PPT') {
    console.log('PPT Debug - File URL:', fileUrl);
    console.log('PPT Debug - MIME Type:', mimeType);
    console.log('PPT Debug - Proxy URL:', proxyAbsolute);
    console.log('PPT Debug - Local Dev:', localDev);
    
    // For PPT files with /raw/upload/ URLs, prioritize proxy for better handling
    const isRawUrl = fileUrl.includes('/raw/upload/');
    
    let urls;
    if (localDev) {
      // For localhost, create a public document URL that external viewers can access
      console.log('PPT Debug: Using localhost strategy with public document endpoint');
      
      // Create a public document URL from the Cloudinary URL
      let publicDocUrl = '';
      try {
        if (fileUrl.includes('res.cloudinary.com')) {
          // Extract the Cloudinary path and create a public URL
          const urlParts = fileUrl.split('res.cloudinary.com/');
          if (urlParts.length > 1) {
            const cloudinaryPath = urlParts[1];
            publicDocUrl = `${origin}/api/public/document/${cloudinaryPath}`;
            console.log('PPT Debug: Created public document URL:', publicDocUrl);
          }
        }
      } catch (e) {
        console.log('PPT Debug: Failed to create public document URL:', e);
      }
      
      if (publicDocUrl) {
        const encodedPublicDocUrl = encodeURIComponent(publicDocUrl);
        urls = [
          officeDirect, 
          googleDirect, 
          gviewDirect,
          `https://view.officeapps.live.com/op/embed.aspx?src=${encodedPublicDocUrl}`,
          `https://docs.google.com/viewer?url=${encodedPublicDocUrl}&embedded=true`,
          officeProxy // fallback
        ];
      } else {
        urls = [officeDirect, googleDirect, gviewDirect, officeProxy, googleProxy, gviewProxy];
      }
    } else if (isRawUrl) {
      console.log('PPT Debug: Using production + raw URL strategy - prioritize proxy');
      urls = [officeProxy, googleProxy, gviewProxy, officeDirect, googleDirect, gviewDirect];
    } else {
      console.log('PPT Debug: Using production strategy');
      urls = [officeProxy, officeDirect, googleProxy, googleDirect, gviewProxy, gviewDirect];
    }
    
    console.log('PPT Debug - Viewer URLs:', urls);
    return urls;
  }

  return localDev
    ? [googleDirect, gviewDirect, officeDirect, googleProxy, gviewProxy, officeProxy]
    : [googleProxy, googleDirect, gviewProxy, officeProxy, officeDirect, gviewDirect];
}

export function DocumentViewer({ material, isOpen, onClose }: DocumentViewerProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [viewerFallbackUrls, setViewerFallbackUrls] = useState<string[]>([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [error, setError] = useState<string>('');
  /** 0 = same-origin proxy (best for CORS + Content-Type), 1 = direct Cloudinary */
  const [pdfLoadAttempt, setPdfLoadAttempt] = useState(0);
  const pdfErrorPassRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeFallbackIndexRef = useRef(0);
  const viewerFallbackUrlsRef = useRef<string[]>([]);
  const advanceIframeFallbackRef = useRef<() => void>(() => {});

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    advanceIframeFallbackRef.current = () => {
      clearTimer();
      const urls = viewerFallbackUrlsRef.current;
      const idx = iframeFallbackIndexRef.current;
      if (idx < urls.length - 1) {
        const next = idx + 1;
        iframeFallbackIndexRef.current = next;
        setCurrentUrlIndex(next);
        setViewerUrl(urls[next]);
        setIsLoading(true);
        timeoutRef.current = setTimeout(() => advanceIframeFallbackRef.current(), 15000);
      } else {
        setError(
          'Failed to load document in preview. External viewers could not open this file. Use Open to view it directly.',
        );
        setIsLoading(false);
      }
    };
  }, [clearTimer]);

  useEffect(() => {
    if (!material || !isOpen) return;

    clearTimer();
    pdfErrorPassRef.current = 0;
    iframeFallbackIndexRef.current = 0;

    let scheduleIframeTimeout = false;

    startTransition(() => {
      setIsLoading(true);
      setError('');
      setPdfLoadAttempt(0);
      setCurrentUrlIndex(0);

      if (material.type === 'PDF') {
        setViewerUrl('');
        viewerFallbackUrlsRef.current = [];
        setViewerFallbackUrls([]);
        setIsLoading(false);
        return;
      }

      try {
        if (!material.fileUrl?.trim()) {
          throw new Error('File URL is empty or invalid');
        }

        const origin = window.location.origin;
        const viewerUrls = buildIframeViewerUrls(material, origin);

        viewerFallbackUrlsRef.current = viewerUrls;
        setViewerFallbackUrls(viewerUrls);
        setViewerUrl(viewerUrls[0]);
        scheduleIframeTimeout = true;
      } catch (err) {
        setError('Failed to prepare viewer: ' + (err instanceof Error ? err.message : 'Unknown error'));
        setIsLoading(false);
      }
    });

    if (scheduleIframeTimeout) {
      timeoutRef.current = setTimeout(() => advanceIframeFallbackRef.current(), 15000);
    }

    return () => clearTimer();
  }, [material, isOpen, clearTimer]);

  const handleIframeLoad = () => {
    clearTimer();
    setIsLoading(false);
  };

  const handleIframeError = () => {
    advanceIframeFallbackRef.current();
  };

  const handleOpenInNewTab = () => {
    if (material) {
      window.open(material.fileUrl, '_blank');
    }
  };

  const handleClose = () => {
    setIsMaximized(false);
    onClose();
  };

  const handlePdfLoadError = () => {
    if (pdfErrorPassRef.current === 0) {
      pdfErrorPassRef.current = 1;
      setPdfLoadAttempt(1);
      return;
    }
    setError(
      'This PDF could not be loaded. The link itself is failing (often HTTP 401 from Cloudinary), not the viewer. In Cloudinary go to Settings → Security and enable “Allow delivery of PDF and ZIP files”, then re-upload the PDF. New uploads use document-friendly URLs; older /image/upload PDFs may keep failing until that setting is on.',
    );
  };

  if (!isOpen || !material) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pdfUrl =
    material.type === 'PDF' && material.fileUrl
      ? pdfLoadAttempt === 0
        ? `${origin}/api/proxy/document?url=${encodeURIComponent(material.fileUrl)}`
        : material.fileUrl
      : null;

  const containerStyles = {
    position: 'fixed' as const,
    top: isMaximized ? 0 : '50%',
    left: isMaximized ? 0 : '50%',
    transform: isMaximized ? 'none' : 'translate(-50%, -50%)',
    width: isMaximized ? '100vw' : '90vw',
    height: isMaximized ? '100vh' : '85vh',
    maxWidth: isMaximized ? '100vw' : '1200px',
    maxHeight: isMaximized ? '100vh' : '800px',
    backgroundColor: 'white',
    borderRadius: isMaximized ? 0 : '16px',
    boxShadow: isMaximized ? 'none' : '0 25px 50px rgba(0, 0, 0, 0.25)',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    borderRadius: isMaximized ? 0 : '16px 16px 0 0',
  };

  const contentStyles = {
    flex: 1,
    position: 'relative' as const,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    minHeight: 0,
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <FileText size={20} color="#6C63FF" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: '#1f2937',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {material.title}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '2px',
              }}
            >
              {material.type} •{' '}
              {material.fileSize ? `${(material.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleOpenInNewTab}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Open in new tab"
            type="button"
          >
            <ExternalLink size={14} />
            Open
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title={isMaximized ? 'Minimize' : 'Maximize'}
            type="button"
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={handleClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Close"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={contentStyles}>
        {isLoading && material.type !== 'PDF' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              gap: '12px',
              zIndex: 5,
            }}
          >
            <Loader2 size={32} className="animate-spin" color="#6C63FF" />
            <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>Loading document...</p>
          </div>
        )}

        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              gap: '16px',
              padding: '32px',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={32} color="#ef4444" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '8px',
                }}
              >
                Failed to Load Document
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{error}</p>
              <button
                onClick={handleOpenInNewTab}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #6C63FF',
                  backgroundColor: '#6C63FF',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                type="button"
              >
                <ExternalLink size={14} />
                Try Opening in New Tab
              </button>
            </div>
          </div>
        )}

        {material.type === 'PDF' && pdfUrl && !error && (
          <div style={{ width: '100%', height: '100%', minHeight: 0, position: 'relative' }}>
            <PDFViewer
              key={`${material.id}-${pdfLoadAttempt}`}
              url={pdfUrl}
              readOnly
              onLoadError={handlePdfLoadError}
            />
          </div>
        )}

        {material.type !== 'PDF' && !error && viewerUrl && (
          <iframe
            key={viewerUrl}
            src={viewerUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: isLoading ? 'none' : 'block',
            }}
            title={`Document viewer for ${material.title} (${currentUrlIndex + 1}/${viewerFallbackUrls.length})`}
          />
        )}

        {material.type !== 'PDF' && !error && !viewerUrl && !isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              gap: '16px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={32} color="#ef4444" />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '8px',
                }}
              >
                Unable to Generate Viewer URL
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                The document viewer could not be initialized. Please try opening the file directly.
              </p>
              <button
                onClick={handleOpenInNewTab}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #6C63FF',
                  backgroundColor: '#6C63FF',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                type="button"
              >
                <ExternalLink size={14} />
                Open Document Directly
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
