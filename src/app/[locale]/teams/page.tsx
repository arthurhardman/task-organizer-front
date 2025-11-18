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
import { Plus, Users, X, Save, Trash2, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { ConfirmModal } from '@/components/ConfirmModal';

interface Team {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
  created_at: string;
}

interface TeamMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
}

interface BusinessUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  team_count: number;
}

export default function TeamsPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Apenas admin com plano business pode gerenciar equipes
    if (!user.isAdmin || !user.isBusiness) {
      router.push('/dashboard');
      return;
    }

    fetchTeams();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.isAdmin, user?.isBusiness]);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/business/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Erro ao carregar equipes');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/business/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTeamMembers = async (teamId: number) => {
    try {
      const response = await api.get(`/business/teams/${teamId}/members`);
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Erro ao carregar membros da equipe');
    }
  };

  const handleCreateOrUpdateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const teamData = {
      name: formData.get('name'),
      description: formData.get('description') || null,
    };

    try {
      if (editingTeam) {
        await api.put(`/business/teams/${editingTeam.id}`, teamData);
        toast.success('Equipe atualizada!');
      } else {
        await api.post('/business/teams', teamData);
        toast.success('Equipe criada!');
      }
      setShowCreateModal(false);
      setEditingTeam(null);
      fetchTeams();
    } catch (error: any) {
      console.error('Error saving team:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar equipe');
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      await api.delete(`/business/teams/${teamToDelete}`);
      toast.success('Equipe excluída!');
      setShowDeleteModal(false);
      setTeamToDelete(null);
      setSelectedTeam(null);
      fetchTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error(error.response?.data?.error || 'Erro ao excluir equipe');
    }
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const formData = new FormData(e.currentTarget);
    const userId = parseInt(formData.get('user_id') as string);
    const role = formData.get('role') as string;

    try {
      await api.post(`/business/teams/${selectedTeam}/members`, {
        user_id: userId,
        role: role || 'member',
      });
      toast.success('Membro adicionado à equipe!');
      setShowAddMemberModal(false);
      fetchTeamMembers(selectedTeam);
      fetchTeams(); // Atualizar contagem de membros
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.error || 'Erro ao adicionar membro');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedTeam) return;

    try {
      await api.delete(`/business/teams/${selectedTeam}/members/${userId}`);
      toast.success('Membro removido da equipe!');
      fetchTeamMembers(selectedTeam);
      fetchTeams();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.error || 'Erro ao remover membro');
    }
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">{t('teams.manageTeams')}</h1>
            <p className="text-muted-foreground">{t('teams.description')}</p>
          </div>
          <Button
            onClick={() => {
              setEditingTeam(null);
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('teams.newTeam')}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="border-border/50 bg-gradient-to-br from-card to-card/50 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => {
                  setSelectedTeam(team.id);
                  fetchTeamMembers(team.id);
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {team.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTeam(team);
                          setShowCreateModal(true);
                        }}
                        className="h-8 w-8"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTeamToDelete(team.id);
                          setShowDeleteModal(true);
                        }}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {team.description && (
                    <p className="text-sm text-muted-foreground mb-3">{team.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{team.member_count} {t('teams.members')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de criar/editar equipe */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-md w-full m-4 animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{editingTeam ? t('teams.editTeam') : t('teams.newTeam')}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTeam(null);
                    }}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrUpdateTeam} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold">Nome da Equipe</label>
                    <Input
                      name="name"
                      defaultValue={editingTeam?.name}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Descrição</label>
                    <textarea
                      name="description"
                      defaultValue={editingTeam?.description || ''}
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 bg-primary">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingTeam(null);
                      }}
                      className="flex-1"
                    >
                      {t('teams.cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de membros da equipe */}
        {selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-2xl w-full m-4 animate-slide-up max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {t('teams.teamMembers')}: {teams.find(t => t.id === selectedTeam)?.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddMemberModal(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('teams.addMember')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedTeam(null);
                        setTeamMembers([]);
                      }}
                      className="h-8 w-8 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <span className="text-xs text-muted-foreground">
                          {member.role === 'leader' ? t('teams.leader') : t('teams.member')}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="text-destructive"
                      >
                        {t('teams.remove')}
                      </Button>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {t('teams.noMembers')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de adicionar membro */}
        {showAddMemberModal && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-md w-full m-4 animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('teams.addMember')}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddMemberModal(false)}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold">Usuário</label>
                    <select
                      name="user_id"
                      required
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mt-1"
                    >
                      <option value="">Selecione um usuário</option>
                      {users
                        .filter(u => !teamMembers.some(m => m.user_id === u.id))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Função</label>
                    <select
                      name="role"
                      defaultValue="member"
                      className="w-full px-4 py-2.5 bg-background text-foreground border border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all mt-1"
                    >
                      <option value="member">Membro</option>
                      <option value="leader">Líder</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1 bg-primary">
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddMemberModal(false)}
                      className="flex-1"
                    >
                      {t('teams.cancel')}
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
            setTeamToDelete(null);
          }}
          onConfirm={handleDeleteTeam}
          title={t('teams.deleteTeam')}
          description={t('teams.deleteTeamDescription')}
          confirmText={t('teams.delete')}
          cancelText={t('teams.cancel')}
          variant="destructive"
        />
      </div>
    </Layout>
  );
}

