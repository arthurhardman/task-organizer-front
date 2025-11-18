'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Plus, Trash2, X, Save } from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { ConfirmModal } from './ConfirmModal';

interface KanbanColumn {
  id: number;
  name: string;
  status_id: string;
  position: number;
  color: string;
}

interface KanbanColumnsConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onColumnsUpdated: () => void;
}

export function KanbanColumnsConfig({ isOpen, onClose, onColumnsUpdated }: KanbanColumnsConfigProps) {
  const t = useTranslations();
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnStatusId, setNewColumnStatusId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchColumns();
    }
  }, [isOpen]);

  const fetchColumns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/kanban/columns');
      setColumns(response.data);
    } catch (error) {
      console.error('Error fetching columns:', error);
      toast.error(t('kanban.errorLoadingColumns') || 'Erro ao carregar colunas');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveColumn = async (column: KanbanColumn) => {
    try {
      // Buscar a coluna original para preservar o position
      const originalColumn = columns.find(c => c.id === column.id);
      
      // Quando editamos apenas nome e cor, não precisamos enviar position
      // O position só é atualizado quando reordenamos as colunas
      const updateData: { name: string; color: string } = {
        name: column.name,
        color: column.color,
      };
      
      // Não enviar position ao editar - ele será preservado no banco
      // Apenas enviamos position quando reordenamos explicitamente
      
      await api.put(`/kanban/columns/${column.id}`, updateData);
      toast.success(t('kanban.columnUpdated') || 'Coluna atualizada!');
      setEditingColumn(null);
      fetchColumns();
    } catch (error: any) {
      console.error('Error updating column:', error);
      toast.error(error.response?.data?.error || t('kanban.errorUpdatingColumn') || 'Erro ao atualizar coluna');
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !newColumnStatusId.trim()) {
      toast.error(t('kanban.fillAllFields') || 'Preencha todos os campos');
      return;
    }

    // Verificar se já existe uma coluna com esse status_id
    if (columns.some(col => col.status_id === newColumnStatusId)) {
      toast.error(t('kanban.statusIdExists') || 'Já existe uma coluna com esse ID de status');
      return;
    }

    try {
      setSaving(true);
      await api.post('/kanban/columns', {
        name: newColumnName,
        status_id: newColumnStatusId,
        position: columns.length,
        color: '#3b82f6',
      });
      toast.success(t('kanban.columnCreated') || 'Coluna criada!');
      setNewColumnName('');
      setNewColumnStatusId('');
      fetchColumns();
      onColumnsUpdated();
    } catch (error: any) {
      console.error('Error creating column:', error);
      toast.error(error.response?.data?.error || t('kanban.errorCreatingColumn') || 'Erro ao criar coluna');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (columnId: number) => {
    setColumnToDelete(columnId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!columnToDelete) return;

    try {
      await api.delete(`/kanban/columns/${columnToDelete}`);
      toast.success(t('kanban.columnDeleted') || 'Coluna excluída!');
      fetchColumns();
      onColumnsUpdated();
    } catch (error: any) {
      console.error('Error deleting column:', error);
      toast.error(error.response?.data?.error || t('kanban.errorDeletingColumn') || 'Erro ao excluir coluna');
    } finally {
      setColumnToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleReorder = async (newColumns: KanbanColumn[]) => {
    setColumns(newColumns);
    
    try {
      // Garantir que todos os valores são números válidos
      const columnsToUpdate: Array<{ id: number; position: number }> = [];
      
      for (let index = 0; index < newColumns.length; index++) {
        const col = newColumns[index];
        
        // Validar que id existe e é válido
        if (col.id === undefined || col.id === null) {
          console.error('Coluna sem ID:', col);
          throw new Error(`Coluna sem ID na posição ${index}`);
        }
        
        // Converter id para número
        const id = typeof col.id === 'number' 
          ? col.id 
          : typeof col.id === 'string' 
            ? parseInt(col.id, 10)
            : Number(col.id);
        
        // Validar id
        if (isNaN(id) || id <= 0) {
          console.error('ID inválido:', col.id, 'convertido para:', id);
          throw new Error(`ID inválido: ${col.id} (convertido para ${id})`);
        }
        
        // Position é o índice
        const position = index;
        
        if (isNaN(position) || position < 0) {
          console.error('Position inválido:', position);
          throw new Error(`Position inválido: ${position}`);
        }
        
        columnsToUpdate.push({ id, position });
      }
      
      console.log('Enviando colunas para reordenação:', columnsToUpdate);
      
      await api.put('/kanban/columns/reorder', {
        columns: columnsToUpdate,
      });
      toast.success(t('kanban.columnsReordered') || 'Ordem das colunas atualizada!');
      onColumnsUpdated();
    } catch (error: any) {
      console.error('Error reordering columns:', error);
      console.error('Dados que causaram o erro:', newColumns);
      toast.error(error.response?.data?.error || t('kanban.errorReordering') || 'Erro ao reordenar colunas');
      fetchColumns(); // Reverter em caso de erro
    }
  };

  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newColumns.length) return;

    [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
    handleReorder(newColumns);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in">
        <Card className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl max-w-2xl w-full m-4 animate-slide-up max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{t('kanban.configureColumns') || 'Configurar Colunas'}</CardTitle>
                <CardDescription className="mt-1">
                  {t('kanban.configureColumnsDescription') || 'Personalize as colunas do seu Kanban'}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Lista de colunas existentes */}
                <div className="space-y-3">
                  {columns.map((column, index) => (
                    <div
                      key={column.id}
                      className="p-4 border border-border/50 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                    >
                      {editingColumn?.id === column.id ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                            <Input
                              value={editingColumn.name}
                              onChange={(e) =>
                                setEditingColumn({ ...editingColumn, name: e.target.value })
                              }
                              className="flex-1"
                              placeholder={t('kanban.columnName') || 'Nome da coluna'}
                            />
                            <Input
                              type="color"
                              value={editingColumn.color}
                              onChange={(e) =>
                                setEditingColumn({ ...editingColumn, color: e.target.value })
                              }
                              className="w-16 h-10"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {t('kanban.statusId') || 'ID de Status'}: {column.status_id}
                            </span>
                            <div className="flex-1" />
                            <Button
                              size="sm"
                              onClick={() => handleSaveColumn(editingColumn)}
                              className="bg-primary"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              {t('common.save')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingColumn(null)}
                            >
                              {t('common.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: column.color }}
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{column.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('kanban.statusId') || 'ID'}: {column.status_id}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveColumn(index, 'up')}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveColumn(index, 'down')}
                              disabled={index === columns.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              ↓
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingColumn(column)}
                              className="h-8 w-8 p-0"
                            >
                              ✏️
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(column.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Formulário para criar nova coluna */}
                <div className="p-4 border border-border/50 rounded-lg bg-muted/30 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t('kanban.addColumn') || 'Adicionar Coluna'}
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder={t('kanban.columnName') || 'Nome da coluna'}
                      className="flex-1"
                    />
                    <Input
                      value={newColumnStatusId}
                      onChange={(e) => setNewColumnStatusId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder={t('kanban.statusIdPlaceholder') || 'ID (ex: pendente)'}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCreateColumn}
                      disabled={saving || !newColumnName.trim() || !newColumnStatusId.trim()}
                      className="bg-primary"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('kanban.statusIdHint') || 'O ID deve ser único e será usado como status das tarefas'}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setColumnToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t('kanban.confirmDeleteColumn') || 'Confirmar Exclusão'}
        description={t('kanban.confirmDeleteColumnDescription') || 'Tem certeza que deseja excluir esta coluna? As tarefas com este status não serão afetadas, mas você não poderá mais usar esta coluna no Kanban.'}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
      />
    </>
  );
}

