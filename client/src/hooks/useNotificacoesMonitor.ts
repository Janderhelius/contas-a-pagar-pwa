/**
 * Hook para monitorar lembretes continuamente e disparar notificações
 */

import { useEffect, useCallback } from 'react';
import { useContas } from '@/contexts/ContasContext';
import { useLembretes } from '@/contexts/LembretesContext';
import { useNotificacoes } from './useNotificacoes';
import { formatarMoeda } from '@/lib/formatadores';

export function useNotificacoesMonitor() {
  const { contas } = useContas();
  const { lembretes, atualizarLembrete } = useLembretes();
  const { exibirNotificacao } = useNotificacoes();

  const verificarEDispararNotificacoes = useCallback(async () => {
    const agora = new Date();
    agora.setSeconds(0, 0); // Remove segundos e milissegundos para comparação por minuto

    for (const lembrete of lembretes) {
      if (!lembrete.ativo || !lembrete.proximaNotificacao) continue;

      const proximaNotificacao = new Date(lembrete.proximaNotificacao);
      proximaNotificacao.setSeconds(0, 0);

      // Se a próxima notificação é agora ou passou
      if (proximaNotificacao <= agora) {
        const conta = contas.find(c => c.id === lembrete.contaId);
        if (!conta) continue;

        // Não notifica contas já pagas
        if (conta.status === 'Pago') continue;

        // Exibe notificação
        await exibirNotificacao(`Conta a Vencer: ${conta.titulo}`, {
          body: `${conta.beneficiario} - ${formatarMoeda(conta.valor)}`,
          tag: `lembrete-${lembrete.id}`,
          requireInteraction: true,
        });

        // Recalcula próxima notificação
        let novaProximaNotificacao = new Date();

        if (lembrete.tipo === 'vencimento') {
          // Próxima notificação é no próximo vencimento (mesmo dia, mesmo horário)
          novaProximaNotificacao = new Date(conta.dataVencimento);
        } else if (lembrete.tipo === 'diasAntes' && lembrete.diasAntes) {
          // Verifica se está atrasado e deve repetir
          if (lembrete.repetirSeAtrasado && agora > conta.dataVencimento) {
            // Se atrasado e repetir ativo, próxima é amanhã no mesmo horário
            novaProximaNotificacao = new Date(agora);
            novaProximaNotificacao.setDate(novaProximaNotificacao.getDate() + 1);
          } else {
            // Próxima notificação é X dias antes do próximo vencimento
            novaProximaNotificacao = new Date(conta.dataVencimento);
            novaProximaNotificacao.setDate(novaProximaNotificacao.getDate() - lembrete.diasAntes);
          }
        }

        // Define o horário
        const [hora, minuto] = lembrete.horario.split(':').map(Number);
        novaProximaNotificacao.setHours(hora, minuto, 0, 0);

        // Atualiza o lembrete com a próxima notificação
        await atualizarLembrete(lembrete.id, {
          proximaNotificacao: novaProximaNotificacao,
        });
      }
    }
  }, [lembretes, contas, exibirNotificacao, atualizarLembrete]);

  // Inicia o monitoramento
  useEffect(() => {
    // Verifica imediatamente
    verificarEDispararNotificacoes();

    // Verifica a cada minuto
    const intervalo = setInterval(() => {
      verificarEDispararNotificacoes();
    }, 60000); // 1 minuto

    return () => clearInterval(intervalo);
  }, [verificarEDispararNotificacoes]);

  return {
    verificarEDispararNotificacoes,
  };
}
