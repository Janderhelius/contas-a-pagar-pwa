import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { inicializarPWA, solicitarPermissaoNotificacoes } from "./lib/pwa-init";
import { seedCategoriasPadrao } from "./lib/db";

// Inicializa categorias padrão (seed robusto)
seedCategoriasPadrao().catch(erro => {
  console.error('Erro ao inicializar categorias padrão:', erro);
});

// Inicializa PWA
inicializarPWA();

// Solicita permissão para notificações
solicitarPermissaoNotificacoes();

createRoot(document.getElementById("root")!).render(<App />);
