/**
 * Hook useUnsavedChangesGuard
 * Detecta alterações não salvas e bloqueia navegação
 * Gerencia estado "dirty" e oferece opções de salvar/descartar
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'wouter';

export interface UnsavedChangesGuardOptions {
  onSave?: () => Promise<void>;
  onDiscard?: () => void;
  enabled?: boolean;
}

export interface UnsavedChangesGuardState {
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  setDirty: (dirty: boolean) => void;
  handleSaveAndExit: () => Promise<void>;
  handleDiscardAndExit: () => void;
  clearError: () => void;
}

export function useUnsavedChangesGuard(
  options: UnsavedChangesGuardOptions = {}
): UnsavedChangesGuardState {
  const { onSave, onDiscard, enabled = true } = options;
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const pendingNavigationRef = useRef<string | null>(null);
  const shouldAllowNavigationRef = useRef(false);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Salvar e sair
  const handleSaveAndExit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (onSave) {
        await onSave();
      }

      setIsDirty(false);
      shouldAllowNavigationRef.current = true;

      // Navegar para a rota pendente se houver
      if (pendingNavigationRef.current) {
        const destination = pendingNavigationRef.current;
        pendingNavigationRef.current = null;
        setLocation(destination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
      setIsLoading(false);
    }
  }, [onSave, setLocation]);

  // Descartar e sair
  const handleDiscardAndExit = useCallback(() => {
    if (onDiscard) {
      onDiscard();
    }

    setIsDirty(false);
    shouldAllowNavigationRef.current = true;

    // Navegar para a rota pendente se houver
    if (pendingNavigationRef.current) {
      const destination = pendingNavigationRef.current;
      pendingNavigationRef.current = null;
      setLocation(destination);
    }
  }, [onDiscard, setLocation]);

  // Interceptar beforeunload (fechar aba/recarregar)
  useEffect(() => {
    if (!enabled || !isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, enabled]);

  return {
    isDirty,
    isLoading,
    error,
    setDirty: setIsDirty,
    handleSaveAndExit,
    handleDiscardAndExit,
    clearError,
  };
}

/**
 * Hook para gerenciar navegação bloqueada
 * Deve ser usado em conjunto com useUnsavedChangesGuard
 */
export function useBlockedNavigation(isDirty: boolean, enabled: boolean = true) {
  const [, setLocation] = useLocation();
  const pendingNavigationRef = useRef<string | null>(null);
  const shouldAllowNavigationRef = useRef(false);

  const navigateTo = useCallback(
    (path: string) => {
      if (!enabled || !isDirty) {
        setLocation(path);
        return;
      }

      // Bloquear navegação e armazenar destino
      pendingNavigationRef.current = path;
      // Dispara evento customizado que a tela pode ouvir
      window.dispatchEvent(
        new CustomEvent('unsaved-changes-navigation-blocked', {
          detail: { destination: path },
        })
      );
    },
    [isDirty, enabled, setLocation]
  );

  return {
    navigateTo,
    pendingNavigationRef,
    shouldAllowNavigationRef,
  };
}
