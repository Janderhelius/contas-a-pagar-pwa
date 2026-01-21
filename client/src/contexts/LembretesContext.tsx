/**
 * Contexto React para gerenciar lembretes
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lembrete } from '@/lib/types';
import { db } from '@/lib/db';
import { v4 as uuid } from 'uuid';

interface LembretesContextType {
  lembretes: Lembrete[];
  carregando: boolean;
  erro: string | null;
  adicionarLembrete: (lembrete: Omit<Lembrete, 'id' | 'criadoEm' | 'atualizadoEm'>) => Promise<void>;
  atualizarLembrete: (id: string, lembrete: Partial<Lembrete>) => Promise<void>;
  deletarLembrete: (id: string) => Promise<void>;
  deletarLembretesPorConta: (contaId: string) => Promise<void>;
  obterLembretesPorConta: (contaId: string) => Lembrete[];
  obterLembretesAtivos: () => Lembrete[];
  recarregarLembretes: () => Promise<void>;
}

const LembretesContext = createContext<LembretesContextType | undefined>(undefined);

export function LembretesProvider({ children }: { children: React.ReactNode }) {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregarLembretes = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const lembretesDB = await db.lembretes.toArray();
      setLembretes(lembretesDB);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao carregar lembretes';
      setErro(mensagem);
      console.error('Erro ao carregar lembretes:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    recarregarLembretes();
  }, []);

  const adicionarLembrete = async (lembretData: Omit<Lembrete, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    try {
      const novoLembrete: Lembrete = {
        ...lembretData,
        id: uuid(),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      await db.lembretes.add(novoLembrete);
      await recarregarLembretes();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao adicionar lembrete';
      setErro(mensagem);
      throw err;
    }
  };

  const atualizarLembrete = async (id: string, lembretData: Partial<Lembrete>) => {
    try {
      await db.lembretes.update(id, {
        ...lembretData,
        atualizadoEm: new Date(),
      });
      await recarregarLembretes();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao atualizar lembrete';
      setErro(mensagem);
      throw err;
    }
  };

  const deletarLembrete = async (id: string) => {
    try {
      await db.lembretes.delete(id);
      await recarregarLembretes();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao deletar lembrete';
      setErro(mensagem);
      throw err;
    }
  };

  const deletarLembretesPorConta = async (contaId: string) => {
    try {
      const lembretesParaDeletar = await db.lembretes
        .where('contaId')
        .equals(contaId)
        .toArray();

      for (const lembrete of lembretesParaDeletar) {
        await db.lembretes.delete(lembrete.id);
      }

      await recarregarLembretes();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao deletar lembretes';
      setErro(mensagem);
      throw err;
    }
  };

  const obterLembretesPorConta = (contaId: string): Lembrete[] => {
    return lembretes.filter(l => l.contaId === contaId);
  };

  const obterLembretesAtivos = (): Lembrete[] => {
    return lembretes.filter(l => l.ativo);
  };

  const value: LembretesContextType = {
    lembretes,
    carregando,
    erro,
    adicionarLembrete,
    atualizarLembrete,
    deletarLembrete,
    deletarLembretesPorConta,
    obterLembretesPorConta,
    obterLembretesAtivos,
    recarregarLembretes,
  };

  return (
    <LembretesContext.Provider value={value}>
      {children}
    </LembretesContext.Provider>
  );
}

export function useLembretes(): LembretesContextType {
  const context = useContext(LembretesContext);
  if (!context) {
    throw new Error('useLembretes deve ser usado dentro de LembretesProvider');
  }
  return context;
}
