/**
 * Hook para salvar rascunhos automaticamente a cada 30 segundos
 * Permite recuperar alterações não salvas em caso de fechamento inesperado
 */

import { useEffect, useRef, useState } from 'react';
import { salvarRascunho, obterRascunho, deletarRascunho } from '@/lib/db';

export interface UseDraftAutoSaveOptions {
  rascunhoId: string; // ID único do rascunho (ex: 'formularioConta', 'detalhesConta')
  dados: Record<string, any>; // Dados a serem salvos
  ativo: boolean; // Se deve salvar automaticamente
  intervalo?: number; // Intervalo em ms (padrão: 30000ms = 30s)
  onSalvo?: () => void; // Callback quando salvo
}

export interface UseDraftAutoSaveReturn {
  salvando: boolean;
  ultimoSalvo?: Date;
  temRascunho: boolean;
  recuperarRascunho: () => Promise<Record<string, any> | null>;
  limparRascunho: () => Promise<void>;
}

/**
 * Hook que salva dados automaticamente a cada 30 segundos
 */
export function useDraftAutoSave({
  rascunhoId,
  dados,
  ativo,
  intervalo = 30000, // 30 segundos
  onSalvo,
}: UseDraftAutoSaveOptions): UseDraftAutoSaveReturn {
  const [salvando, setSalvando] = useState(false);
  const [ultimoSalvo, setUltimoSalvo] = useState<Date | undefined>();
  const [temRascunho, setTemRascunho] = useState(false);
  const intervaloRef = useRef<NodeJS.Timeout | null>(null);
  const ultimosDadosRef = useRef<string>('');

  // Verificar se existe rascunho ao montar
  useEffect(() => {
    const verificarRascunho = async () => {
      const rascunho = await obterRascunho(rascunhoId);
      setTemRascunho(!!rascunho);
    };

    verificarRascunho();
  }, [rascunhoId]);

  // Salvar rascunho automaticamente
  useEffect(() => {
    if (!ativo) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
      return;
    }

    // Função para salvar
    const salvar = async () => {
      try {
        const dadosString = JSON.stringify(dados);
        
        // Só salva se os dados mudaram
        if (dadosString !== ultimosDadosRef.current) {
          setSalvando(true);
          await salvarRascunho(rascunhoId, dados);
          ultimosDadosRef.current = dadosString;
          setUltimoSalvo(new Date());
          setTemRascunho(true);
          
          if (onSalvo) {
            onSalvo();
          }
        }
      } catch (erro) {
        console.error('Erro ao salvar rascunho automaticamente:', erro);
      } finally {
        setSalvando(false);
      }
    };

    // Salvar imediatamente na primeira vez
    salvar();

    // Configurar intervalo para salvar periodicamente
    intervaloRef.current = setInterval(salvar, intervalo);

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
    };
  }, [ativo, dados, rascunhoId, intervalo, onSalvo]);

  // Recuperar rascunho
  const recuperarRascunho = async (): Promise<Record<string, any> | null> => {
    try {
      const rascunho = await obterRascunho(rascunhoId);
      return rascunho?.dados || null;
    } catch (erro) {
      console.error('Erro ao recuperar rascunho:', erro);
      return null;
    }
  };

  // Limpar rascunho após salvar com sucesso
  const limparRascunho = async (): Promise<void> => {
    try {
      await deletarRascunho(rascunhoId);
      setTemRascunho(false);
      ultimosDadosRef.current = '';
    } catch (erro) {
      console.error('Erro ao limpar rascunho:', erro);
    }
  };

  return {
    salvando,
    ultimoSalvo,
    temRascunho,
    recuperarRascunho,
    limparRascunho,
  };
}
