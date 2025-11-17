'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Link } from '@/i18n/routing';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Lock,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS, es, type Locale } from 'date-fns/locale';

interface MonthlyReport {
  period: {
    year: number;
    month: number;
    monthName: string;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    completionRate: number;
    overdueTasks: number;
    avgTasksPerDay: number;
  };
  statusStats: {
    todo: number;
    inProgress: number;
    done: number;
  };
  priorityStats: {
    high: number;
    medium: number;
    low: number;
  };
  tasksByDay: { [key: number]: number };
  completedByDay: { [key: number]: number };
  recentTasks: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

const localeMap: { [key: string]: Locale } = {
  pt: ptBR,
  en: enUS,
  es: es,
};

export default function ReportsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar se é premium
    if (!user.isPremium) {
      return; // Mostrar modal de bloqueio
    }

    // Resetar flag quando mês/ano mudar
    hasFetchedRef.current = false;
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (!user || !user.isPremium) {
      return;
    }

    // Buscar relatório quando mês/ano mudar ou na primeira vez
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isPremium, selectedYear, selectedMonth]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/reports/monthly?year=${selectedYear}&month=${selectedMonth}`
      );
      setReport(response.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        // Não é premium
        console.log('Usuário não é premium');
      } else {
        console.error('Error fetching report:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (newMonth: number) => {
    setSelectedMonth(newMonth);
    hasFetchedRef.current = false;
    // fetchReport será chamado pelo useEffect
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    hasFetchedRef.current = false;
    // fetchReport será chamado pelo useEffect
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
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">{t('reports.title')}</h1>
                <p className="text-muted-foreground">{t('reports.description')}</p>
              </div>
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
                      {t('reports.premiumRequired')}
                    </h2>
                    <p className="text-muted-foreground">
                      {t('reports.upgradeMessage')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 p-6 rounded-lg space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold gradient-text">R$ 29,90</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 text-left">
                      <li>✨ Relatórios mensais detalhados</li>
                      <li>✨ Análises e estatísticas avançadas</li>
                      <li>✨ Todos os recursos premium</li>
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

  const currentLocale = localeMap[user.language || 'pt'] || ptBR;

  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">{t('reports.title')}</h1>
            <p className="text-muted-foreground">{t('reports.description')}</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
              className="px-4 py-2 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {format(new Date(selectedYear, month - 1), 'MMMM', { locale: currentLocale })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="px-4 py-2 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : !report ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{t('reports.noData')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-hover border-primary/20 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    {t('reports.totalTasks')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {report.summary.totalTasks}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border-green-500/20 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {t('reports.completedTasks')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-500">
                    {report.summary.completedTasks}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border-yellow-500/20 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    {t('reports.pendingTasks')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-yellow-500">
                    {report.summary.pendingTasks}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border-purple-500/20 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    {t('reports.completionRate')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-purple-500">
                    {report.summary.completionRate}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas por Status e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-hover border-border/50">
                <CardHeader>
                  <CardTitle>{t('reports.byStatus')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <span className="text-sm font-medium">{t('tasks.todo')}</span>
                      <span className="text-lg font-bold text-blue-500">{report.statusStats.todo}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <span className="text-sm font-medium">{t('tasks.inProgress')}</span>
                      <span className="text-lg font-bold text-yellow-500">{report.statusStats.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <span className="text-sm font-medium">{t('tasks.done')}</span>
                      <span className="text-lg font-bold text-green-500">{report.statusStats.done}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover border-border/50">
                <CardHeader>
                  <CardTitle>{t('reports.byPriority')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <span className="text-sm font-medium">{t('tasks.high')}</span>
                      <span className="text-lg font-bold text-red-500">{report.priorityStats.high}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <span className="text-sm font-medium">{t('tasks.medium')}</span>
                      <span className="text-lg font-bold text-yellow-500">{report.priorityStats.medium}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <span className="text-sm font-medium">{t('tasks.low')}</span>
                      <span className="text-lg font-bold text-green-500">{report.priorityStats.low}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tarefas Recentes */}
            <Card className="card-hover border-border/50">
              <CardHeader>
                <CardTitle>{t('reports.recentTasks')}</CardTitle>
              </CardHeader>
              <CardContent>
                {report.recentTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t('tasks.noTasks')}</p>
                ) : (
                  <div className="space-y-3">
                    {report.recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 border border-border/50 rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(task.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: currentLocale })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
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
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                task.status === 'done'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : task.status === 'inProgress'
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {task.status === 'done' ? t('tasks.done') : task.status === 'inProgress' ? t('tasks.inProgress') : t('tasks.todo')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}

