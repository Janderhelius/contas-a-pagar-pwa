/**
 * Hook para gerenciar notificações do navegador
 */

import { useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { Lembrete, Conta } from '@/lib/types';

export function useNotificacoes() {
  /**
   * Solicita permissão para notificações
   */
  const solicitarPermissao = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permissao = await Notification.requestPermission();
      return permissao;
    }

    return 'denied';
  }, []);

  /**
   * Exibe uma notificação
   */
  const exibirNotificacao = useCallback(
    async (titulo: string, opcoes?: NotificationOptions) => {
      const permissao = await solicitarPermissao();
      if (permissao === 'granted') {
        new Notification(titulo, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          ...opcoes,
        });
      }
    },
    [solicitarPermissao]
  );

  /**
   * Verifica lembretes e dispara notificações
   */
  const verificarLembretes = useCallback(async () => {
    try {
      const lembretes = await db.lembretes.toArray();
      const lembretesAtivos = lembretes.filter(l => l.ativo);
      const agora = new Date();

      for (const lembrete of lembretesAtivos) {
        if (!lembrete.proximaNotificacao) continue;

        const proximaNotificacao = new Date(lembrete.proximaNotificacao);

        // Se a próxima notificação é agora ou passou
        if (proximaNotificacao <= agora) {
          const conta = await db.contas.get(lembrete.contaId);
          if (conta && conta.status !== 'Pago') {
            // Exibe notificação
            await exibirNotificacao(`Conta a Vencer: ${conta.titulo}`, {
              body: `${conta.beneficiario} - ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(conta.valor)}`,
              tag: `lembrete-${lembrete.id}`,
              requireInteraction: true,
            });

            // Recalcula próxima notificação
            await recalcularProximaNotificacao(lembrete, conta);
          }
        }
      }
    } catch (erro) {
      console.error('Erro ao verificar lembretes:', erro);
    }
  }, [exibirNotificacao]);

  /**
   * Recalcula a próxima data de notificação
   */
  const recalcularProximaNotificacao = useCallback(
    async (lembrete: Lembrete, conta: Conta) => {
      let proximaNotificacao = new Date();

      if (lembrete.tipo === 'vencimento') {
        // Próxima notificação é no próximo vencimento
        proximaNotificacao = new Date(conta.dataVencimento);
      } else if (lembrete.tipo === 'diasAntes' && lembrete.diasAntes) {
        // Se estiver atrasado e repetirSeAtrasado, próxima é amanhã
        if (lembrete.repetirSeAtrasado && new Date() > conta.dataVencimento) {
          proximaNotificacao = new Date();
          proximaNotificacao.setDate(proximaNotificacao.getDate() + 1);
        } else {
          // Próxima notificação é X dias antes do próximo vencimento
          proximaNotificacao = new Date(conta.dataVencimento);
          proximaNotificacao.setDate(proximaNotificacao.getDate() - lembrete.diasAntes);
        }
      }

      // Define o horário
      const [hora, minuto] = lembrete.horario.split(':').map(Number);
      proximaNotificacao.setHours(hora, minuto, 0, 0);

      await db.lembretes.update(lembrete.id, {
        proximaNotificacao,
        atualizadoEm: new Date(),
      });
    },
    []
  );

  /**
   * Inicia o monitoramento de lembretes
   */
  const iniciarMonitoramento = useCallback(() => {
    // Verifica a cada minuto
    const intervalo = setInterval(() => {
      verificarLembretes();
    }, 60000); // 1 minuto

    // Verifica imediatamente ao iniciar
    verificarLembretes();

    return () => clearInterval(intervalo);
  }, [verificarLembretes]);

  /**
   * Registra o service worker
   */
  const registrarServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registrado:', registration);
        return registration;
      } catch (erro) {
        console.error('Erro ao registrar Service Worker:', erro);
      }
    }
  }, []);

  return {
    solicitarPermissao,
    exibirNotificacao,
    verificarLembretes,
    iniciarMonitoramento,
    registrarServiceWorker,
  };
}
