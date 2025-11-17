'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { format, startOfWeek, endOfWeek, isToday, isPast, parseISO, startOfDay, isBefore, isSameDay } from 'date-fns';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, view]); // Removido router das dependências

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

  // Tarefas de hoje (incluindo tarefas sem data)
  const todayTasks = tasks.filter((task) => {
    if (!task.due_date) {
      // Incluir tarefas sem data na contagem
      return true;
    }
    return isToday(parseISO(task.due_date));
  });

  // Tarefas atrasadas (hoje ou datas passadas)
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    const taskDate = parseISO(task.due_date);
    const today = startOfDay(new Date());
    const taskDateNormalized = startOfDay(taskDate);
    // Considera atrasada se for hoje ou data passada
    return (isSameDay(taskDateNormalized, today) || isBefore(taskDateNormalized, today)) && task.status !== 'done';
  });

  // Tarefas futuras (apenas com data futura, excluindo tarefas sem data)
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
      <div className="space-y-8 animate-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.description')}</p>
          </div>
          <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={view === 'today' ? 'default' : 'ghost'}
              onClick={() => setView('today')}
              className={view === 'today' ? 'bg-primary shadow-lg shadow-primary/20' : ''}
            >
              {t('dashboard.today')}
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              onClick={() => setView('week')}
              className={view === 'week' ? 'bg-primary shadow-lg shadow-primary/20' : ''}
            >
              {t('dashboard.thisWeek')}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-hover border-primary/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                {view === 'today' ? t('dashboard.today') : t('dashboard.thisWeek')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {todayTasks.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t('dashboard.tasks')}</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-destructive/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                {t('dashboard.overdue')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-destructive">{overdueTasks.length}</div>
              <p className="text-sm text-muted-foreground mt-1">{t('dashboard.tasks')}</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-primary/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                {t('dashboard.upcoming')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{upcomingTasks.length}</div>
              <p className="text-sm text-muted-foreground mt-1">{t('dashboard.tasks')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-hover border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                {t('dashboard.today')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : todayTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('tasks.noTasks')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="p-4 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
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
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-hover border-destructive/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-destructive/10">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                {t('dashboard.overdue')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overdueTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('dashboard.noOverdueTasks')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {overdueTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="p-4 border border-destructive/30 rounded-lg bg-destructive/5 hover:bg-destructive/10 transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <span className="text-xs text-destructive font-medium bg-destructive/10 px-2 py-1 rounded">
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

