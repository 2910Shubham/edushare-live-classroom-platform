'use client';

import { useEffect, useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, Image as ImageIcon, FileText, Presentation, CheckCircle, AlertCircle, X, Clipboard } from 'lucide-react';
import { toast } from 'sonner';
import { trackFeature, trackButton } from '@/lib/analytics';

interface UploadPanelProps {
  classroomId: string;
  onUploadComplete?: (material: any) => void;
}

export function UploadPanel({ classroomId, onUploadComplete }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const pasteBoxRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError('Unsupported file format. Please upload PDF, Image, or PowerPoint.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
      setError('File size exceeds 20MB limit.');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.split('.')[0]);
    }
  };

  const guessImageExt = (mime: string) => {
    if (mime === 'image/jpeg') return 'jpg';
    if (mime === 'image/png') return 'png';
    if (mime === 'image/gif') return 'gif';
    if (mime === 'image/webp') return 'webp';
    return 'png';
  };

  const trySetPastedImageFile = async (clipboardData: DataTransfer | null) => {
    if (!clipboardData) return;
    if (isUploading) return;

    const items = Array.from(clipboardData.items ?? []);
    const imageItem = items.find((it) => it.kind === 'file' && it.type.startsWith('image/'));
    if (imageItem) {
      const raw = imageItem.getAsFile();
      if (!raw) return;
      const ext = guessImageExt(raw.type);
      const named = new globalThis.File([raw], `pasted-image-${Date.now()}.${ext}`, { type: raw.type });
      validateAndSetFile(named);
      setTitle((prev) => prev || `Pasted image ${new Date().toLocaleString()}`);
      toast.success('Image pasted. Ready to upload.');
      void trackFeature('upload_paste_image', 'clipboard');
      return;
    }

    // Fallback: some apps copy an image URL as text
    const textItem = items.find((it) => it.kind === 'string' && it.type === 'text/plain');
    if (!textItem) return;

    const text = await new Promise<string>((resolve) => {
      textItem.getAsString((s) => resolve(s || ''));
    });
    const trimmed = text.trim();
    if (!/^https?:\/\//i.test(trimmed)) return;
    if (!/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(trimmed)) return;

    try {
      setError('');
      const res = await fetch(trimmed);
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) throw new Error('Not an image');
      const ext = guessImageExt(blob.type);
      const named = new globalThis.File([blob], `pasted-url-image-${Date.now()}.${ext}`, { type: blob.type });
      validateAndSetFile(named);
      setTitle((prev) => prev || `Web image ${new Date().toLocaleString()}`);
      toast.success('Image URL pasted. Ready to upload.');
    } catch {
      toast.error('Could not load pasted image URL (CORS/URL issue). Try copying the image itself.');
    }
  };

  const handlePasteFromClipboard = async () => {
    if (isUploading) return;
    if (!navigator.clipboard?.read) {
      toast.error('Clipboard button not supported here. Use the Paste box (tap + long-press Paste) or Ctrl+V.');
      return;
    }
    try {
      // Requires user gesture + permissions; works best on HTTPS.
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (!imageType) continue;
        const blob = await item.getType(imageType);
        const ext = guessImageExt(blob.type);
        const named = new globalThis.File([blob], `clipboard-image-${Date.now()}.${ext}`, { type: blob.type });
        validateAndSetFile(named);
        setTitle((prev) => prev || `Clipboard image ${new Date().toLocaleString()}`);
        toast.success('Clipboard image captured. Ready to upload.');
        return;
      }
      toast.error('No image found in clipboard.');
    } catch {
      toast.error('Could not read clipboard. Try long-press Paste or Ctrl+V.');
    }
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      // Only react when the user is interacting with this panel area.
      const active = document.activeElement;
      const withinPanel =
        (dropzoneRef.current && active && dropzoneRef.current.contains(active)) ||
        (dropzoneRef.current && e.target && dropzoneRef.current.contains(e.target as Node));
      if (!withinPanel) return;
      void trySetPastedImageFile(e.clipboardData);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [isUploading]);

  const handleUpload = async () => {
    if (!file || !title) return;

    setIsUploading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('classroomId', classroomId);
    formData.append('title', title);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201) {
          setSuccess(true);
          toast.success('File uploaded successfully');
          void trackFeature('material_upload_success', title, {
            classroomId,
            metadata: { fileName: file.name, fileType: file.type },
          });
          if (onUploadComplete) {
            onUploadComplete(JSON.parse(xhr.responseText));
          }
        } else {
          try {
            const res = JSON.parse(xhr.responseText);
            setError(res.error || 'Upload failed');
          } catch {
            setError('Upload failed');
          }
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        setError('Network error occurred during upload');
        setIsUploading(false);
      };

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (err) {
      setError('An unexpected error occurred');
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setSuccess(false);
    setError('');
    setProgress(0);
  };

  if (success) {
    return (
      <div className="edu-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <CheckCircle size={48} color="#43E8D8" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D2B55', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Upload Complete!
        </h3>
        <p style={{ color: '#5A5880', fontSize: 14, marginBottom: 24 }}>
          {title} has been shared with the class. AI is generating notes in the background.
        </p>
        <button onClick={resetForm} className="btn-secondary">
          Upload Another File
        </button>
      </div>
    );
  }

  return (
    <div className="edu-card">
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2D2B55', marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Share Material
      </h3>

      {!file ? (
        <div
          ref={dropzoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
              // Let the paste event fire; this keeps behavior consistent.
            }
          }}
          style={{
            border: `2px dashed ${isDragging ? '#6C63FF' : 'rgba(108,99,255,0.2)'}`,
            borderRadius: 16,
            padding: '40px 24px',
            textAlign: 'center',
            background: isDragging ? 'rgba(108,99,255,0.04)' : '#FAFAFA',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: 16,
            outline: 'none',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*, application/pdf, .ppt, .pptx"
            style={{ display: 'none' }}
          />
          <UploadCloud size={40} color={isDragging ? '#6C63FF' : '#A8A6C8'} style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#2D2B55', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            Click or drag file to upload
          </p>
          <p style={{ color: '#A8A6C8', fontSize: 13 }}>
            PDF, Image, or PowerPoint (max 20MB). Tip: click here and press Ctrl+V to paste an image.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handlePasteFromClipboard();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid rgba(108,99,255,0.18)',
                background: 'white',
                color: '#2D2B55',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}
              title="Tap to paste image from clipboard"
            >
              <Clipboard size={18} color="#6C63FF" />
              Paste from clipboard
            </button>
          </div>

          {/* Mobile-friendly paste target (tap then long-press → Paste) */}
          <div
            ref={pasteBoxRef}
            contentEditable
            suppressContentEditableWarning
            onClick={(e) => e.stopPropagation()}
            onPaste={(e) => {
              e.stopPropagation();
              void trySetPastedImageFile(e.clipboardData);
              // clear any pasted text so the box stays clean
              requestAnimationFrame(() => {
                if (pasteBoxRef.current) pasteBoxRef.current.innerText = '';
              });
            }}
            onKeyDown={(e) => {
              // Keep it a "paste only" box
              if (e.key !== 'Tab') e.preventDefault();
            }}
            style={{
              marginTop: 12,
              width: '100%',
              maxWidth: 420,
              marginInline: 'auto',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1.5px solid rgba(108,99,255,0.18)',
              background: 'rgba(255,255,255,0.85)',
              color: '#2D2B55',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              outline: 'none',
              userSelect: 'text',
              cursor: 'text',
            }}
          >
            Tap here, then long-press → Paste image
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
            <div style={{ padding: 8, background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <FileText size={20} color="#6C63FF" />
            </div>
            <div style={{ padding: 8, background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <ImageIcon size={20} color="#43E8D8" />
            </div>
            <div style={{ padding: 8, background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <Presentation size={20} color="#FFB347" />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#FAFAFA', borderRadius: 12, border: '1px solid rgba(108,99,255,0.1)' }}>
            <FileIcon size={24} color="#6C63FF" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: '#2D2B55', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </p>
              <p style={{ fontSize: 12, color: '#A8A6C8' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            {!isUploading && (
              <button
                onClick={() => setFile(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A8A6C8', padding: 4 }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FF4757', fontSize: 14, marginBottom: 16, padding: 12, background: 'rgba(255,71,87,0.08)', borderRadius: 8 }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {file && (
        <>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A5880', marginBottom: 6 }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4: Photosynthesis"
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid rgba(108,99,255,0.2)',
                outline: 'none',
                fontSize: 14,
                color: '#2D2B55',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6C63FF'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(108,99,255,0.2)'}
            />
          </div>

          {isUploading && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#5A5880', marginBottom: 6 }}>
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(108,99,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #6C63FF 0%, #43E8D8 100%)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => {
              void trackButton('upload_share_click', title, { classroomId });
              handleUpload();
            }}
            disabled={!title || isUploading}
            className="btn-primary"
            style={{ width: '100%', opacity: (!title || isUploading) ? 0.7 : 1 }}
          >
            {isUploading ? 'Uploading...' : 'Share to Board'}
          </button>
        </>
      )}
    </div>
  );
}
