'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Layout from '@/components/Layout';
import { Plus, Ticket, X, Save, Trash2, User, Users, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { ConfirmModal } from '@/components/ConfirmModal';

interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  resolved_at: string | null;
  assigned_team_id: number | null;
  assigned_to: number | null;
  task_id: number | null;
  created_by_name: string;
  created_by_email: string;
  team_name: string | null;
  assigned_to_name: string | null;
  task_status: string | null;
}

interface Team {
  id: number;
  name: string;
  member_count: number;
}

interface TeamMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export default function TicketsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar se tem acesso business (precisa ser business)
    if (!user.isBusiness) {
      toast.error('É necessário ter um plano Business para acessar chamados');
      router.push('/dashboard');
      return;
    }

    fetchTickets();
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.isBusiness, user?.isAdmin]);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/business/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchTeamMembers = async (teamId: number) => {
    try {
      const response = await api.get(`/business/teams/${teamId}/members`);
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const ticketData = {
      title: formData.get('title'),
      description: formData.get('description') || null,
      assigned_team_id: formData.get('assigned_team_id') ? parseInt(formData.get('assigned_team_id') as string) : null,
      priority: formData.get('priority') || 'medium',
    };

    try {
      await api.post('/tickets', ticketData);
      toast.success(t('tickets.ticketCreated') || 'Chamado criado!');
      setShowCreateModal(false);
      fetchTickets();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar chamado');
    }
  };

  const handleUpdateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const formData = new FormData(e.currentTarget);
    const updateData: any = {};

    if (formData.get('assigned_to')) {
      updateData.assigned_to = parseInt(formData.get('assigned_to') as string);
    }
    if (formData.get('status')) {
      updateData.status = formData.get('status');
    }
    if (formData.get('priority')) {
      updateData.priority = formData.get('priority');
    }

    try {
      await api.put(`/tickets/${selectedTicket.id}`, updateData);
      toast.success(t('tickets.ticketUpdated') || 'Chamado atualizado!');
      setSelectedTicket(null);
      fetchTickets();
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast.error(error.response?.data?.error || 'Erro ao atualizar chamado');
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      await api.delete(`/tickets/${ticketToDelete}`);
      toast.success(t('tickets.ticketDeleted') || 'Chamado excluído!');
      setShowDeleteModal(false);
      setTicketToDelete(null);
      fetchTickets();
    } catch (error: any) {
      console.error('Error deleting ticket:', error);
      toast.error(error.response?.data?.error || 'Erro ao excluir chamado');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/20 text-blue-500';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'resolved':
        return 'bg-green-500/20 text-green-500';
      case 'closed':
        return 'bg-gray-500/20 text-gray-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-500';
      case 'high':
        return 'bg-orange-500/20 text-orange-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'low':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">{t('tickets.title') || 'Chamados'}</h1>
            <p className="text-muted-foreground">{t('tickets.description') || 'Crie e gerencie chamados para sua equipe'}</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('tickets.newTicket') || 'Novo Chamado'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
            <CardContent className="py-12 text-center">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('tickets.noTickets') || 'Nenhum chamado encontrado'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedTicket(ticket);
                  if (ticket.assigned_team_id) {
                    fetchTeamMembers(ticket.assigned_team_id);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{ticket.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {t(`tickets.${ticket.status}`) || ticket.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        {ticket.task_id && (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-500">
                            Tarefa #{ticket.task_id}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {ticket.created_by_name}
                        </span>
                        {ticket.team_name && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {ticket.team_name}
                          </span>
                        )}
                        {ticket.started_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Iniciado: {new Date(ticket.started_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {ticket.resolved_at && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Resolvido: {new Date(ticket.resolved_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTicketToDelete(ticket.id);
                        setShowDeleteModal(true);
                      }}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                {ticket.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Modal de criar chamado */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-md w-full m-4 animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('tickets.newTicket') || 'Novo Chamado'}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCreateModal(false)}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold">{t('tickets.ticketTitle') || 'Título do Chamado'}</label>
                    <Input name="title" required className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">{t('tickets.ticketDescription') || 'Descrição'}</label>
                    <textarea
                      name="description"
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none mt-1"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">{t('tickets.assignTeam') || 'Atribuir Equipe'}</label>
                    <select
                      name="assigned_team_id"
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mt-1"
                    >
                      <option value="">{t('tickets.selectTeam') || 'Selecione uma equipe'}</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">{t('tickets.priority') || 'Prioridade'}</label>
                    <select
                      name="priority"
                      defaultValue="medium"
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mt-1"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 bg-primary">
                      <Save className="w-4 h-4 mr-2" />
                      {t('common.save') || 'Salvar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1"
                    >
                      {t('common.cancel') || 'Cancelar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de detalhes/atualizar chamado */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-2xl w-full m-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedTicket.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedTicket(null);
                      setTeamMembers([]);
                    }}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateTicket} className="space-y-4">
                  {selectedTicket.description && (
                    <div>
                      <label className="text-sm font-semibold">Descrição</label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedTicket.description}</p>
                    </div>
                  )}

                  {selectedTicket.assigned_team_id && teamMembers.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold">{t('tickets.assignResponsible') || 'Atribuir Responsável'}</label>
                      <select
                        name="assigned_to"
                        defaultValue={selectedTicket.assigned_to || ''}
                        className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mt-1"
                      >
                        <option value="">{t('tickets.selectResponsible') || 'Selecione um responsável'}</option>
                        {teamMembers.map((member) => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.name} ({member.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold">{t('tickets.status') || 'Status'}</label>
                    <select
                      name="status"
                      defaultValue={selectedTicket.status}
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mt-1"
                    >
                      <option value="open">{t('tickets.open') || 'Aberto'}</option>
                      <option value="in_progress">{t('tickets.inProgress') || 'Em Progresso'}</option>
                      <option value="resolved">{t('tickets.resolved') || 'Resolvido'}</option>
                      <option value="closed">{t('tickets.closed') || 'Fechado'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold">{t('tickets.priority') || 'Prioridade'}</label>
                    <select
                      name="priority"
                      defaultValue={selectedTicket.priority}
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mt-1"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  {selectedTicket.task_id && (
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-sm font-semibold text-purple-500">
                        ✓ {t('tickets.taskCreated') || 'Tarefa criada automaticamente para a equipe'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tarefa ID: {selectedTicket.task_id} | Status: {selectedTicket.task_status || 'N/A'}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 bg-primary">
                      <Save className="w-4 h-4 mr-2" />
                      {t('common.save') || 'Salvar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedTicket(null);
                        setTeamMembers([]);
                      }}
                      className="flex-1"
                    >
                      {t('common.cancel') || 'Cancelar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setTicketToDelete(null);
          }}
          onConfirm={handleDeleteTicket}
          title="Confirmar Exclusão"
          description="Tem certeza que deseja excluir este chamado?"
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </Layout>
  );
}

