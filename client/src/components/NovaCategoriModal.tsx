/**
 * Modal para criar nova categoria
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { criarCategoria } from '@/lib/categorias';
import { Categoria } from '@/lib/db';

interface NovaCategoriModalProps {
  aberto: boolean;
  onClose: () => void;
  onCriada: (categoria: Categoria) => void;
}

export function NovaCategoriModal({ aberto, onClose, onCriada }: NovaCategoriModalProps) {
  const [nome, setNome] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Digite um nome para a categoria');
      return;
    }

    if (nome.trim().length < 2) {
      setErro('Nome deve ter pelo menos 2 caracteres');
      return;
    }

    try {
      setCarregando(true);
      const novaCategoria = await criarCategoria(nome);
      if (novaCategoria) {
        toast.success('Categoria criada com sucesso!');
        onCriada(novaCategoria);
        setNome('');
        onClose();
      }
    } catch (erro: any) {
      setErro(erro.message || 'Erro ao criar categoria');
      toast.error(erro.message || 'Erro ao criar categoria');
    } finally {
      setCarregando(false);
    }
  };

  const handleClose = () => {
    setNome('');
    setErro('');
    onClose();
  };

  return (
    <Dialog open={aberto} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nomeCat">Nome da Categoria</Label>
            <Input
              id="nomeCat"
              placeholder="Ex: Internet, Gym, Seguros..."
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErro('');
              }}
              disabled={carregando}
              autoFocus
              className="mt-1"
            />
            {erro && <p className="text-sm text-red-600 mt-1">{erro}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={carregando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={carregando || !nome.trim()}>
              {carregando ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
