'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, HelpCircle, Paperclip, X, ChevronDown } from 'lucide-react';
import { getSocket } from '@/lib/socket';

interface ChatUser {
  id: string;
  name: string;
  image?: string | null;
  role: string;
}

interface ChatMaterial {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
}

interface ChatMsg {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  user: ChatUser;
  material?: ChatMaterial | null;
}

interface MaterialOption {
  id: string;
  title: string;
  type: string;
}

interface Props {
  classroomId: string;
  currentUserId: string;
  materials?: MaterialOption[];
}

export function ChatPanel({ classroomId, currentUserId, materials = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [msgType, setMsgType] = useState<'text' | 'doubt' | 'material_share'>('text');
  const [selectedMaterial, setSelectedMaterial] = useState<string | undefined>();
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/${classroomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
    setLoading(false);
  }, [classroomId, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      setUnread(0);
    }
  }, [isOpen, fetchMessages]);

  // Socket real-time
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join:classroom', { classroomId, role: 'STUDENT' });

    const handleNewMessage = (msg: ChatMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (!isOpen) {
        setUnread((c) => c + 1);
      } else {
        scrollToBottom();
      }
    };

    socket.on('chat:message', handleNewMessage);
    return () => { socket.off('chat:message', handleNewMessage); };
  }, [classroomId, isOpen, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/${classroomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: input.trim(),
          type: msgType,
          materialId: selectedMaterial,
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        
        // Emit via socket for real-time delivery
        const socket = getSocket();
        socket.emit('chat:message', msg);

        setInput('');
        setMsgType('text');
        setSelectedMaterial(undefined);
        setShowMaterialPicker(false);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
    setSending(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'doubt': return '❓';
      case 'material_share': return '📎';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'doubt': return 'rgba(255,179,71,0.12)';
      case 'material_share': return 'rgba(67,232,216,0.12)';
      default: return 'transparent';
    }
  };

  const getTypeBorder = (type: string) => {
    switch (type) {
      case 'doubt': return '1px solid rgba(255,179,71,0.3)';
      case 'material_share': return '1px solid rgba(67,232,216,0.3)';
      default: return 'none';
    }
  };

  function getRelativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  const selectedMaterialTitle = materials.find((m) => m.id === selectedMaterial)?.title;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          id="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, width: 60, height: 60,
            borderRadius: '50%', border: 'none', cursor: 'pointer', zIndex: 50,
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
            boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <MessageCircle size={26} color="white" />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2, minWidth: 22, height: 22,
              borderRadius: '50%', background: '#FF6B9D', color: 'white',
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: '0 6px', border: '2px solid white',
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="animate-scaleIn"
          style={{
            position: 'fixed', bottom: 24, right: 24, width: 400, maxWidth: 'calc(100vw - 48px)',
            height: 560, maxHeight: 'calc(100vh - 120px)', zIndex: 50,
            background: '#FFFFFF', borderRadius: 24,
            boxShadow: '0 16px 64px rgba(108,99,255,0.2), 0 0 0 1px rgba(108,99,255,0.08)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)', color: 'white',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageCircle size={22} />
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'white' }}>
                  Classroom Chat
                </h3>
                <p style={{ fontSize: 12, opacity: 0.85 }}>{messages.length} messages</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
              padding: 6, cursor: 'pointer', display: 'flex',
            }}>
              <X size={18} color="white" />
            </button>
          </div>

          {/* Message Type Tabs */}
          <div style={{
            display: 'flex', gap: 6, padding: '10px 16px',
            borderBottom: '1px solid rgba(108,99,255,0.06)',
          }}>
            {[
              { value: 'text' as const, label: '💬 Chat', color: '#6C63FF' },
              { value: 'doubt' as const, label: '❓ Doubt', color: '#FFB347' },
              { value: 'material_share' as const, label: '📎 Share', color: '#43E8D8' },
            ].map((t) => (
              <button key={t.value} onClick={() => setMsgType(t.value)} style={{
                padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                background: msgType === t.value ? `${t.color}15` : 'transparent',
                color: msgType === t.value ? t.color : '#A8A6C8',
                outline: msgType === t.value ? `2px solid ${t.color}30` : 'none',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div ref={containerRef} style={{
            flex: 1, overflowY: 'auto', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#A8A6C8' }}>
                <div className="shimmer" style={{ width: '60%', height: 16, margin: '8px auto' }} />
                <div className="shimmer" style={{ width: '80%', height: 16, margin: '8px auto' }} />
                <div className="shimmer" style={{ width: '50%', height: 16, margin: '8px auto' }} />
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#A8A6C8' }}>
                <MessageCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: 14, fontWeight: 500 }}>No messages yet</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.user.id === currentUserId;
                const isTeacher = msg.user.role === 'TEACHER' || msg.user.role === 'ADMIN';
                return (
                  <div key={msg.id} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                    animation: 'fadeInUp 0.3s ease',
                  }}>
                    {/* Sender name */}
                    {!isOwn && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, paddingLeft: 4 }}>
                        {msg.user.image ? (
                          <img src={msg.user.image} alt="" style={{ width: 18, height: 18, borderRadius: '50%' }} />
                        ) : (
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isTeacher ? 'rgba(108,99,255,0.12)' : 'rgba(67,232,216,0.12)',
                            color: isTeacher ? '#6C63FF' : '#0CA89A',
                          }}>
                            {msg.user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span style={{ fontSize: 11, fontWeight: 600, color: isTeacher ? '#6C63FF' : '#5A5880' }}>
                          {msg.user.name}
                          {isTeacher && <span style={{ fontSize: 9, marginLeft: 4, padding: '1px 5px', borderRadius: 6, background: 'rgba(108,99,255,0.1)', color: '#6C63FF' }}>Teacher</span>}
                        </span>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div style={{
                      maxWidth: '80%', padding: '10px 14px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isOwn ? 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)' : getTypeColor(msg.type) || '#F3F2FF',
                      color: isOwn ? 'white' : '#2D2B55',
                      border: isOwn ? 'none' : getTypeBorder(msg.type) || '1px solid rgba(108,99,255,0.08)',
                      boxShadow: isOwn ? '0 4px 12px rgba(108,99,255,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                    }}>
                      {msg.type !== 'text' && (
                        <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, display: 'block', marginBottom: 4 }}>
                          {getTypeIcon(msg.type)} {msg.type === 'doubt' ? 'Doubt' : 'Shared Material'}
                        </span>
                      )}
                      <p style={{ fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word', margin: 0 }}>
                        {msg.content}
                      </p>

                      {/* Tagged material */}
                      {msg.material && (
                        <div style={{
                          marginTop: 8, padding: '8px 10px', borderRadius: 10,
                          background: isOwn ? 'rgba(255,255,255,0.15)' : 'rgba(108,99,255,0.06)',
                          display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                        }}>
                          <span>📄</span>
                          <span style={{ fontWeight: 500 }}>{msg.material.title}</span>
                        </div>
                      )}
                    </div>

                    <span style={{ fontSize: 10, color: '#A8A6C8', marginTop: 2, padding: '0 4px' }}>
                      {getRelativeTime(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Material Tag Bar */}
          {selectedMaterial && (
            <div style={{
              padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(67,232,216,0.06)', borderTop: '1px solid rgba(67,232,216,0.15)',
            }}>
              <span style={{ fontSize: 12, color: '#0CA89A', fontWeight: 500 }}>📎 {selectedMaterialTitle}</span>
              <button onClick={() => setSelectedMaterial(undefined)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              }}>
                <X size={14} color="#A8A6C8" />
              </button>
            </div>
          )}

          {/* Material Picker Dropdown */}
          {showMaterialPicker && materials.length > 0 && (
            <div style={{
              padding: '8px 16px', maxHeight: 160, overflowY: 'auto',
              borderTop: '1px solid rgba(108,99,255,0.06)',
              background: '#FAFAFE',
            }}>
              <p style={{ fontSize: 11, color: '#A8A6C8', marginBottom: 6, fontWeight: 600 }}>Tag a material:</p>
              {materials.map((m) => (
                <button key={m.id} onClick={() => {
                  setSelectedMaterial(m.id);
                  setShowMaterialPicker(false);
                  setMsgType('material_share');
                }} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px',
                  borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
                  background: selectedMaterial === m.id ? 'rgba(108,99,255,0.08)' : 'transparent',
                  color: '#2D2B55', marginBottom: 2, transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(108,99,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = selectedMaterial === m.id ? 'rgba(108,99,255,0.08)' : 'transparent'; }}
                >
                  📄 {m.title}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid rgba(108,99,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 8, background: '#FAFAFE',
          }}>
            <button onClick={() => setShowMaterialPicker(!showMaterialPicker)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 6,
              borderRadius: 8, transition: 'background 0.2s',
              color: showMaterialPicker ? '#6C63FF' : '#A8A6C8',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(108,99,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            title="Tag a material"
            >
              <Paperclip size={18} />
            </button>

            <input
              id="chat-message-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={msgType === 'doubt' ? 'Ask a doubt...' : msgType === 'material_share' ? 'Share about this material...' : 'Type a message...'}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12, fontSize: 14,
                border: '1px solid rgba(108,99,255,0.12)', outline: 'none',
                background: 'white', color: '#2D2B55',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.12)'; }}
            />

            <button
              id="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              style={{
                width: 40, height: 40, borderRadius: 12, border: 'none', cursor: 'pointer',
                background: input.trim() ? 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)' : 'rgba(108,99,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', opacity: sending ? 0.6 : 1,
              }}
            >
              <Send size={18} color={input.trim() ? 'white' : '#A8A6C8'} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
