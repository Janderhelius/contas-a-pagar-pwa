/**
 * Componente que monitora lembretes e dispara notificações
 * Executa em background enquanto o app está aberto
 */

import { useNotificacoesMonitor } from '@/hooks/useNotificacoesMonitor';

export default function NotificacoesMonitor() {
  // Inicia o monitoramento de notificações
  useNotificacoesMonitor();

  // Este componente não renderiza nada, apenas monitora
  return null;
}
