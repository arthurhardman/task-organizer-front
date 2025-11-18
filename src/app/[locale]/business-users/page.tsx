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
import { Users, UserPlus, Trash2, AlertCircle, CheckCircle, X, Mail, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { ConfirmModal } from '@/components/ConfirmModal';

interface BusinessUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_business: boolean;
  team_count: number;
  created_at: string;
}

interface BusinessInvitation {
  id: number;
  email: string;
  created_at: string;
  invited_by_name: string | null;
}

interface BusinessInfo {
  id: number;
  name: string;
  domain: string;
  max_users: number;
  extra_users_count: number;
  currentUserCount: number;
  totalAllowed: number;
  usersOverLimit: number;
  extraUsersNeeded: number;
  extraUsersCost: number;
  canAddMore: boolean;
}

export default function BusinessUsersPage() {
  const t = useTranslations();
  const router = useRouter();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [invitations, setInvitations] = useState<BusinessInvitation[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [extraUsersCount, setExtraUsersCount] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteInviteModal, setShowDeleteInviteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [inviteToDelete, setInviteToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!user.isAdmin) {
      router.push('/dashboard');
      return;
    }

    fetchBusinessInfo();
    fetchUsers();
    fetchInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.isAdmin]);

  const fetchBusinessInfo = async () => {
    try {
      const response = await api.get('/business/info');
      setBusinessInfo(response.data);
    } catch (error) {
      console.error('Error fetching business info:', error);
      toast.error('Erro ao carregar informações da empresa');
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
      toast.error('Erro ao carregar usuários');
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await api.get('/business/users/invitations');
      setInvitations(response.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Erro ao carregar convites');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setInviteLoading(true);
    try {
      await api.post('/business/users/invite', {
        email: inviteEmail,
      });
      
      toast.success('Convite enviado com sucesso! O usuário poderá se registrar com este email.');
      setShowInviteModal(false);
      setInviteEmail('');
      fetchInvitations();
      fetchBusinessInfo();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast.error(error.response?.data?.error || 'Erro ao convidar usuário');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDeleteInvitation = async () => {
    if (!inviteToDelete) return;

    try {
      await api.delete(`/business/users/invitations/${inviteToDelete}`);
      toast.success('Convite removido com sucesso!');
      setShowDeleteInviteModal(false);
      setInviteToDelete(null);
      fetchInvitations();
      fetchBusinessInfo();
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast.error(error.response?.data?.error || 'Erro ao remover convite');
    }
  };

  const handleAddExtraUsers = async () => {
    if (!extraUsersCount || extraUsersCount < 1) {
      toast.error('Número de usuários inválido');
      return;
    }

    try {
      const response = await api.post('/business/users/add-extra', {
        extraUsersCount: parseInt(String(extraUsersCount)),
      });
      
      toast.success(response.data.message || `${extraUsersCount} usuário(s) extra adicionado(s)!`);
      setShowAddExtraModal(false);
      setExtraUsersCount(1);
      fetchBusinessInfo();
    } catch (error: any) {
      console.error('Error adding extra users:', error);
      toast.error(error.response?.data?.error || 'Erro ao adicionar usuários extras');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/business/users/${userToDelete}`);
      toast.success('Usuário removido com sucesso!');
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
      fetchBusinessInfo();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || 'Erro ao remover usuário');
    }
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários da sua empresa</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Informações do Business */}
            {businessInfo && (
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Informações da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Usuários Atuais</p>
                      <p className="text-2xl font-bold">{businessInfo.currentUserCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Limite Base</p>
                      <p className="text-2xl font-bold">{businessInfo.max_users}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Permitido</p>
                      <p className="text-2xl font-bold">{businessInfo.totalAllowed}</p>
                    </div>
                  </div>

                  {businessInfo.usersOverLimit > 0 && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <p className="font-semibold text-yellow-500">
                          {businessInfo.usersOverLimit} usuário(s) acima do limite base
                        </p>
                      </div>
                      {businessInfo.extraUsersNeeded > 0 && (
                        <p className="text-sm text-muted-foreground">
                          É necessário adicionar {businessInfo.extraUsersNeeded} usuário(s) extra.
                          Custo: R$ {businessInfo.extraUsersCost.toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}

                  {!businessInfo.canAddMore && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <X className="w-5 h-5 text-red-500" />
                        <p className="font-semibold text-red-500">
                          Limite de usuários atingido
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Adicione mais usuários extras para permitir novos registros.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowInviteModal(true)}
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Convidar Usuário
                    </Button>
                    <Button
                      onClick={() => setShowAddExtraModal(true)}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      Adicionar Usuários Extras
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Convites Pendentes */}
            {invitations.length > 0 && (
              <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Convites Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-yellow-500" />
                            <p className="font-semibold">{invitation.email}</p>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-600">
                              Pendente
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Convidado em {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                            {invitation.invited_by_name && ` por ${invitation.invited_by_name}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setInviteToDelete(invitation.id);
                            setShowDeleteInviteModal(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Usuários */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle>Usuários da Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((businessUser) => (
                    <div
                      key={businessUser.id}
                      className="flex items-center justify-between p-4 border border-border/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{businessUser.name}</p>
                          {businessUser.is_admin && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-500">
                              Admin
                            </span>
                          )}
                          {businessUser.is_business && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-500">
                              Business
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{businessUser.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {businessUser.team_count} equipe(s) • Registrado em{' '}
                          {new Date(businessUser.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {businessUser.id !== user.id && !businessUser.is_admin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(businessUser.id);
                            setShowDeleteModal(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {users.length === 0 && invitations.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado. Convide usuários para começar!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Modal de adicionar usuários extras */}
        {showAddExtraModal && businessInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-md w-full m-4 animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Adicionar Usuários Extras</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowAddExtraModal(false);
                      setExtraUsersCount(1);
                    }}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">Quantidade de Usuários</label>
                  <Input
                    type="number"
                    min="1"
                    value={extraUsersCount}
                    onChange={(e) => setExtraUsersCount(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cada usuário extra custa R$ 15,00
                  </p>
                </div>
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-semibold text-primary">
                    Custo Total: R$ {(extraUsersCount * 15).toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAddExtraUsers}
                    className="flex-1 bg-primary"
                  >
                    Adicionar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddExtraModal(false);
                      setExtraUsersCount(1);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de convidar usuário */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
            <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-md w-full m-4 animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Convidar Usuário
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                    }}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>
                  Digite o email da pessoa que deseja convidar. Ela poderá se registrar e entrar automaticamente na empresa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inviteEmail && !inviteLoading) {
                        handleInviteUser();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A pessoa receberá acesso à empresa quando se registrar com este email
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleInviteUser}
                    className="flex-1 bg-primary"
                    disabled={inviteLoading || !inviteEmail || !inviteEmail.includes('@')}
                  >
                    {inviteLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Convite'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                    }}
                    className="flex-1"
                    disabled={inviteLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onConfirm={handleDeleteUser}
          title="Confirmar Remoção"
          description="Tem certeza que deseja remover este usuário da empresa? Esta ação não pode ser desfeita."
          confirmText="Remover"
          cancelText="Cancelar"
          variant="destructive"
        />

        <ConfirmModal
          isOpen={showDeleteInviteModal}
          onClose={() => {
            setShowDeleteInviteModal(false);
            setInviteToDelete(null);
          }}
          onConfirm={handleDeleteInvitation}
          title="Confirmar Remoção de Convite"
          description="Tem certeza que deseja remover este convite? A pessoa não poderá mais se registrar com este email na empresa."
          confirmText="Remover"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </Layout>
  );
}

