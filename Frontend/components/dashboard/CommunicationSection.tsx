import { useState, useEffect } from 'react';
import { Search, Send, MoreVertical, Star, Filter, MessageSquare, CheckSquare, Megaphone, ChevronRight, FileText, Clock, Plus, Download, Eye, CheckCircle, XCircle, User, ChevronLeft, AlertCircle } from 'lucide-react';
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

type SectionType = 'messages' | 'tasks' | 'announcements';

interface Message {
  id: string;
  studentName: string;
  studentAvatar?: string;
  course: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment?: boolean;
}

interface Task {
  id: string;
  title: string;
  type: 'entrega' | 'evaluacion' | 'revision';
  course: string;
  dueDate: string;
  status: 'pending' | 'completed';
  studentCount: number;
  submittedCount: number;
  gradedCount: number;
}

interface Announcement {
  id: string;
  title: string;
  course: string;
  message: string;
  date: string;
  recipientCount: number;
}

interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  status: 'pendiente' | 'en-revision' | 'calificada' | 'requiere-cambios';
  submittedDate?: string;
  grade?: number;
  feedback?: string;
  fileUrl?: string;
  fileName?: string;
  submissionText?: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    studentName: 'María González',
    course: 'Nutrición Deportiva Avanzada',
    subject: 'Pregunta sobre macronutrientes',
    preview: '¿Podrías explicar más sobre el timing de proteínas post-entreno?',
    date: 'Hace 2 horas',
    isRead: false,
    isStarred: false,
  },
  {
    id: '2',
    studentName: 'Carlos Ramírez',
    course: 'Anatomía para Fisioterapeutas',
    subject: 'Duda en el módulo 3',
    preview: 'No entiendo bien la biomecánica del hombro...',
    date: 'Hace 5 horas',
    isRead: false,
    isStarred: true,
  },
  {
    id: '3',
    studentName: 'Ana Torres',
    course: 'Nutrición Deportiva Avanzada',
    subject: 'Gracias por el curso',
    preview: 'Excelente contenido, me ha ayudado mucho en mi práctica...',
    date: 'Ayer',
    isRead: true,
    isStarred: false,
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Trabajo práctico: Plan nutricional',
    type: 'entrega',
    course: 'Nutrición Deportiva Avanzada',
    dueDate: '2026-01-20',
    status: 'pending',
    studentCount: 120,
    submittedCount: 85,
    gradedCount: 50,
  },
  {
    id: '2',
    title: 'Evaluación: Anatomía del hombro',
    type: 'evaluacion',
    course: 'Anatomía para Fisioterapeutas',
    dueDate: '2026-01-18',
    status: 'pending',
    studentCount: 95,
    submittedCount: 72,
    gradedCount: 40,
  },
];

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Nuevo material disponible',
    course: 'Nutrición Deportiva Avanzada',
    message: 'He añadido material complementario sobre suplementación en el módulo 4...',
    date: 'Hace 1 día',
    recipientCount: 120,
  },
];

export function CommunicationSection() {
  const [activeSection, setActiveSection] = useState<SectionType>('messages');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');

  // Get unique courses from messages
  const uniqueCourses = Array.from(new Set(messages.map((m) => m.course)));

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.course.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = selectedCourse === 'all' || msg.course === selectedCourse;

    let matchesTab = true;
    if (activeTab === 'unread') {
      matchesTab = !msg.isRead;
    } else if (activeTab === 'starred') {
      matchesTab = msg.isStarred;
    }

    return matchesSearch && matchesCourse && matchesTab;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const starredCount = messages.filter((m) => m.isStarred).length;

  const toggleStar = (messageId: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
      )
    );
    if (selectedMessage?.id === messageId) {
      setSelectedMessage({
        ...selectedMessage,
        isStarred: !selectedMessage.isStarred,
      });
    }
  };

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
            uniqueCourses={uniqueCourses}
            unreadCount={unreadCount}
            starredCount={starredCount}
            toggleStar={toggleStar}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksSection tasks={mockTasks} />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsSection announcements={mockAnnouncements} />
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
  uniqueCourses,
  unreadCount,
  starredCount,
  toggleStar,
}: any) {
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
                  {uniqueCourses.map((course: string) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {filteredMessages.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-500">No hay mensajes</p>
                </Card>
              ) : (
                filteredMessages.map((message: Message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    isSelected={selectedMessage?.id === message.id}
                    onClick={() => setSelectedMessage(message)}
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
function TasksSection({ tasks }: { tasks: Task[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('urgent');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const uniqueCourses = Array.from(new Set(tasks.map((t) => t.course)));

  // Calculate task status based on due date
  const getTaskStatus = (task: Task) => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    const ungraded = task.submittedCount - task.gradedCount;
    
    if (daysUntilDue < 0) {
      return { label: 'Atrasado', color: 'bg-red-100 text-red-700 border-red-200' };
    } else if (ungraded > 0 && daysUntilDue <= 3) {
      return { label: 'En progreso', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    } else {
      return { label: 'Al día', color: 'bg-green-100 text-green-700 border-green-200' };
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'entrega':
        return <FileText className="w-5 h-5 text-teal-600" />;
      case 'evaluacion':
        return <CheckSquare className="w-5 h-5 text-teal-600" />;
      case 'revision':
        return <Eye className="w-5 h-5 text-teal-600" />;
      default:
        return <FileText className="w-5 h-5 text-teal-600" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'entrega':
        return 'Trabajo práctico';
      case 'evaluacion':
        return 'Evaluación';
      case 'revision':
        return 'Revisión';
      default:
        return 'Tarea';
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesCourse = selectedCourse === 'all' || task.course === selectedCourse;
    
    const ungraded = task.submittedCount - task.gradedCount;
    let matchesStatus = true;
    if (statusFilter === 'ungraded') {
      matchesStatus = ungraded > 0;
    } else if (statusFilter === 'completed') {
      matchesStatus = task.gradedCount === task.studentCount;
    }
    
    return matchesCourse && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'urgent') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === 'recent') {
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  const ungradedCount = tasks.reduce((sum, task) => sum + (task.submittedCount - task.gradedCount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tareas</h2>
          <p className="text-sm text-gray-600 mt-1">
            {ungradedCount > 0 && `${ungradedCount} entregas pendientes de revisar`}
          </p>
        </div>
        <Button className="bg-teal-500 hover:bg-teal-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nueva tarea
        </Button>
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
            {uniqueCourses.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
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
            <div className="w-32 h-32 mb-4">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="80" fill="#f3f4f6" />
                <path
                  d="M70 90 L90 110 L130 70"
                  stroke="#9333ea"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">No hay resultados</h3>
            <p className="text-sm text-gray-500">Probar un filtro diferente</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const taskStatus = getTaskStatus(task);
            const ungraded = task.submittedCount - task.gradedCount;
            
            return (
              <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTaskTypeIcon(task.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{task.title}</h3>
                          <Badge variant="outline" className={`text-xs ${taskStatus.color} border`}>
                            {taskStatus.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{getTaskTypeLabel(task.type)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="mb-3 text-xs">
                      {task.course}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Vence:{' '}
                          {new Date(task.dueDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">{task.submittedCount}</span>/
                        {task.studentCount} entregadas
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
                    <span>{task.gradedCount} calificadas</span>
                    <span>·</span>
                    <span>{ungraded} pendientes</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{
                        width: `${(task.gradedCount / task.studentCount) * 100}%`,
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
function AnnouncementsSection({ announcements }: { announcements: Announcement[] }) {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const uniqueCourses = Array.from(new Set(announcements.map((a) => a.course)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Anuncios</h2>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo anuncio
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>
            {uniqueCourses.map((course) => (
              <SelectItem key={course} value={course}>
                {course}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center">
            <Megaphone className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No hay anuncios</h3>
            <p className="text-sm text-gray-500 mb-4">
              Crea tu primer anuncio para comunicarte con todos tus estudiantes
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Crear anuncio
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
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
                        <span>{announcement.date}</span>
                        <span>•</span>
                        <span>{announcement.recipientCount} estudiantes</span>
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
                        <DropdownMenuItem className="text-red-600">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Badge variant="outline" className="mb-3 text-xs">
                    {announcement.course}
                  </Badge>
                  <p className="text-gray-700">{announcement.message}</p>
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
                {message.studentName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={`font-semibold truncate ${
                    !message.isRead ? 'text-black' : 'text-gray-600'
                  }`}
                >
                  {message.studentName}
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
                      message.isStarred
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500">{message.date}</p>
            </div>
          </div>
          {!message.isRead && (
            <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
          )}
        </div>
        <p className="text-sm font-medium mb-1 truncate">{message.subject}</p>
        <p className="text-sm text-gray-500 truncate">{message.preview}</p>
        <Badge variant="outline" className="mt-2 text-xs">
          {message.course}
        </Badge>
      </div>
    </Card>
  );
}

// Message Detail Component
function MessageDetail({
  message,
  onToggleStar,
}: {
  message: Message;
  onToggleStar: () => void;
}) {
  const [reply, setReply] = useState('');

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
            <span className="text-purple-700 font-semibold text-lg">
              {message.studentName.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-1">{message.subject}</h2>
            <p className="text-sm text-gray-600">
              De: {message.studentName} · {message.date}
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              {message.course}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleStar}>
            <Star
              className={`w-5 h-5 ${
                message.isStarred
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
              <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700">{message.preview}</p>
        <p className="text-gray-700 mt-2">
          Me gustaría profundizar más en este tema ya que es crucial para mi
          práctica profesional. ¿Podrías compartir algún recurso adicional o
          explicar con más detalle en el siguiente módulo?
        </p>
        <p className="text-gray-700 mt-4">Gracias de antemano por tu ayuda.</p>
        <p className="text-gray-700 mt-2">Saludos,</p>
        <p className="text-gray-700 font-semibold">{message.studentName}</p>
      </div>

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
          <Button variant="outline">Guardar borrador</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Send className="w-4 h-4 mr-2" />
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
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      id: '1',
      studentName: 'María González',
      studentEmail: 'maria.gonzalez@example.com',
      status: 'pendiente',
      submittedDate: '15 de enero',
      fileUrl: 'https://example.com/submissions/1.pdf',
      fileName: 'plan_nutricional.pdf',
      submissionText: 'He desarrollado un plan nutricional completo para un atleta de resistencia...',
    },
    {
      id: '2',
      studentName: 'Carlos Ramírez',
      studentEmail: 'carlos.ramirez@example.com',
      status: 'pendiente',
      submittedDate: '16 de enero',
      fileUrl: 'https://example.com/submissions/2.pdf',
      fileName: 'caso_clinico_1.pdf',
      submissionText: 'Caso clínico: Paciente masculino de 35 años con sobrepeso...',
    },
    {
      id: '3',
      studentName: 'Ana Torres',
      studentEmail: 'ana.torres@example.com',
      status: 'calificada',
      submittedDate: '14 de enero',
      grade: 92,
      feedback: 'Excelente trabajo. El plan nutricional está muy bien estructurado y fundamentado. Las recomendaciones son precisas y aplicables.',
      fileUrl: 'https://example.com/submissions/3.pdf',
      fileName: 'plan_deportivo.pdf',
      submissionText: 'Plan nutricional para deportista de alto rendimiento...',
    },
    {
      id: '4',
      studentName: 'Luis Martínez',
      studentEmail: 'luis.martinez@example.com',
      status: 'requiere-cambios',
      submittedDate: '13 de enero',
      grade: 65,
      feedback: 'El trabajo necesita más detalle en las recomendaciones. Falta incluir el cálculo de macronutrientes y las fuentes alimentarias específicas.',
      fileUrl: 'https://example.com/submissions/4.pdf',
      fileName: 'plan_revision.pdf',
      submissionText: 'Trabajo práctico de nutrición...',
    },
    {
      id: '5',
      studentName: 'Patricia Sánchez',
      studentEmail: 'patricia.sanchez@example.com',
      status: 'pendiente',
      submittedDate: '17 de enero',
      fileUrl: 'https://example.com/submissions/5.pdf',
      fileName: 'evaluacion_caso.pdf',
      submissionText: 'Evaluación del caso clínico propuesto en clase...',
    },
  ]);

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentGrade, setCurrentGrade] = useState<string>('');
  const [currentFeedback, setCurrentFeedback] = useState<string>('');

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

  const handleGrade = () => {
    if (selectedSubmission) {
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === selectedSubmission.id
            ? {
                ...sub,
                status: 'calificada',
                grade: parseFloat(currentGrade),
                feedback: currentFeedback,
              }
            : sub
        )
      );
      // Auto navigate to next ungraded
      setTimeout(() => {
        goToNextUngraded();
      }, 300);
    }
  };

  const handleRequestChanges = () => {
    if (selectedSubmission) {
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === selectedSubmission.id
            ? {
                ...sub,
                status: 'requiere-cambios',
                grade: parseFloat(currentGrade) || undefined,
                feedback: currentFeedback,
              }
            : sub
        )
      );
      setTimeout(() => {
        goToNextUngraded();
      }, 300);
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
            {task?.title}
          </SheetDescription>
          <Badge variant="outline" className="mb-3 text-xs">
            {task?.course}
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
                            {submission.studentName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm mb-1 ${
                            submission.status === 'pendiente' ? 'text-black' : 'text-gray-600'
                          }`}>
                            {submission.studentName}
                          </p>
                          <p className="text-xs text-gray-500">{submission.submittedDate}</p>
                        </div>
                        {submission.status === 'pendiente' && (
                          <div className="w-2.5 h-2.5 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          {getStatusBadge(submission.status)}
                        </div>
                        {submission.grade !== undefined && (
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

                  {/* A) Entrega del alumno */}
                  <Card className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                          <span className="text-purple-700 font-semibold text-lg">
                            {selectedSubmission.studentName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{selectedSubmission.studentName}</h3>
                          <p className="text-sm text-gray-600">{selectedSubmission.studentEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">Entregado: {selectedSubmission.submittedDate}</p>
                        </div>
                      </div>
                      {getStatusBadge(selectedSubmission.status)}
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Trabajo entregado
                      </h4>
                      {selectedSubmission.submissionText && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{selectedSubmission.submissionText}</p>
                        </div>
                      )}
                      {selectedSubmission.fileName && selectedSubmission.fileUrl && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium">{selectedSubmission.fileName}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(selectedSubmission.fileUrl!)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Descargar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* B) Evaluación */}
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

                  {/* C) Acciones */}
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
                      <Button variant="outline" className="w-full">
                        Guardar borrador
                      </Button>
                      {selectedSubmission.status === 'pendiente' && pendingCount > 1 && (
                        <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
                          <p className="text-sm text-purple-700 text-center">
                            💡 Después de calificar, irás automáticamente a la siguiente entrega sin revisar
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
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Submission Card Component
function SubmissionCard({
  submission,
  isSelected,
  onClick,
}: {
  submission: Submission;
  isSelected: boolean;
  onClick: () => void;
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
                {submission.studentName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={`font-semibold truncate ${
                    submission.status === 'pendiente' ? 'text-black' : 'text-gray-600'
                  }`}
                >
                  {submission.studentName}
                </p>
              </div>
              <p className="text-xs text-gray-500">{submission.submittedDate}</p>
            </div>
          </div>
          {submission.status === 'pendiente' && (
            <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
          )}
        </div>
        <p className="text-sm font-medium mb-1 truncate">{submission.status}</p>
        <p className="text-sm text-gray-500 truncate">{submission.feedback}</p>
        <Badge variant="outline" className="mt-2 text-xs">
          {submission.grade ? `${submission.grade}%` : 'Sin calificar'}
        </Badge>
      </div>
    </Card>
  );
}

// Submission Detail Component
function SubmissionDetail({
  submission,
  onDownload,
}: {
  submission: Submission;
  onDownload: () => void;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
            <span className="text-purple-700 font-semibold text-lg">
              {submission.studentName.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-1">{submission.status}</h2>
            <p className="text-sm text-gray-600">
              De: {submission.studentName} · {submission.submittedDate}
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              {submission.grade ? `${submission.grade}%` : 'Sin calificar'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onDownload}>
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700">{submission.feedback}</p>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-3">Calificar</h3>
        <Textarea
          placeholder="Escribe tu retroalimentación..."
          value={submission.feedback}
          onChange={(e) => setSubmissions((prev) =>
            prev.map((sub) =>
              sub.id === submission.id ? { ...sub, feedback: e.target.value } : sub
            )
          )}
          rows={6}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline">Guardar borrador</Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Send className="w-4 h-4 mr-2" />
            Enviar retroalimentación
          </Button>
        </div>
      </div>
    </Card>
  );
}