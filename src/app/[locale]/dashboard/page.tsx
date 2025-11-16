'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { format, startOfWeek, endOfWeek, isToday, isPast, parseISO } from 'date-fns';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
}

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'today' | 'week'>('today');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTasks();
  }, [user, view, router]);

  const fetchTasks = async () => {
    try {
      const now = new Date();
      const startDate = view === 'today' 
        ? format(now, 'yyyy-MM-dd')
        : format(startOfWeek(now), 'yyyy-MM-dd');
      const endDate = view === 'today'
        ? format(now, 'yyyy-MM-dd')
        : format(endOfWeek(now), 'yyyy-MM-dd');

      const response = await api.get(`/tasks/dashboard/range?startDate=${startDate}&endDate=${endDate}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    return isToday(parseISO(task.due_date));
  });

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    return isPast(parseISO(task.due_date)) && task.status !== 'done';
  });

  const upcomingTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    const taskDate = parseISO(task.due_date);
    return !isToday(taskDate) && !isPast(taskDate) && task.status !== 'done';
  });

  if (!user) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <div className="flex gap-2">
            <Button
              variant={view === 'today' ? 'default' : 'outline'}
              onClick={() => setView('today')}
            >
              {t('dashboard.today')}
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              onClick={() => setView('week')}
            >
              {t('dashboard.thisWeek')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {view === 'today' ? t('dashboard.today') : t('dashboard.thisWeek')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayTasks.length}</div>
              <p className="text-sm text-muted-foreground">Tarefas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                {t('dashboard.overdue')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
              <p className="text-sm text-muted-foreground">Tarefas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t('dashboard.upcoming')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{upcomingTasks.length}</div>
              <p className="text-sm text-muted-foreground">Tarefas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.today')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>{t('common.loading')}</p>
              ) : todayTasks.length === 0 ? (
                <p className="text-muted-foreground">{t('tasks.noTasks')}</p>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{task.title}</h3>
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
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.overdue')}</CardTitle>
            </CardHeader>
            <CardContent>
              {overdueTasks.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma tarefa atrasada</p>
              ) : (
                <div className="space-y-2">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border rounded-md hover:bg-muted transition-colors border-destructive"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className="text-xs text-destructive">
                          {task.due_date && format(parseISO(task.due_date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

