'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Plus, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { PlansModal } from '@/components/PlansModal';
import { ConfirmModal } from '@/components/ConfirmModal';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  due_time: string | null;
}

export default function ListsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Removido router das dependências

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

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const response = await api.put(`/tasks/${task.id}`, { status: newStatus });
      if (response.data.creditsRemaining !== undefined) {
        updateUser({ credits: response.data.creditsRemaining });
      }
      fetchTasks();
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || t('tasks.insufficientCredits'));
        setShowPlansModal(true);
        try {
          const userResponse = await api.get('/auth/me');
          if (userResponse.data.credits !== undefined) {
            updateUser({ credits: userResponse.data.credits });
          }
        } catch (e) {
          console.error('Error fetching credits:', e);
        }
      } else {
        console.error('Error updating task:', error);
        toast.error(t('tasks.errorUpdating'));
      }
    }
  };

  const handleDeleteClick = (taskId: number) => {
    setTaskToDelete(taskId);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    
    setDeleting(true);
    try {
      const response = await api.delete(`/tasks/${taskToDelete}`);
      if (response.data.creditsRemaining !== undefined) {
        updateUser({ credits: response.data.creditsRemaining });
      }
      fetchTasks();
      toast.success(t('tasks.taskDeleted') || 'Tarefa excluída com sucesso!');
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || t('tasks.insufficientCredits'));
        setShowPlansModal(true);
        try {
          const userResponse = await api.get('/auth/me');
          if (userResponse.data.credits !== undefined) {
            updateUser({ credits: userResponse.data.credits });
          }
        } catch (e) {
          console.error('Error fetching credits:', e);
        }
      } else {
        console.error('Error deleting task:', error);
        toast.error(t('tasks.errorDeleting'));
      }
    } finally {
      setDeleting(false);
      setTaskToDelete(null);
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
      due_time: formData.get('due_time') || null,
    };

    try {
      let response;
      if (editingTask) {
        response = await api.put(`/tasks/${editingTask.id}`, taskData);
      } else {
        response = await api.post('/tasks', taskData);
      }
      
      if (response.data.creditsRemaining !== undefined) {
        updateUser({ credits: response.data.creditsRemaining });
      }
      
      setShowCreateModal(false);
      setEditingTask(null);
      fetchTasks();
      toast.success(editingTask ? t('tasks.taskUpdated') : t('tasks.taskCreated'));
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || t('tasks.insufficientCredits'));
        setShowPlansModal(true);
        try {
          const userResponse = await api.get('/auth/me');
          if (userResponse.data.credits !== undefined) {
            updateUser({ credits: userResponse.data.credits });
          }
        } catch (e) {
          console.error('Error fetching credits:', e);
        }
      } else {
        console.error('Error saving task:', error);
        toast.error(t('tasks.errorSaving'));
      }
    }
  };

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">{t('lists.title')}</h1>
            <p className="text-muted-foreground">{t('lists.description')}</p>
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
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                      required
                      placeholder={t('tasks.taskNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{t('tasks.description')}</label>
                    <textarea
                      name="description"
                      defaultValue={editingTask?.description || ''}
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground"
                      rows={3}
                      placeholder={t('tasks.taskDescriptionPlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{t('tasks.priority')}</label>
                      <select
                        name="priority"
                        defaultValue={editingTask?.priority || 'medium'}
                        className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                        className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{t('tasks.dueTime')}</label>
                      <input
                        name="due_time"
                        type="time"
                        defaultValue={editingTask?.due_time || ''}
                        className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>
                  {editingTask && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">{t('tasks.status')}</label>
                      <select
                        name="status"
                        defaultValue={editingTask.status}
                        className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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

        <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">✨ {t('tasks.noTasks')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`p-4 border border-border/50 rounded-lg flex items-center justify-between hover:bg-muted/30 hover:border-primary/30 transition-all duration-200 animate-slide-up ${
                      task.status === 'done' ? 'opacity-60 bg-muted/20' : ''
                    }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          task.status === 'done'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20'
                            : 'border border-border/50 hover:bg-muted hover:border-primary/50'
                        }`}
                      >
                        <CheckCircle2 className={`w-5 h-5 ${task.status === 'done' ? '' : 'text-muted-foreground'}`} />
                      </button>
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${
                            task.status === 'done' ? 'line-through' : ''
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
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
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.due_date).toLocaleDateString()}
                              {task.due_time && ` às ${task.due_time}`}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {task.status === 'todo'
                              ? t('tasks.todo')
                              : task.status === 'inProgress'
                              ? t('tasks.inProgress')
                              : t('tasks.done')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setShowCreateModal(true);
                        }}
                        className="p-2 hover:bg-muted rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task.id)}
                        className="p-2 hover:bg-muted rounded text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <PlansModal 
        isOpen={showPlansModal} 
        onClose={() => setShowPlansModal(false)}
        currentCredits={user?.credits}
      />
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t('tasks.confirmDeleteTitle') || 'Confirmar Exclusão'}
        description={t('tasks.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
        loading={deleting}
      />
    </Layout>
  );
}

