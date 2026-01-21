import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ContasProvider } from "./contexts/ContasContext";
import { LembretesProvider } from "./contexts/LembretesContext";
import NotificacoesMonitor from "./components/NotificacoesMonitor";
import Home from "./pages/Home";
import ListaContas from "./pages/ListaContas";
import FormularioConta from "./pages/FormularioConta";
import CentralLembretes from "./pages/CentralLembretes";
import DetalhesConta from "./pages/DetalhesConta";
import Configuracoes from "./pages/Configuracoes";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/contas"} component={ListaContas} />
      <Route path={"/contas/nova"} component={FormularioConta} />
      <Route path={"/contas/:id/editar"} component={FormularioConta} />
      <Route path={"/contas/:id"} component={DetalhesConta} />
      <Route path={"/lembretes"} component={CentralLembretes} />
      <Route path={"/configuracoes"} component={Configuracoes} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ContasProvider>
          <LembretesProvider>
            <NotificacoesMonitor />
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </LembretesProvider>
        </ContasProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
