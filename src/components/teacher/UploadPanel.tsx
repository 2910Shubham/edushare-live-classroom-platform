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
      <div className="clay clay-md" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div className="clay-icon clay-icon-teal" style={{ margin: '0 auto 16px' }} aria-hidden="true">
          <CheckCircle size={28} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Upload Complete!
        </h3>
        <p style={{ color: 'var(--clay-ink-soft)', fontSize: 14, marginBottom: 20 }}>
          {title} has been shared with the class. AI is generating notes in the background.
        </p>
        <button type="button" onClick={resetForm} className="clay-btn clay-btn-ghost clay-btn-sm">
          Upload Another File
        </button>
      </div>
    );
  }

  return (
    <div className="clay clay-md">
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--clay-ink)', marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
          className="clay-inset"
          style={{
            border: `2px dashed ${isDragging ? 'var(--clay-purple)' : 'rgba(124, 108, 255, 0.35)'}`,
            borderRadius: 20,
            padding: '28px 18px',
            textAlign: 'center',
            background: isDragging ? '#e4deff' : '#ebe6ff',
            cursor: 'pointer',
            marginBottom: 14,
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*, application/pdf, .ppt, .pptx"
            style={{ display: 'none' }}
          />
          <UploadCloud size={38} color={isDragging ? 'var(--clay-purple-dark)' : 'var(--clay-purple)'} style={{ margin: '0 auto 10px' }} />
          <p style={{ color: 'var(--clay-ink)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            Click or drag file to upload
          </p>
          <p style={{ color: 'var(--clay-ink-soft)', fontSize: 13 }}>
            PDF, Image, or PowerPoint (max 20MB). Tip: click here and press Ctrl+V to paste an image.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handlePasteFromClipboard();
              }}
              className="clay-btn clay-btn-ghost clay-btn-sm"
              style={{ height: 38, padding: '0 14px', fontSize: 13 }}
              title="Tap to paste image from clipboard"
            >
              <Clipboard size={16} color="var(--clay-purple-dark)" />
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
            className="clay"
            style={{
              marginTop: 12,
              width: '100%',
              maxWidth: 420,
              marginInline: 'auto',
              padding: '10px 14px',
              borderRadius: 14,
              color: 'var(--clay-ink)',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              userSelect: 'text',
              cursor: 'text',
            }}
          >
            Tap here, then long-press → Paste image
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
            <div className="clay-icon clay-icon-sm clay-icon-purple" style={{ width: 36, height: 36, borderRadius: 12 }} aria-hidden="true">
              <FileText size={18} />
            </div>
            <div className="clay-icon clay-icon-sm clay-icon-teal" style={{ width: 36, height: 36, borderRadius: 12 }} aria-hidden="true">
              <ImageIcon size={18} />
            </div>
            <div className="clay-icon clay-icon-sm clay-icon-yellow" style={{ width: 36, height: 36, borderRadius: 12 }} aria-hidden="true">
              <Presentation size={18} />
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 18 }}>
          <div className="clay-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
            <FileIcon size={22} color="var(--clay-purple-dark)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--clay-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </p>
              <p style={{ fontSize: 12, color: 'var(--clay-ink-soft)' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove selected file"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clay-ink-soft)', padding: 4 }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="clay-error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }} role="alert">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {file && (
        <>
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor={`material-title-${classroomId}`}
              style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--clay-ink)', marginBottom: 8 }}
            >
              Title
            </label>
            <input
              id={`material-title-${classroomId}`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4: Photosynthesis"
              disabled={isUploading}
              className="clay-inset"
              style={{
                width: '100%',
                padding: '11px 14px',
                fontSize: 14,
              }}
            />
          </div>

          {isUploading && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--clay-ink-soft)', marginBottom: 6, fontWeight: 600 }}>
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="clay-progress-track" style={{ height: 10 }}>
                <div className="clay-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              void trackButton('upload_share_click', title, { classroomId });
              handleUpload();
            }}
            disabled={!title || isUploading}
            className="clay-btn clay-btn-sm"
            style={{ width: '100%' }}
          >
            {isUploading ? 'Uploading...' : 'Share to Board'}
          </button>
        </>
      )}
    </div>
  );
}
