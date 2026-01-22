/**
 * Componente DraftRecoveryDialog - Oferece opção de recuperar rascunho salvo
 */

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatarDataHora } from '@/lib/formatadores';

export interface DraftRecoveryDialogProps {
  aberto: boolean;
  ultimoSalvo?: Date;
  onRecuperar: () => void;
  onDescartar: () => void;
}

export function DraftRecoveryDialog({
  aberto,
  ultimoSalvo,
  onRecuperar,
  onDescartar,
}: DraftRecoveryDialogProps) {
  return (
    <AlertDialog open={aberto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rascunho Encontrado</AlertDialogTitle>
          <AlertDialogDescription>
            Encontramos um rascunho salvo automaticamente em {ultimoSalvo ? formatarDataHora(ultimoSalvo) : 'um momento anterior'}.
            <br />
            <br />
            Deseja recuperar as alterações?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end">
          <AlertDialogCancel onClick={onDescartar}>
            Descartar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onRecuperar} className="bg-blue-600 hover:bg-blue-700">
            Recuperar Rascunho
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Componente DraftAutoSaveIndicator - Mostra status do auto-save
 */
export interface DraftAutoSaveIndicatorProps {
  salvando: boolean;
  ultimoSalvo?: Date;
}

export function DraftAutoSaveIndicator({
  salvando,
  ultimoSalvo,
}: DraftAutoSaveIndicatorProps) {
  if (!salvando && !ultimoSalvo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-md p-3 text-sm">
      <div className="flex items-center gap-2">
        {salvando ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Salvando rascunho...</span>
          </>
        ) : ultimoSalvo ? (
          <>
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-600">
              Rascunho salvo em {ultimoSalvo.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
