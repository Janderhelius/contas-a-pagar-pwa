import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { inicializarPWA, solicitarPermissaoNotificacoes } from "./lib/pwa-init";

// Inicializa PWA
inicializarPWA();

// Solicita permissão para notificações
solicitarPermissaoNotificacoes();

createRoot(document.getElementById("root")!).render(<App />);
