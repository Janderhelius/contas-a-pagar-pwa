/**
 * Contexto React para gerenciar contas
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Conta, StatusConta } from '@/lib/types';
import { db, inicializarConfiguracoesDefault } from '@/lib/db';

interface ContasContextType {
  contas: Conta[];
  carregando: boolean;
  erro: string | null;
  adicionarConta: (conta: Omit<Conta, 'id' | 'criadoEm' | 'atualizadoEm'>) => Promise<void>;
  atualizarConta: (id: string, conta: Partial<Conta>) => Promise<void>;
  deletarConta: (id: string) => Promise<void>;
  obterConta: (id: string) => Conta | undefined;
  obterContasPorStatus: (status: StatusConta) => Conta[];
  obterContasVencidas: () => Conta[];
  obterContasProximas: (dias: number) => Conta[];
  recarregarContas: () => Promise<void>;
}

const ContasContext = createContext<ContasContextType | undefined>(undefined);

export function ContasProvider({ children }: { children: React.ReactNode }) {
  const [contas, setContas] = useState<Conta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Carrega contas do banco de dados
  const recarregarContas = async () => {
    try {
      setCarregando(true);
      setErro(null);
      await inicializarConfiguracoesDefault();
      
      const contasDB = await db.contas.toArray();
      
      // Atualiza status das contas baseado na data atual
      const contasAtualizadas = contasDB.map(conta => {
        const novoStatus = calcularStatus(conta);
        if (novoStatus !== conta.status) {
          db.contas.update(conta.id, { status: novoStatus });
        }
        return { ...conta, status: novoStatus };
      });

      setContas(contasAtualizadas);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao carregar contas';
      setErro(mensagem);
      console.error('Erro ao carregar contas:', err);
    } finally {
      setCarregando(false);
    }
  };

  // Carrega contas ao montar o componente
  useEffect(() => {
    recarregarContas();
  }, []);

  const adicionarConta = async (contaData: Omit<Conta, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    try {
      const { v4: uuid } = await import('uuid');
      const novaConta: Conta = {
        ...contaData,
        id: uuid(),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      await db.contas.add(novaConta);
      await recarregarContas();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao adicionar conta';
      setErro(mensagem);
      throw err;
    }
  };

  const atualizarConta = async (id: string, contaData: Partial<Conta>) => {
    try {
      await db.contas.update(id, {
        ...contaData,
        atualizadoEm: new Date(),
      });
      await recarregarContas();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao atualizar conta';
      setErro(mensagem);
      throw err;
    }
  };

  const deletarConta = async (id: string) => {
    try {
      // Deleta lembretes associados
      const lembretes = await db.lembretes.where('contaId').equals(id).toArray();
      for (const lembrete of lembretes) {
        await db.lembretes.delete(lembrete.id);
      }

      // Deleta a conta
      await db.contas.delete(id);
      await recarregarContas();
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro ao deletar conta';
      setErro(mensagem);
      throw err;
    }
  };

  const obterConta = (id: string): Conta | undefined => {
    return contas.find(c => c.id === id);
  };

  const obterContasPorStatus = (status: StatusConta): Conta[] => {
    return contas.filter(c => c.status === status);
  };

  const obterContasVencidas = (): Conta[] => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return contas.filter(c => 
      c.dataVencimento < hoje && 
      c.status !== 'Pago'
    );
  };

  const obterContasProximas = (dias: number): Conta[] => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataLimite = new Date(hoje);
    dataLimite.setDate(dataLimite.getDate() + dias);

    return contas.filter(c =>
      c.dataVencimento >= hoje &&
      c.dataVencimento <= dataLimite &&
      c.status !== 'Pago'
    ).sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());
  };

  const value: ContasContextType = {
    contas,
    carregando,
    erro,
    adicionarConta,
    atualizarConta,
    deletarConta,
    obterConta,
    obterContasPorStatus,
    obterContasVencidas,
    obterContasProximas,
    recarregarContas,
  };

  return (
    <ContasContext.Provider value={value}>
      {children}
    </ContasContext.Provider>
  );
}

export function useContas(): ContasContextType {
  const context = useContext(ContasContext);
  if (!context) {
    throw new Error('useContas deve ser usado dentro de ContasProvider');
  }
  return context;
}

/**
 * Calcula o status de uma conta baseado na data atual
 */
function calcularStatus(conta: Conta): StatusConta {
  if (conta.dataPagamento) {
    return 'Pago';
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(conta.dataVencimento);
  vencimento.setHours(0, 0, 0, 0);

  if (hoje > vencimento) {
    return 'Atrasado';
  }

  return 'Pendente';
}
