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
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">Alterações não salvas</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-700">
            Você fez mudanças que ainda não foram salvas. O que deseja fazer?
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 flex-col-reverse sm:flex-row sm:justify-end">
          <Button
            onClick={onContinueEditing}
            variant="outline"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Continuar Editando
          </Button>

          <Button
            onClick={onDiscardAndExit}
            variant="destructive"
            disabled={isLoading}
            className="w-full sm:w-auto gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Sair sem Salvar
          </Button>

          <Button
            onClick={handleSaveClick}
            disabled={isLoading}
            className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Salvando...' : 'Salvar e Sair'}
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
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">Descartar alterações?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-700">
            Você perderá todas as mudanças feitas. Esta ação é irreversível.
          </p>
        </div>

        <DialogFooter className="flex gap-3 flex-col-reverse sm:flex-row sm:justify-end">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            onClick={onConfirmDiscard}
            variant="destructive"
            disabled={isLoading}
            className="w-full sm:w-auto gap-2"
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
