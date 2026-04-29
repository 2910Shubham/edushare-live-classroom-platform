'use client';

import { useState, useRef } from 'react';
import { UploadCloud, File, Image as ImageIcon, FileText, Presentation, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';

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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#6C63FF' : 'rgba(108,99,255,0.2)'}`,
            borderRadius: 16,
            padding: '40px 24px',
            textAlign: 'center',
            background: isDragging ? 'rgba(108,99,255,0.04)' : '#FAFAFA',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: 16,
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
            PDF, Image, or PowerPoint (max 20MB)
          </p>
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
            <File size={24} color="#6C63FF" />
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
            onClick={handleUpload}
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
