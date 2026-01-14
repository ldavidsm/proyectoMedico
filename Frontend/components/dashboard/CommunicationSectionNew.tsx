import { useState } from 'react';
import { Search, Send, MoreVertical, Star, Filter, MessageSquare, CheckSquare, Megaphone, ChevronRight, FileText, Clock, Plus } from 'lucide-react';
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
  course: string;
  dueDate: string;
  status: 'pending' | 'completed';
  studentCount: number;
  submittedCount: number;
}

interface Announcement {
  id: string;
  title: string;
  course: string;
  message: string;
  date: string;
  recipientCount: number;
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
    course: 'Nutrición Deportiva Avanzada',
    dueDate: '2026-01-20',
    status: 'pending',
    studentCount: 120,
    submittedCount: 85,
  },
  {
    id: '2',
    title: 'Evaluación: Anatomía del hombro',
    course: 'Anatomía para Fisioterapeutas',
    dueDate: '2026-01-18',
    status: 'pending',
    studentCount: 95,
    submittedCount: 72,
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveSection('messages')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'messages'
                    ? 'bg-purple-50 text-purple-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Mensajes</span>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-purple-600 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </button>

              <button
                onClick={() => setActiveSection('tasks')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'tasks'
                    ? 'bg-purple-50 text-purple-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5" />
                  <span className="font-medium">Tareas</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => setActiveSection('announcements')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'announcements'
                    ? 'bg-purple-50 text-purple-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Megaphone className="w-5 h-5" />
                  <span className="font-medium">Anuncios</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </nav>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {activeSection === 'messages' && (
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
          )}

          {activeSection === 'tasks' && <TasksSection tasks={mockTasks} />}

          {activeSection === 'announcements' && (
            <AnnouncementsSection announcements={mockAnnouncements} />
          )}
        </div>
      </div>
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
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const uniqueCourses = Array.from(new Set(tasks.map((t) => t.course)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Tareas</h2>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nueva tarea
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Checkbox
            id="unread"
            checked={showUnreadOnly}
            onCheckedChange={(checked) => setShowUnreadOnly(checked as boolean)}
          />
          <label htmlFor="unread" className="text-sm cursor-pointer">
            Sin revisar (0)
          </label>
        </div>

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
            <SelectItem value="recent">Primero los más recientes</SelectItem>
            <SelectItem value="oldest">Primero los más antiguos</SelectItem>
            <SelectItem value="due">Por fecha de entrega</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
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
          {tasks.map((task) => (
            <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">{task.title}</h3>
                  </div>
                  <Badge variant="outline" className="mb-3 text-xs">
                    {task.course}
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Ver entregas
                </Button>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{
                      width: `${(task.submittedCount / task.studentCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
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

// Message Card Component (same as before)
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

// Message Detail Component (same as before)
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
