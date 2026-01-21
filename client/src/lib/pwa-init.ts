/**
 * Inicialização do PWA e Service Worker
 */

/**
 * Registra o service worker e inicia monitoramento de notificações
 */
export async function inicializarPWA() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker não suportado neste navegador');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });
    console.log('✓ Service Worker registrado com sucesso:', registration);

    // Verifica atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nova versão do app disponível');
            // Aqui você poderia mostrar um toast pedindo para recarregar
          }
        });
      }
    });

    // Verifica atualizações periodicamente
    setInterval(() => {
      registration.update();
    }, 60000); // A cada 1 minuto
  } catch (erro) {
    console.error('Erro ao registrar Service Worker:', erro);
  }
}

/**
 * Solicita permissão para notificações
 */
export async function solicitarPermissaoNotificacoes(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('Notificações não suportadas neste navegador');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    try {
      const permissao = await Notification.requestPermission();
      return permissao;
    } catch (erro) {
      console.error('Erro ao solicitar permissão:', erro);
      return 'denied';
    }
  }

  return 'denied';
}

/**
 * Verifica se o app está instalado como PWA
 */
export function estaInstalado(): boolean {
  // Verifica se está em modo standalone (instalado como PWA)
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Detecta quando o app é instalado
 */
export function onAppInstalado(callback: () => void) {
  window.addEventListener('beforeinstallprompt', () => {
    // App pode ser instalado
  });

  window.addEventListener('appinstalled', () => {
    console.log('✓ App instalado com sucesso!');
    callback();
  });
}

/**
 * Monitora mudanças de conexão
 */
export function monitorarConexao(
  onOnline: () => void,
  onOffline: () => void
) {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
