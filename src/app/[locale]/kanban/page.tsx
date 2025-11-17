'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Plus, Trash2, Edit, Lock, Sparkles, Settings } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from '@/components/ui/toast';
import { PlansModal } from '@/components/PlansModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { KanbanColumnsConfig } from '@/components/KanbanColumnsConfig';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  due_time: string | null;
  position: number;
}

interface KanbanColumn {
  id: number;
  name: string;
  status_id: string;
  position: number;
  color: string;
}

export default function KanbanPage() {
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
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(true);
  const [showColumnsConfig, setShowColumnsConfig] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTasks();
    fetchColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Removido router das dependências

  const fetchColumns = async () => {
    try {
      setLoadingColumns(true);
      const response = await api.get('/kanban/columns');
      setColumns(response.data);
    } catch (error) {
      console.error('Error fetching columns:', error);
    } finally {
      setLoadingColumns(false);
    }
  };

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
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      if (response.data.creditsRemaining !== undefined) {
        updateUser({ credits: response.data.creditsRemaining });
      }
      fetchTasks();
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response?.data?.message || t('tasks.insufficientCredits'));
        setShowPlansModal(true);
        // Atualizar créditos do usuário
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
        // Atualizar créditos do usuário
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
      status: formData.get('status') || (columns.length > 0 ? columns[0].status_id : 'todo'),
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
      
      // Atualizar créditos se retornados
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
        // Atualizar créditos do usuário
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

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  if (!user) {
    return null;
  }

  // Bloquear acesso se não for premium
  if (!user.isPremium) {
    return (
      <Layout>
        <div className="relative">
          {/* Conteúdo borrado */}
          <div className="blur-sm pointer-events-none select-none opacity-30">
            <div className="space-y-8 animate-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold gradient-text mb-2">{t('kanban.title')}</h1>
                  <p className="text-muted-foreground">{t('kanban.description')}</p>
                </div>
                <Button 
                  onClick={() => {}}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('tasks.createTask')}
                </Button>
              </div>
              {loadingColumns ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : columns.length === 0 ? (
                <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      {t('kanban.noColumns') || 'Nenhuma coluna configurada. Configure suas colunas para começar.'}
                    </p>
                    <Button onClick={() => setShowColumnsConfig(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t('kanban.configureColumns') || 'Configurar Colunas'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {columns.map((column) => (
                    <Card key={column.id} className="border-border/50 bg-gradient-to-br from-card to-card/50 min-h-[500px]">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: `${column.color}20` }}>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }}></div>
                          </div>
                          {column.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          {t('tasks.noTasks')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal de bloqueio */}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-md w-full m-4 animate-slide-up">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <Lock className="w-10 h-10 text-yellow-900" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold gradient-text">
                      {t('payment.kanbanBlocked')}
                    </h2>
                    <p className="text-muted-foreground">
                      {t('payment.kanbanBlockedMessage')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 p-6 rounded-lg space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold gradient-text">R$ 39,90</span>
                      <span className="text-muted-foreground">{t('payment.perMonth')}</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 text-left">
                      <li>✨ {t('kanban.unlimitedKanbanAccess')}</li>
                      <li>✨ {t('kanban.noCreditLimit')}</li>
                      <li>✨ {t('kanban.allPremiumFeatures')}</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Link href="/payment" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20">
                        {t('payment.payNow')}
                      </Button>
                    </Link>
                    <Link href="/dashboard" className="flex-1">
                      <Button variant="outline" className="w-full">
                        {t('common.cancel')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">{t('kanban.title')}</h1>
            <p className="text-muted-foreground">{t('kanban.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowColumnsConfig(true)}
              className="border-border/50"
            >
              <Settings className="w-4 h-4 mr-2" />
              {t('kanban.configureColumns') || 'Configurar Colunas'}
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('tasks.createTask')}
            </Button>
          </div>
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
                        defaultValue={editingTask?.status || (columns.length > 0 ? columns[0].status_id : 'todo')}
                        className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      >
                        {columns.map((col) => (
                          <option key={col.id} value={col.status_id}>
                            {col.name}
                          </option>
                        ))}
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

        {loadingColumns ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : columns.length === 0 ? (
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {t('kanban.noColumns') || 'Nenhuma coluna configurada. Configure suas colunas para começar.'}
              </p>
              <Button onClick={() => setShowColumnsConfig(true)}>
                <Settings className="w-4 h-4 mr-2" />
                {t('kanban.configureColumns') || 'Configurar Colunas'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {columns.map((column, colIndex) => {
              const columnTasks = getTasksByStatus(column.status_id);
              return (
                <div key={column.id} className="space-y-4">
                  <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${column.color}20` }}>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }}></div>
                        </div>
                        {column.name}
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
                          const columnWidth = window.innerWidth / columns.length;
                          const columnIndex = Math.floor(x / columnWidth);
                          const targetColumn = columns[Math.min(columnIndex, columns.length - 1)];
                          
                          if (targetColumn && targetColumn.status_id !== task.status) {
                            handleStatusChange(task.id, targetColumn.status_id);
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
                              onClick={() => handleDeleteClick(task.id)}
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
                              {task.due_time && ` às ${task.due_time}`}
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
        )}
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
      <KanbanColumnsConfig
        isOpen={showColumnsConfig}
        onClose={() => setShowColumnsConfig(false)}
        onColumnsUpdated={() => {
          fetchColumns();
          fetchTasks();
        }}
      />
    </Layout>
  );
}
