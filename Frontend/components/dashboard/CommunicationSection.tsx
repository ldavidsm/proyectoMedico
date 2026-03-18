import { useState, useEffect } from 'react';
import { Search, Send, MoreVertical, Star, Filter, MessageSquare, CheckSquare, Megaphone, ChevronRight, FileText, Clock, Plus, Download, Eye, CheckCircle, XCircle, User, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type SectionType = 'messages' | 'tasks' | 'announcements';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  course_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  is_starred: boolean;
  created_at: string;
  sender_name: string;
  course_title: string;
  replies: MessageReplyData[];
}

interface MessageReplyData {
  id: string;
  message_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender_name: string;
}

interface Task {
  block_id: string;
  block_title: string;
  course_id: string;
  course_title: string;
  submitted_count: number;
  total_students: number;
  graded_count: number;
  due_date: string | null;
}

interface Announcement {
  id: string;
  course_id: string;
  seller_id: string;
  title: string;
  body: string;
  created_at: string;
  course_title: string;
  recipient_count: number;
}

interface Submission {
  id: string;
  block_id: string;
  course_id: string;
  student_id: string;
  submission_text?: string;
  file_url?: string;
  file_name?: string;
  status: 'pendiente' | 'en-revision' | 'calificada' | 'requiere-cambios';
  grade?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  student_name: string;
  student_email: string;
}

interface SellerCourse {
  id: string;
  title: string;
}

export function CommunicationSection() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionType>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sellerCourses, setSellerCourses] = useState<SellerCourse[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [messagesRes, coursesRes, tasksRes, announcementsRes] = await Promise.all([
          fetch(`${API_URL}/messaging/messages`, { credentials: 'include' }),
          fetch(`${API_URL}/courses/?seller_id=${user.id}`, { credentials: 'include' }),
          fetch(`${API_URL}/messaging/tasks?seller_id=${user.id}`, { credentials: 'include' }),
          fetch(`${API_URL}/messaging/announcements?seller_id=${user.id}`, { credentials: 'include' }),
        ]);

        if (messagesRes.ok) setMessages(await messagesRes.json());
        if (coursesRes.ok) {
          const courses = await coursesRes.json();
          setSellerCourses(courses.map((c: any) => ({ id: c.id, title: c.title })));
        }
        if (tasksRes.ok) setTasks(await tasksRes.json());
        if (announcementsRes.ok) setAnnouncements(await announcementsRes.json());
      } catch (err) {
        console.error('Error loading communication data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.course_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = selectedCourse === 'all' || msg.course_id === selectedCourse;

    let matchesTab = true;
    if (activeTab === 'unread') {
      matchesTab = !msg.is_read;
    } else if (activeTab === 'starred') {
      matchesTab = msg.is_starred;
    }

    return matchesSearch && matchesCourse && matchesTab;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const starredCount = messages.filter((m) => m.is_starred).length;

  const toggleStar = async (messageId: string) => {
    try {
      const res = await fetch(`${API_URL}/messaging/messages/${messageId}/star`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, is_starred: data.is_starred } : msg
          )
        );
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, is_starred: data.is_starred } : null);
        }
      }
    } catch {
      // Fallback: toggle locally
      setMessages(prev =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_starred: !msg.is_starred } : msg
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Cargando comunicación...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Comunicación</h1>
        <p className="text-gray-600">
          Gestiona las preguntas, tareas y anuncios de tus estudiantes
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as SectionType)}>
        <TabsList className="mb-6">
          <TabsTrigger value="messages">
            Mensajes
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-teal-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="announcements">Anuncios</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <MessagesSection
            messages={messages}
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredMessages={filteredMessages}
            sellerCourses={sellerCourses}
            unreadCount={unreadCount}
            starredCount={starredCount}
            toggleStar={toggleStar}
            setMessages={setMessages}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksSection tasks={tasks} sellerCourses={sellerCourses} />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsSection
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            sellerCourses={sellerCourses}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Messages Section Component
function MessagesSection({
  messages,
  selectedMessage,
  setSelectedMessage,
  searchQuery,
  setSearchQuery,
  selectedCourse,
  setSelectedCourse,
  activeTab,
  setActiveTab,
  filteredMessages,
  sellerCourses,
  unreadCount,
  starredCount,
  toggleStar,
  setMessages,
}: any) {
  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    // Mark as read locally + on backend
    if (!message.is_read) {
      setMessages((prev: Message[]) =>
        prev.map((m) => m.id === message.id ? { ...m, is_read: true } : m)
      );
      try {
        await fetch(`${API_URL}/messaging/messages/${message.id}/read`, {
          method: 'PATCH',
          credentials: 'include',
        });
      } catch { /* ignore */ }
    }
    // Load full message with replies
    try {
      const res = await fetch(`${API_URL}/messaging/messages/${message.id}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const full = await res.json();
        setSelectedMessage(full);
      }
    } catch { /* ignore */ }
  };

  return (
    <>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            Todos {messages.length > 0 && `(${messages.length})`}
          </TabsTrigger>
          <TabsTrigger value="unread">
            No leídos {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="starred">
            Destacados {starredCount > 0 && `(${starredCount})`}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar mensajes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filtrar por curso" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cursos</SelectItem>
                  {sellerCourses.map((course: SellerCourse) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {filteredMessages.length === 0 ? (
                <Card className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-1">No tienes mensajes aún</p>
                  <p className="text-sm text-gray-400">Cuando un estudiante te escriba, aparecerá aquí.</p>
                </Card>
              ) : (
                filteredMessages.map((message: Message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    isSelected={selectedMessage?.id === message.id}
                    onClick={() => handleSelectMessage(message)}
                    onToggleStar={() => toggleStar(message.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <MessageDetail
                message={selectedMessage}
                onToggleStar={() => toggleStar(selectedMessage.id)}
                setSelectedMessage={setSelectedMessage}
                setMessages={setMessages}
              />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-gray-500">
                  Selecciona un mensaje para ver los detalles
                </p>
              </Card>
            )}
          </div>
        </div>
      </Tabs>
    </>
  );
}

// Tasks Section Component
function TasksSection({ tasks, sellerCourses }: { tasks: Task[]; sellerCourses: SellerCourse[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('urgent');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = tasks.filter((task) => {
    const matchesCourse = selectedCourse === 'all' || task.course_id === selectedCourse;

    const ungraded = task.submitted_count - task.graded_count;
    let matchesStatus = true;
    if (statusFilter === 'ungraded') {
      matchesStatus = ungraded > 0;
    } else if (statusFilter === 'completed') {
      matchesStatus = task.graded_count === task.total_students;
    }

    return matchesCourse && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.due_date || !b.due_date) return 0;
    if (sortBy === 'urgent') {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (sortBy === 'recent') {
      return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
    }
    return 0;
  });

  const ungradedCount = tasks.reduce((sum, task) => sum + (task.submitted_count - task.graded_count), 0);

  const getTaskStatus = (task: Task) => {
    const ungraded = task.submitted_count - task.graded_count;
    if (task.due_date) {
      const today = new Date();
      const dueDate = new Date(task.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (daysUntilDue < 0) {
        return { label: 'Atrasado', color: 'bg-red-100 text-red-700 border-red-200' };
      } else if (ungraded > 0 && daysUntilDue <= 3) {
        return { label: 'En progreso', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      }
    }
    if (ungraded > 0) {
      return { label: 'En progreso', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    }
    return { label: 'Al día', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tareas</h2>
          <p className="text-sm text-gray-600 mt-1">
            {ungradedCount > 0 && `${ungradedCount} entregas pendientes de revisar`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="ungraded">Sin revisar</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>
            {sellerCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent">Más urgentes</SelectItem>
            <SelectItem value="recent">Más recientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      {sortedTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center">
            <CheckSquare className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No hay tareas pendientes de revisar</h3>
            <p className="text-sm text-gray-500">Cuando tus estudiantes entreguen tareas, aparecerán aquí.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const taskStatus = getTaskStatus(task);
            const ungraded = task.submitted_count - task.graded_count;

            return (
              <Card key={task.block_id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-teal-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{task.block_title}</h3>
                          <Badge variant="outline" className={`text-xs ${taskStatus.color} border`}>
                            {taskStatus.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="mb-3 text-xs">
                      {task.course_title}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            Vence:{' '}
                            {new Date(task.due_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">{task.submitted_count}</span>/
                        {task.total_students} entregadas
                      </div>
                      <div className="text-purple-600 font-semibold">
                        {ungraded} sin revisar
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTask(task)}
                  >
                    Ver entregas
                  </Button>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                    <span>{task.graded_count} calificadas</span>
                    <span>·</span>
                    <span>{ungraded} pendientes</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{
                        width: `${task.total_students > 0 ? (task.graded_count / task.total_students) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submissions Panel */}
      <SubmissionsPanel
        task={selectedTask}
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}

// Announcements Section Component
function AnnouncementsSection({
  announcements,
  setAnnouncements,
  sellerCourses,
}: {
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  sellerCourses: SellerCourse[];
}) {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [formCourseId, setFormCourseId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const filteredAnnouncements = announcements.filter(
    (a) => selectedCourse === 'all' || a.course_id === selectedCourse
  );

  const handleCreate = async () => {
    if (!formCourseId || !formTitle.trim() || !formBody.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch(`${API_URL}/messaging/announcements`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: formCourseId,
          title: formTitle.trim(),
          body: formBody.trim(),
        }),
      });
      if (res.ok) {
        const newAnn = await res.json();
        setAnnouncements((prev) => [newAnn, ...prev]);
        setShowForm(false);
        setFormCourseId('');
        setFormTitle('');
        setFormBody('');
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/messaging/announcements/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Anuncios</h2>
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo anuncio
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="p-6 mb-6 border-purple-200">
          <h3 className="font-semibold mb-4">Crear nuevo anuncio</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Curso</label>
              <Select value={formCourseId} onValueChange={setFormCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {sellerCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Título del anuncio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mensaje</label>
              <Textarea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder="Escribe el contenido del anuncio..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleCreate}
                disabled={!formCourseId || !formTitle.trim() || !formBody.trim() || isSending}
              >
                {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Publicar anuncio
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-6">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>
            {sellerCourses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center">
            <Megaphone className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No hay anuncios</h3>
            <p className="text-sm text-gray-500 mb-4">
              Crea tu primer anuncio para comunicarte con todos tus estudiantes
            </p>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear anuncio
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(announcement.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{announcement.recipient_count} estudiantes</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(announcement.id)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Badge variant="outline" className="mb-3 text-xs">
                    {announcement.course_title}
                  </Badge>
                  <p className="text-gray-700">{announcement.body}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Message Card Component
function MessageCard({
  message,
  isSelected,
  onClick,
  onToggleStar,
}: {
  message: Message;
  isSelected: boolean;
  onClick: () => void;
  onToggleStar: () => void;
}) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-colors ${
        isSelected ? 'border-purple-600 bg-purple-50' : 'hover:bg-gray-50'
      }`}
    >
      <div onClick={onClick}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
              <span className="text-purple-700 font-semibold">
                {message.sender_name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={`font-semibold truncate ${
                    !message.is_read ? 'text-black' : 'text-gray-600'
                  }`}
                >
                  {message.sender_name}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar();
                  }}
                  className="flex-shrink-0 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-4 h-4 ${
                      message.is_starred
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
          {!message.is_read && (
            <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
          )}
        </div>
        <p className="text-sm font-medium mb-1 truncate">{message.subject}</p>
        <p className="text-sm text-gray-500 truncate">{message.body}</p>
        <Badge variant="outline" className="mt-2 text-xs">
          {message.course_title}
        </Badge>
      </div>
    </Card>
  );
}

// Message Detail Component
function MessageDetail({
  message,
  onToggleStar,
  setSelectedMessage,
  setMessages,
}: {
  message: Message;
  onToggleStar: () => void;
  setSelectedMessage: (msg: Message | null) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}) {
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch(`${API_URL}/messaging/messages/${message.id}/reply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply.trim() }),
      });
      if (res.ok) {
        const newReply = await res.json();
        const updatedMessage = {
          ...message,
          replies: [...(message.replies || []), newReply],
        };
        setSelectedMessage(updatedMessage);
        setReply('');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/messaging/messages/${message.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setMessages((prev: Message[]) => prev.filter((m) => m.id !== message.id));
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
            <span className="text-purple-700 font-semibold text-lg">
              {message.sender_name.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-1">{message.subject}</h2>
            <p className="text-sm text-gray-600">
              De: {message.sender_name} · {new Date(message.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              {message.course_title}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleStar}>
            <Star
              className={`w-5 h-5 ${
                message.is_starred
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400 hover:text-yellow-400'
              }`}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Marcar como no leído</DropdownMenuItem>
              <DropdownMenuItem>Archivar</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Original message */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700">{message.body}</p>
      </div>

      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <div className="space-y-4 mb-6">
          {message.replies.map((r) => (
            <div key={r.id} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">{r.sender_name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(r.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <p className="text-sm text-gray-700">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-3">Responder</h3>
        <Textarea
          placeholder="Escribe tu respuesta..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={6}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleSendReply}
            disabled={!reply.trim() || isSending}
          >
            {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Enviar respuesta
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Submissions Panel Component
function SubmissionsPanel({
  task,
  isOpen,
  onClose,
}: {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentGrade, setCurrentGrade] = useState<string>('');
  const [currentFeedback, setCurrentFeedback] = useState<string>('');

  // Load submissions when task changes
  useEffect(() => {
    if (!task) {
      setSubmissions([]);
      setSelectedSubmission(null);
      return;
    }
    const fetchSubmissions = async () => {
      setIsLoadingSubs(true);
      try {
        const res = await fetch(`${API_URL}/messaging/tasks/${task.block_id}/submissions`, {
          credentials: 'include',
        });
        if (res.ok) {
          setSubmissions(await res.json());
        }
      } catch (err) {
        console.error('Error loading submissions:', err);
      } finally {
        setIsLoadingSubs(false);
      }
    };
    fetchSubmissions();
  }, [task]);

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter === 'pendiente') return sub.status === 'pendiente';
    if (statusFilter === 'calificada') return sub.status === 'calificada';
    if (statusFilter === 'requiere-cambios') return sub.status === 'requiere-cambios';
    return true;
  });

  const pendingCount = submissions.filter(s => s.status === 'pendiente').length;
  const gradedCount = submissions.filter(s => s.status === 'calificada').length;
  const needsChangesCount = submissions.filter(s => s.status === 'requiere-cambios').length;

  // Navigation helpers
  const currentIndex = filteredSubmissions.findIndex(s => s.id === selectedSubmission?.id);
  const hasNext = currentIndex < filteredSubmissions.length - 1;
  const hasPrevious = currentIndex > 0;

  const goToNext = () => {
    if (hasNext) {
      const nextSubmission = filteredSubmissions[currentIndex + 1];
      setSelectedSubmission(nextSubmission);
      setCurrentGrade(nextSubmission.grade?.toString() || '');
      setCurrentFeedback(nextSubmission.feedback || '');
    }
  };

  const goToPrevious = () => {
    if (hasPrevious) {
      const prevSubmission = filteredSubmissions[currentIndex - 1];
      setSelectedSubmission(prevSubmission);
      setCurrentGrade(prevSubmission.grade?.toString() || '');
      setCurrentFeedback(prevSubmission.feedback || '');
    }
  };

  const goToNextUngraded = () => {
    const ungradedSubmissions = filteredSubmissions.filter(s => s.status === 'pendiente');
    if (ungradedSubmissions.length > 0) {
      const nextUngraded = ungradedSubmissions[0];
      setSelectedSubmission(nextUngraded);
      setCurrentGrade('');
      setCurrentFeedback('');
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    try {
      const res = await fetch(`${API_URL}/messaging/tasks/submissions/${selectedSubmission.id}/grade`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: parseInt(currentGrade),
          feedback: currentFeedback,
          status: 'calificada',
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSubmissions(prev =>
          prev.map(sub => sub.id === selectedSubmission.id ? updated : sub)
        );
        setTimeout(() => goToNextUngraded(), 300);
      }
    } catch (err) {
      console.error('Error grading submission:', err);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedSubmission) return;
    try {
      const res = await fetch(`${API_URL}/messaging/tasks/submissions/${selectedSubmission.id}/grade`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: currentGrade ? parseInt(currentGrade) : 0,
          feedback: currentFeedback,
          status: 'requiere-cambios',
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSubmissions(prev =>
          prev.map(sub => sub.id === selectedSubmission.id ? updated : sub)
        );
        setTimeout(() => goToNextUngraded(), 300);
      }
    } catch (err) {
      console.error('Error requesting changes:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pendiente de revisión</Badge>;
      case 'calificada':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Calificada</Badge>;
      case 'requiere-cambios':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Requiere cambios</Badge>;
      case 'en-revision':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">En revisión</Badge>;
      default:
        return null;
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'submission.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update local state when submission changes
  useEffect(() => {
    if (selectedSubmission) {
      setCurrentGrade(selectedSubmission.grade?.toString() || '');
      setCurrentFeedback(selectedSubmission.feedback || '');
    }
  }, [selectedSubmission]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-7xl p-0 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 border-b bg-white px-6 pt-6 pb-4">
          <SheetTitle className="text-xl mb-2">Entregas de la tarea</SheetTitle>
          <SheetDescription className="text-base font-semibold text-gray-700 mb-2">
            {task?.block_title}
          </SheetDescription>
          <Badge variant="outline" className="mb-3 text-xs">
            {task?.course_title}
          </Badge>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-md font-semibold text-sm">
              {pendingCount} pendientes
            </div>
            <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md font-semibold text-sm">
              {gradedCount} calificadas
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingSubs ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
              <p className="text-gray-500">Cargando entregas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
              {/* Submissions List */}
              <div className="xl:col-span-4 flex flex-col min-h-0">
                {/* Filters */}
                <div className="mb-4 flex-shrink-0">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas ({submissions.length})</SelectItem>
                      <SelectItem value="pendiente">Pendientes ({pendingCount})</SelectItem>
                      <SelectItem value="calificada">Calificadas ({gradedCount})</SelectItem>
                      <SelectItem value="requiere-cambios">Requieren cambios ({needsChangesCount})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                  {filteredSubmissions.length === 0 ? (
                    <Card className="p-6 text-center">
                      <p className="text-gray-500">No hay entregas con este filtro</p>
                    </Card>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <Card
                        key={submission.id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedSubmission?.id === submission.id
                            ? 'border-purple-600 bg-purple-50 shadow-sm'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setCurrentGrade(submission.grade?.toString() || '');
                          setCurrentFeedback(submission.feedback || '');
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-700 font-semibold text-sm">
                              {submission.student_name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm mb-1 ${
                              submission.status === 'pendiente' ? 'text-black' : 'text-gray-600'
                            }`}>
                              {submission.student_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(submission.submitted_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          {submission.status === 'pendiente' && (
                            <div className="w-2.5 h-2.5 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            {getStatusBadge(submission.status)}
                          </div>
                          {submission.grade !== undefined && submission.grade !== null && (
                            <div className="text-sm font-semibold text-purple-600">
                              {submission.grade}/100
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Submission Detail */}
              <div className="xl:col-span-8 flex flex-col min-h-0">
                {selectedSubmission ? (
                  <div className="space-y-5 overflow-y-auto flex-1 pr-2">
                    {/* Header with navigation */}
                    <div className="flex items-center justify-between sticky top-0 bg-white py-3 border-b pb-4 -mt-1 z-10">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPrevious}
                          disabled={!hasPrevious}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium whitespace-nowrap">
                          Entrega {currentIndex + 1} de {filteredSubmissions.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNext}
                          disabled={!hasNext}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextUngraded}
                        disabled={pendingCount === 0}
                        className="text-purple-600 border-purple-600 hover:bg-purple-50 flex-shrink-0"
                      >
                        <span className="hidden sm:inline">Siguiente sin revisar</span>
                        <span className="sm:hidden">Siguiente</span>
                      </Button>
                    </div>

                    {/* A) Student submission */}
                    <Card className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                            <span className="text-purple-700 font-semibold text-lg">
                              {selectedSubmission.student_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{selectedSubmission.student_name}</h3>
                            <p className="text-sm text-gray-600">{selectedSubmission.student_email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Entregado: {new Date(selectedSubmission.submitted_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(selectedSubmission.status)}
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          Trabajo entregado
                        </h4>
                        {selectedSubmission.submission_text && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">{selectedSubmission.submission_text}</p>
                          </div>
                        )}
                        {selectedSubmission.file_name && selectedSubmission.file_url && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium">{selectedSubmission.file_name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(selectedSubmission.file_url!)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* B) Evaluation */}
                    <Card className="p-5">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        Evaluación
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Calificación (0-100)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="85"
                            value={currentGrade}
                            onChange={(e) => setCurrentGrade(e.target.value)}
                            className="max-w-[200px]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Comentarios y feedback</label>
                          <Textarea
                            placeholder="Escribe tu retroalimentación detallada para el estudiante..."
                            value={currentFeedback}
                            onChange={(e) => setCurrentFeedback(e.target.value)}
                            rows={6}
                          />
                        </div>
                      </div>
                    </Card>

                    {/* C) Actions */}
                    <Card className="p-5">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={handleGrade}
                            disabled={!currentGrade || !currentFeedback}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Calificar y enviar
                          </Button>
                          <Button
                            onClick={handleRequestChanges}
                            disabled={!currentFeedback}
                            variant="outline"
                            className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50"
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Solicitar cambios
                          </Button>
                        </div>
                        {selectedSubmission.status === 'pendiente' && pendingCount > 1 && (
                          <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
                            <p className="text-sm text-purple-700 text-center">
                              Después de calificar, irás automáticamente a la siguiente entrega sin revisar
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="font-semibold text-lg mb-2">Selecciona una entrega</h3>
                    <p className="text-sm text-gray-500">
                      Elige un estudiante de la lista para revisar su trabajo
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
