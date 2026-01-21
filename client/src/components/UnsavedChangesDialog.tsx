/**
 * Componente UnsavedChangesDialog
 * Modais para confirmar saída sem salvar
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save, Trash2 } from 'lucide-react';

export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  error?: string | null;
  onSaveAndExit: () => Promise<void>;
  onDiscardAndExit: () => void;
  onContinueEditing: () => void;
  onClearError?: () => void;
}

export function UnsavedChangesDialog({
  isOpen,
  isLoading = false,
  error = null,
  onSaveAndExit,
  onDiscardAndExit,
  onContinueEditing,
  onClearError,
}: UnsavedChangesDialogProps) {
  const handleSaveClick = async () => {
    try {
      await onSaveAndExit();
    } catch (err) {
      // Erro já é tratado no hook
      console.error('Erro ao salvar:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onContinueEditing();
        if (onClearError) onClearError();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <DialogTitle>Alterações não salvas</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Você fez mudanças que ainda não foram salvas. O que deseja fazer?
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 flex-row-reverse">
          <Button
            onClick={onContinueEditing}
            variant="outline"
            disabled={isLoading}
          >
            Continuar Editando
          </Button>

          <Button
            onClick={handleSaveClick}
            disabled={isLoading}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Salvando...' : 'Salvar e Sair'}
          </Button>

          <Button
            onClick={onDiscardAndExit}
            variant="destructive"
            disabled={isLoading}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Sair sem Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Componente ConfirmDiscardDialog
 * Confirmação extra antes de descartar alterações
 */
export interface ConfirmDiscardDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  onConfirmDiscard: () => void;
  onCancel: () => void;
}

export function ConfirmDiscardDialog({
  isOpen,
  isLoading = false,
  onConfirmDiscard,
  onCancel,
}: ConfirmDiscardDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onCancel();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <DialogTitle>Descartar alterações?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Você perderá todas as mudanças feitas. Esta ação é irreversível.
          </p>
        </div>

        <DialogFooter className="flex gap-2 flex-row-reverse">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Cancelar
          </Button>

          <Button
            onClick={onConfirmDiscard}
            variant="destructive"
            disabled={isLoading}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? 'Descartando...' : 'Descartar e Sair'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Componente UnsavedIndicator
 * Indicador visual no topo da página
 */
export interface UnsavedIndicatorProps {
  isDirty: boolean;
  isSaving?: boolean;
}

export function UnsavedIndicator({ isDirty, isSaving = false }: UnsavedIndicatorProps) {
  if (!isDirty && !isSaving) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center gap-2">
      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
      <span className="text-sm text-yellow-800 font-medium">
        {isSaving ? 'Salvando...' : 'Não salvo'}
      </span>
    </div>
  );
}
