'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'done';
  priority: string;
  due_date: string | null;
  position: number;
}

const columns = [
  { id: 'todo', label: 'kanban.todo' },
  { id: 'inProgress', label: 'kanban.inProgress' },
  { id: 'done', label: 'kanban.done' },
];

export default function KanbanPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTasks();
  }, [user, router]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status') || 'todo',
      priority: formData.get('priority') || 'medium',
      due_date: formData.get('due_date') || null,
    };

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, taskData);
      } else {
        await api.post('/tasks', taskData);
      }
      setShowCreateModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">{t('kanban.title')}</h1>
            <p className="text-muted-foreground">Organize suas tarefas em colunas</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('tasks.createTask')}
          </Button>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-md w-full m-4 animate-slide-up">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold gradient-text">
                    {editingTask ? t('tasks.editTask') : t('tasks.createTask')}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTask(null);
                    }}
                    className="h-8 w-8 rounded-full"
                  >
                    ×
                  </Button>
                </div>
                <form onSubmit={handleCreateOrUpdate} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{t('tasks.taskTitle')}</label>
                    <input
                      name="title"
                      type="text"
                      defaultValue={editingTask?.title}
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      required
                      placeholder="Nome da tarefa"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{t('tasks.description')}</label>
                    <textarea
                      name="description"
                      defaultValue={editingTask?.description || ''}
                      className="w-full px-4 py-2.5 border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      rows={3}
                      placeholder="Descrição da tarefa (opcional)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{t('tasks.priority')}</label>
                      <select
                        name="priority"
                        defaultValue={editingTask?.priority || 'medium'}
                        className="w-full px-4 py-2.5 border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="low">{t('tasks.low')}</option>
                        <option value="medium">{t('tasks.medium')}</option>
                        <option value="high">{t('tasks.high')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{t('tasks.dueDate')}</label>
                      <input
                        name="due_date"
                        type="date"
                        defaultValue={editingTask?.due_date ? editingTask.due_date.split('T')[0] : ''}
                        className="w-full px-4 py-2.5 border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  {editingTask && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{t('tasks.status')}</label>
                      <select
                        name="status"
                        defaultValue={editingTask.status}
                        className="w-full px-4 py-2.5 border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        <option value="todo">{t('tasks.todo')}</option>
                        <option value="inProgress">{t('tasks.inProgress')}</option>
                        <option value="done">{t('tasks.done')}</option>
                      </select>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20"
                    >
                      {t('common.save')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingTask(null);
                      }}
                      className="flex-1"
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column, colIndex) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div key={column.id} className="space-y-4">
                <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className={`p-2 rounded-lg ${
                        column.id === 'todo' ? 'bg-blue-500/10' :
                        column.id === 'inProgress' ? 'bg-yellow-500/10' :
                        'bg-green-500/10'
                      }`}>
                        {column.id === 'todo' && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                        {column.id === 'inProgress' && <div className="w-3 h-3 rounded-full bg-yellow-500"></div>}
                        {column.id === 'done' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                      </div>
                      {t(column.label)}
                      <span className="ml-auto text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {columnTasks.length}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[500px]">
                    {columnTasks.map((task, index) => (
                      <Card
                        key={task.id}
                        className="p-4 cursor-move hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-border/50 bg-card/50 animate-slide-up"
                        style={{ animationDelay: `${(colIndex * 100) + (index * 50)}ms` }}
                        draggable
                        onDragEnd={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX;
                          const columnWidth = window.innerWidth / 3;
                          const newStatus =
                            x < columnWidth
                              ? 'todo'
                              : x < columnWidth * 2
                              ? 'inProgress'
                              : 'done';
                          if (newStatus !== task.status) {
                            handleStatusChange(task.id, newStatus);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground flex-1">{task.title}</h3>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setShowCreateModal(true);
                              }}
                              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              task.priority === 'high'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : task.priority === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground font-medium">
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </Card>
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground text-sm">✨ {t('tasks.noTasks')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
