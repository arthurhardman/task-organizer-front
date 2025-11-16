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

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
}

export default function ListsPage() {
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

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
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

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('lists.title')}</h1>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('tasks.createTask')}
          </Button>
        </div>

        {showCreateModal && (
          <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <CardContent className="bg-card p-6 rounded-lg max-w-md w-full m-4">
              <h2 className="text-xl font-bold mb-4">
                {editingTask ? t('tasks.editTask') : t('tasks.createTask')}
              </h2>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('tasks.taskTitle')}</label>
                  <input
                    name="title"
                    type="text"
                    defaultValue={editingTask?.title}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('tasks.description')}</label>
                  <textarea
                    name="description"
                    defaultValue={editingTask?.description || ''}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('tasks.priority')}</label>
                  <select
                    name="priority"
                    defaultValue={editingTask?.priority || 'medium'}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">{t('tasks.low')}</option>
                    <option value="medium">{t('tasks.medium')}</option>
                    <option value="high">{t('tasks.high')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('tasks.dueDate')}</label>
                  <input
                    name="due_date"
                    type="date"
                    defaultValue={editingTask?.due_date ? editingTask.due_date.split('T')[0] : ''}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                {editingTask && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('tasks.status')}</label>
                    <select
                      name="status"
                      defaultValue={editingTask.status}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="todo">{t('tasks.todo')}</option>
                      <option value="inProgress">{t('tasks.inProgress')}</option>
                      <option value="done">{t('tasks.done')}</option>
                    </select>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="submit">{t('common.save')}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTask(null);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            {loading ? (
              <p>{t('common.loading')}</p>
            ) : tasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{t('tasks.noTasks')}</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-md flex items-center justify-between hover:bg-muted transition-colors ${
                      task.status === 'done' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className={`p-2 rounded ${
                          task.status === 'done'
                            ? 'bg-green-500 text-white'
                            : 'border hover:bg-muted'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
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
                        <div className="flex items-center gap-4 mt-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              task.priority === 'high'
                                ? 'bg-red-500/20 text-red-500'
                                : task.priority === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-green-500/20 text-green-500'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.due_date).toLocaleDateString()}
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
                        onClick={() => handleDelete(task.id)}
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
    </Layout>
  );
}

