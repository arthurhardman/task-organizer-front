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
import { Users, UserPlus, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react';
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
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExtraModal, setShowAddExtraModal] = useState(false);
  const [extraUsersCount, setExtraUsersCount] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

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

                  <Button
                    onClick={() => setShowAddExtraModal(true)}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Usuários Extras
                  </Button>
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
                  {users.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum usuário encontrado
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
      </div>
    </Layout>
  );
}

