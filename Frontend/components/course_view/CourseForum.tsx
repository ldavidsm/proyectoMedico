'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  MessageSquare, Plus, Pin, Lock, CheckCircle2,
  Trash2, ChevronLeft, Send, Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ForumPost {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  body: string;
  is_answer: boolean;
  created_at: string;
}

interface ForumThread {
  id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  title: string;
  body: string;
  is_pinned: boolean;
  is_closed: boolean;
  views: number;
  post_count: number;
  last_post_at?: string;
  created_at: string;
  posts?: ForumPost[];
}

interface CourseForumProps {
  courseId: string;
  sellerId: string;
}

export function CourseForum({ courseId, sellerId }: CourseForumProps) {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'thread' | 'new'>('list');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSeller = user?.id === sellerId || user?.role === 'admin';

  useEffect(() => {
    if (view === 'list') loadThreads();
  }, [view, courseId]);

  const loadThreads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/forum/courses/${courseId}/threads`,
        { credentials: 'include' },
      );
      if (!res.ok) return;
      setThreads(await res.json());
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  };

  const openThread = async (threadId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/forum/threads/${threadId}`,
        { credentials: 'include' },
      );
      if (!res.ok) return;
      const data = await res.json();
      setSelectedThread(data);
      setView('thread');
    } catch {
      /* ignore */
    }
  };

  const handleCreateThread = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      toast.error('El titulo y el contenido son obligatorios');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/forum/courses/${courseId}/threads`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle, body: newBody }),
        },
      );
      if (!res.ok) throw new Error();
      const thread = await res.json();
      setNewTitle('');
      setNewBody('');
      toast.success('Hilo creado');
      await openThread(thread.id);
    } catch {
      toast.error('Error al crear el hilo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyBody.trim() || !selectedThread) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${API_URL}/forum/threads/${selectedThread.id}/posts`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: replyBody }),
        },
      );
      if (!res.ok) throw new Error();
      const post = await res.json();
      setSelectedThread(prev =>
        prev
          ? {
              ...prev,
              posts: [...(prev.posts || []), post],
              post_count: prev.post_count + 1,
            }
          : null,
      );
      setReplyBody('');
    } catch {
      toast.error('Error al enviar la respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm('¿Eliminar este hilo?')) return;
    try {
      await fetch(`${API_URL}/forum/threads/${threadId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (view === 'thread') setView('list');
      toast.success('Hilo eliminado');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Eliminar esta respuesta?')) return;
    try {
      await fetch(`${API_URL}/forum/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setSelectedThread(prev =>
        prev
          ? {
              ...prev,
              posts: (prev.posts || []).filter(p => p.id !== postId),
              post_count: prev.post_count - 1,
            }
          : null,
      );
      toast.success('Respuesta eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleMarkAnswer = async (postId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/forum/posts/${postId}/mark-answer`,
        { method: 'PATCH', credentials: 'include' },
      );
      const data = await res.json();
      setSelectedThread(prev =>
        prev
          ? {
              ...prev,
              posts: (prev.posts || []).map(p =>
                p.id === postId ? { ...p, is_answer: data.is_answer } : p,
              ),
            }
          : null,
      );
    } catch {
      /* ignore */
    }
  };

  const handleTogglePin = async (threadId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/forum/threads/${threadId}/pin`,
        { method: 'PATCH', credentials: 'include' },
      );
      const data = await res.json();
      setThreads(prev =>
        prev.map(t =>
          t.id === threadId ? { ...t, is_pinned: data.is_pinned } : t,
        ),
      );
      if (selectedThread?.id === threadId) {
        setSelectedThread(prev =>
          prev ? { ...prev, is_pinned: data.is_pinned } : null,
        );
      }
    } catch {
      /* ignore */
    }
  };

  const handleToggleClose = async (threadId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/forum/threads/${threadId}/close`,
        { method: 'PATCH', credentials: 'include' },
      );
      const data = await res.json();
      setThreads(prev =>
        prev.map(t =>
          t.id === threadId ? { ...t, is_closed: data.is_closed } : t,
        ),
      );
      if (selectedThread?.id === threadId) {
        setSelectedThread(prev =>
          prev ? { ...prev, is_closed: data.is_closed } : null,
        );
      }
    } catch {
      /* ignore */
    }
  };

  const timeAgo = (date: string) =>
    formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });

  // ── VISTA: LISTA DE HILOS ────────────────────────────────

  if (view === 'list')
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl font-bold text-gray-900">Foro del curso</h2>
            <span className="text-sm text-gray-500">
              ({threads.length} hilos)
            </span>
          </div>
          <Button
            onClick={() => setView('new')}
            className="bg-teal-500 hover:bg-teal-600 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva pregunta
          </Button>
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600 mb-1">
              Se el primero en preguntar
            </p>
            <p className="text-sm text-gray-400">
              El foro esta vacio — abre el primer hilo
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map(thread => (
              <div
                key={thread.id}
                onClick={() => openThread(thread.id)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700 font-semibold text-sm">
                    {thread.author_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {thread.is_pinned && (
                        <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      )}
                      {thread.is_closed && (
                        <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      )}
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors truncate">
                        {thread.title}
                      </h3>
                      {thread.author_role === 'seller' && (
                        <Badge className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0 flex-shrink-0">
                          Instructor
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                      {thread.body}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{thread.author_name}</span>
                      <span>&middot;</span>
                      <span>{timeAgo(thread.created_at)}</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {thread.post_count} respuestas
                      </span>
                      <span>&middot;</span>
                      <span>{thread.views} vistas</span>
                    </div>
                  </div>

                  {isSeller && (
                    <div
                      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleTogglePin(thread.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          thread.is_pinned
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={thread.is_pinned ? 'Desfijar' : 'Fijar'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleClose(thread.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          thread.is_closed
                            ? 'text-gray-500 bg-gray-100'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={thread.is_closed ? 'Abrir' : 'Cerrar'}
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteThread(thread.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

  // ── VISTA: NUEVO HILO ────────────────────────────────────

  if (view === 'new')
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('list')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Nueva pregunta</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titulo <span className="text-red-500">*</span>
            </label>
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Resume tu pregunta en una frase..."
              maxLength={300}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {newTitle.length}/300
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detalle <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              placeholder="Explica tu duda con mas detalle..."
              rows={6}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setView('list')}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateThread}
              disabled={isSubmitting || !newTitle.trim() || !newBody.trim()}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar pregunta'}
            </Button>
          </div>
        </div>
      </div>
    );

  // ── VISTA: DETALLE DEL HILO ──────────────────────────────

  if (view === 'thread' && selectedThread)
    return (
      <div className="space-y-4">
        {/* Back */}
        <button
          onClick={() => {
            setView('list');
            setSelectedThread(null);
          }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al foro
        </button>

        {/* Thread header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {selectedThread.is_pinned && (
                  <Pin className="w-4 h-4 text-amber-500" />
                )}
                {selectedThread.is_closed && (
                  <Badge className="bg-gray-100 text-gray-600 text-xs gap-1">
                    <Lock className="w-3 h-3" /> Cerrado
                  </Badge>
                )}
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedThread.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs">
                  {selectedThread.author_name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-700">
                  {selectedThread.author_name}
                </span>
                {selectedThread.author_role === 'seller' && (
                  <Badge className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0">
                    Instructor
                  </Badge>
                )}
                <span>&middot;</span>
                <span>{timeAgo(selectedThread.created_at)}</span>
                <span>&middot;</span>
                <span>{selectedThread.views} vistas</span>
              </div>
            </div>

            {isSeller && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTogglePin(selectedThread.id)}
                  className={
                    selectedThread.is_pinned
                      ? 'border-amber-300 text-amber-600'
                      : ''
                  }
                >
                  <Pin className="w-3.5 h-3.5 mr-1" />
                  {selectedThread.is_pinned ? 'Desfijar' : 'Fijar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleClose(selectedThread.id)}
                >
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  {selectedThread.is_closed ? 'Abrir' : 'Cerrar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteThread(selectedThread.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {selectedThread.body}
          </p>
        </div>

        {/* Respuestas */}
        {selectedThread.posts && selectedThread.posts.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
              {selectedThread.post_count} respuesta
              {selectedThread.post_count !== 1 ? 's' : ''}
            </h3>
            {selectedThread.posts.map(post => (
              <div
                key={post.id}
                className={`bg-white border rounded-xl p-5 ${
                  post.is_answer
                    ? 'border-green-300 bg-green-50/50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-xs flex-shrink-0">
                      {post.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm text-gray-900">
                          {post.author_name}
                        </span>
                        {post.author_role === 'seller' && (
                          <Badge className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0">
                            Instructor
                          </Badge>
                        )}
                        {post.is_answer && (
                          <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Respuesta valida
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          {timeAgo(post.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {post.body}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    {isSeller && (
                      <button
                        onClick={() => handleMarkAnswer(post.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          post.is_answer
                            ? 'text-green-600 bg-green-100'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title="Marcar como respuesta valida"
                      >
                        <Award className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(user?.id === post.author_id || isSeller) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario de respuesta */}
        {!selectedThread.is_closed ? (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Tu respuesta
            </h3>
            <Textarea
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              placeholder="Escribe tu respuesta..."
              rows={4}
              className="mb-3"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleReply}
                disabled={isSubmitting || !replyBody.trim()}
                className="bg-teal-500 hover:bg-teal-600 text-white gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Enviando...' : 'Enviar respuesta'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Este hilo esta cerrado — no se admiten mas respuestas
          </div>
        )}
      </div>
    );

  return null;
}
