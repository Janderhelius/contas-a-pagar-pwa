/**
 * Modal para gerenciar categorias (editar/deletar)
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  obterCategorias,
  obterCategoriasPadrao,
  obterCategoriasPersonalizadas,
  editarCategoria,
  deletarCategoria,
  substituirCategoriaEmContas,
  verificarCategoriaEmUso,
} from '@/lib/categorias';
import { Categoria } from '@/lib/db';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface GerenciarCategoriasModalProps {
  aberto: boolean;
  onClose: () => void;
  onAtualizado: () => void;
}

export function GerenciarCategoriasModal({ aberto, onClose, onAtualizado }: GerenciarCategoriasModalProps) {
  const [categoriasPadrao, setCategoriasPadrao] = useState<Categoria[]>([]);
  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editandoNome, setEditandoNome] = useState('');
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [categoriasEmUso, setCategoriasEmUso] = useState<Record<string, number>>({});
  const [substituindoPor, setSubstituindoPor] = useState<string>('');

  useEffect(() => {
    if (aberto) {
      carregarCategorias();
    }
  }, [aberto]);

  const carregarCategorias = async () => {
    try {
      setCarregando(true);
      const [padrao, personalizadas] = await Promise.all([
        obterCategoriasPadrao(),
        obterCategoriasPersonalizadas(),
      ]);
      setCategoriasPadrao(padrao);
      setCategoriasPersonalizadas(personalizadas);

      // Verificar quais estão em uso
      const emUso: Record<string, number> = {};
      const todas = [...padrao, ...personalizadas];
      for (const cat of todas) {
        const count = await verificarCategoriaEmUso(cat.id);
        if (count > 0) {
          emUso[cat.id] = count;
        }
      }
      setCategoriasEmUso(emUso);
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro);
      toast.error('Erro ao carregar categorias');
    } finally {
      setCarregando(false);
    }
  };

  const handleEditarNome = async (id: string) => {
    if (!editandoNome.trim()) {
      toast.error('Nome não pode estar vazio');
      return;
    }

    try {
      await editarCategoria(id, editandoNome);
      toast.success('Categoria atualizada!');
      setEditandoId(null);
      setEditandoNome('');
      carregarCategorias();
      onAtualizado();
    } catch (erro: any) {
      toast.error(erro.message || 'Erro ao editar categoria');
    }
  };

  const handleDeletarCategoria = async (id: string) => {
    try {
      await deletarCategoria(id);
      toast.success('Categoria deletada!');
      setDeletandoId(null);
      setSubstituindoPor('');
      carregarCategorias();
      onAtualizado();
    } catch (erro: any) {
      toast.error(erro.message || 'Erro ao deletar categoria');
    }
  };

  const handleSubstituirEDeletar = async (id: string, substituirPorId: string) => {
    if (!substituirPorId) {
      toast.error('Selecione uma categoria para substituir');
      return;
    }

    try {
      const count = await substituirCategoriaEmContas(id, substituirPorId);
      toast.success(`${count} conta(s) atualizada(s) e categoria deletada!`);
      setDeletandoId(null);
      setSubstituindoPor('');
      carregarCategorias();
      onAtualizado();
    } catch (erro: any) {
      toast.error(erro.message || 'Erro ao substituir categoria');
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        {carregando ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Categorias Padrão */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Categorias Padrão</h3>
              <div className="space-y-2">
                {categoriasPadrao.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{cat.name}</p>
                      {categoriasEmUso[cat.id] && (
                        <p className="text-xs text-gray-500">
                          Em uso em {categoriasEmUso[cat.id]} conta(s)
                        </p>
                      )}
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Padrão
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorias Personalizadas */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Categorias Personalizadas</h3>
              {categoriasPersonalizadas.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma categoria personalizada criada</p>
              ) : (
                <div className="space-y-2">
                  {categoriasPersonalizadas.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      {editandoId === cat.id ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editandoNome}
                            onChange={(e) => setEditandoNome(e.target.value)}
                            placeholder="Novo nome"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleEditarNome(cat.id)}
                            className="gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditandoId(null);
                              setEditandoNome('');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="font-medium">{cat.name}</p>
                            {categoriasEmUso[cat.id] && (
                              <p className="text-xs text-gray-500">
                                Em uso em {categoriasEmUso[cat.id]} conta(s)
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditandoId(cat.id);
                                setEditandoNome(cat.name);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setDeletandoId(cat.id);
                                setSubstituindoPor('');
                              }}
                              disabled={categoriasEmUso[cat.id] ? true : false}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal de Confirmação de Deleção */}
            {deletandoId && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700">Deletar Categoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoriasEmUso[deletandoId] ? (
                    <>
                      <p className="text-sm">
                        Esta categoria está em uso em <strong>{categoriasEmUso[deletandoId]} conta(s)</strong>.
                      </p>
                      <p className="text-sm">
                        Selecione uma categoria para substituir:
                      </p>
                      <select
                        value={substituindoPor}
                        onChange={(e) => setSubstituindoPor(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">-- Selecione uma categoria --</option>
                        {[...categoriasPadrao, ...categoriasPersonalizadas]
                          .filter(c => c.id !== deletandoId)
                          .map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDeletandoId(null);
                            setSubstituindoPor('');
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleSubstituirEDeletar(deletandoId, substituindoPor)}
                          disabled={!substituindoPor}
                        >
                          Substituir e Deletar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">Tem certeza que deseja deletar esta categoria?</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDeletandoId(null);
                            setSubstituindoPor('');
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeletarCategoria(deletandoId)}
                        >
                          Deletar
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
