# Meu Controle de Contas - Documentação Completa

## 📋 Visão Geral

**Meu Controle de Contas** é um aplicativo Web + PWA (Progressive Web App) para gerenciar contas a pagar com lembretes e notificações. Totalmente privado, com armazenamento local no navegador (IndexedDB) e sem sincronização com servidores externos.

**Características principais:**
- ✅ CRUD completo de contas a pagar
- ✅ Sistema de lembretes com notificações
- ✅ Dashboard com estatísticas e gráficos
- ✅ Importação/exportação de dados (JSON)
- ✅ Proteção por senha/PIN
- ✅ PWA instalável em Mac/PC/Mobile
- ✅ Funciona offline
- ✅ 100% privado - dados locais

---

## 🏗️ Arquitetura

### Stack Tecnológico

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| **Frontend** | React 19 + TypeScript | Interface moderna e responsiva |
| **Styling** | Tailwind CSS 4 | Design system e utilitários |
| **UI Components** | shadcn/ui + Radix UI | Componentes acessíveis e reutilizáveis |
| **Armazenamento** | IndexedDB (Dexie.js) | Banco de dados local no navegador |
| **Roteamento** | Wouter | Roteamento client-side leve |
| **Notificações** | Web Notifications API | Notificações do navegador |
| **PWA** | Service Worker | Funcionalidade offline e instalação |
| **Gráficos** | Recharts | Visualizações de dados |

### Estrutura de Pastas

```
contas-a-pagar-pwa/
├── client/
│   ├── public/
│   │   ├── manifest.json          # Configuração PWA
│   │   ├── service-worker.js      # Service Worker
│   │   ├── icon-192.png           # Ícone PWA 192x192
│   │   ├── icon-512.png           # Ícone PWA 512x512
│   │   └── index.html             # HTML principal
│   ├── src/
│   │   ├── components/
│   │   │   ├── NotificacoesMonitor.tsx    # Monitor de lembretes
│   │   │   └── [outros componentes UI]
│   │   ├── contexts/
│   │   │   ├── ContasContext.tsx          # Gerenciamento de contas
│   │   │   ├── LembretesContext.tsx       # Gerenciamento de lembretes
│   │   │   └── ThemeContext.tsx           # Tema da aplicação
│   │   ├── hooks/
│   │   │   ├── useNotificacoes.ts         # Hook para notificações
│   │   │   └── useNotificacoesMonitor.ts  # Hook para monitoramento
│   │   ├── lib/
│   │   │   ├── db.ts                      # Configuração Dexie.js
│   │   │   ├── types.ts                   # Tipos TypeScript
│   │   │   ├── formatadores.ts            # Funções de formatação
│   │   │   ├── validacoes.ts              # Validações
│   │   │   ├── crypto.ts                  # Criptografia (senha)
│   │   │   ├── pwa-init.ts                # Inicialização PWA
│   │   │   └── dados-exemplo.ts           # Dados de demonstração
│   │   ├── pages/
│   │   │   ├── Home.tsx                   # Dashboard principal
│   │   │   ├── ListaContas.tsx            # Lista de contas
│   │   │   ├── FormularioConta.tsx        # Criar/editar conta
│   │   │   ├── CentralLembretes.tsx       # Gerenciar lembretes
│   │   │   └── Configuracoes.tsx          # Configurações
│   │   ├── App.tsx                        # Componente raiz
│   │   ├── main.tsx                       # Entry point
│   │   └── index.css                      # Estilos globais
│   └── package.json
├── DOCUMENTACAO.md                        # Esta documentação
├── ARQUITETURA.md                         # Detalhes técnicos
└── README.md                              # Guia rápido
```

---

## 📊 Schema de Dados

### Tabela: Contas

Armazena informações sobre contas a pagar.

```typescript
interface Conta {
  id: string;                    // UUID único
  titulo: string;                // Nome da conta (ex: "Aluguel")
  categoria: string;             // Categoria (Moradia, Cartão, Serviços, etc)
  valor: number;                 // Valor em BRL
  dataEmissao: Date;            // Data de emissão
  dataVencimento: Date;         // Data de vencimento
  observacoes?: string;         // Notas adicionais
  status: 'Pendente' | 'Pago' | 'Atrasado'; // Status
  dataPagamento?: Date;         // Data em que foi pago
  valorPago?: number;           // Valor realmente pago
  observacaoPagamento?: string; // Notas sobre pagamento
  
  // Recorrência
  recorrencia: {
    tipo: 'Nenhuma' | 'Mensal' | 'Semanal' | 'Anual' | 'Personalizada';
    diasIntervalo?: number;     // Para recorrência personalizada
  };
  
  // Pagamento
  formaPagamento: 'PIX' | 'Boleto' | 'Cartão' | 'Dinheiro' | 'Transferência' | 'Outro';
  beneficiario: string;         // Quem recebe (empresa/pessoa)
  linkCodigo?: string;          // Código de barras ou PIX copia e cola
  comprovante?: Blob;           // Upload opcional de comprovante
  
  // Metadados
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Tabela: Lembretes

Armazena configurações de lembretes para contas.

```typescript
interface Lembrete {
  id: string;                    // UUID único
  contaId: string;              // Referência à conta
  
  // Tipo de lembrete
  tipo: 'vencimento' | 'diasAntes';
  diasAntes?: number;           // Dias antes do vencimento (1,2,3,5,7,10,15,30)
  
  // Configuração
  horario: string;              // HH:MM (ex: "09:00")
  ativo: boolean;               // Se o lembrete está ativo
  repetirSeAtrasado: boolean;   // Repetir diariamente se atrasado
  
  // Próxima notificação
  proximaNotificacao?: Date;    // Próxima data/hora para notificar
  
  // Metadados
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Tabela: Configuracoes

Armazena configurações globais da aplicação.

```typescript
interface Configuracoes {
  id: 'config';                  // ID fixo
  senha?: string;               // Hash da senha (bcrypt-like)
  notificacoesAtivas: boolean;  // Se notificações estão ativas
  temaEscuro: boolean;          // Tema escuro/claro
  atualizadoEm: Date;
}
```

---

## 🔧 Funcionalidades Detalhadas

### 1. CRUD de Contas

**Criar Conta:**
- Acesse "Nova Conta" ou clique no botão "+ Nova Conta"
- Preencha todos os campos obrigatórios
- Configure lembretes (opcional)
- Salve

**Listar Contas:**
- Página "Ver Todas as Contas" mostra todas as contas
- Filtros: categoria, período, status, valor min/max
- Ordenação: vencimento (padrão), valor, categoria
- Busca por texto

**Editar Conta:**
- Clique em uma conta na lista
- Modifique os dados
- Salve

**Deletar Conta:**
- Clique em uma conta
- Botão "Deletar"
- Confirme

### 2. Sistema de Lembretes

**Configurar Lembretes:**
- Ao criar/editar conta, seção "Lembretes"
- Escolha tipo: "No vencimento" ou "X dias antes"
- Defina horário (HH:MM)
- Ative/desative conforme necessário
- Opção: repetir diariamente se atrasado

**Central de Lembretes:**
- Visualize todos os lembretes configurados
- Ative/desative lembretes
- Delete lembretes
- Veja próxima data de notificação

**Notificações:**
- Quando o app está aberto, verifica a cada minuto
- Dispara notificação do navegador (se permitido)
- Fallback: alerta dentro do app
- Clique na notificação para abrir a conta

### 3. Dashboard

**Estatísticas:**
- Total a pagar no mês
- Total atrasado
- Total pago no mês
- Lembretes ativos

**Gráficos:**
- Próximos 30 vencimentos (cards por data)
- Distribuição por categoria (pizza)
- Histórico de pagamentos

**Atalhos:**
- "Ver Todas as Contas"
- "Central de Lembretes"
- "Configurações"

### 4. Importação/Exportação

**Exportar:**
- Configurações → "Exportar como JSON"
- Baixa arquivo com data: `contas-backup-YYYY-MM-DD.json`
- Contém: contas, lembretes, configurações

**Importar:**
- Configurações → "Importar Dados"
- Selecione arquivo JSON
- Confirme (substitui dados existentes)
- App recarrega automaticamente

### 5. Proteção por Senha

**Configurar:**
- Configurações → "Segurança"
- Defina nova senha (mínimo 4 caracteres)
- Confirme

**Usar:**
- Ao abrir o app, se houver senha, pede para desbloquear
- Senha protege apenas acesso local (não é sincronizada)

---

## 📱 PWA - Instalação e Uso

### Como Instalar

**No Chrome/Edge (Windows/Mac):**
1. Abra o app no navegador
2. Clique no ícone de instalação (canto superior direito)
3. "Instalar"
4. O app abre em janela separada

**No Safari (Mac/iPhone):**
1. Abra o app no Safari
2. Menu "Compartilhar" → "Adicionar à Tela de Início"
3. Nomeie e adicione
4. O app abre como app nativo

**No Android:**
1. Abra no Chrome
2. Menu (⋮) → "Instalar app"
3. O app é instalado na home screen

### Funcionalidades PWA

**Offline:**
- App funciona sem internet
- Dados são salvos localmente
- Sincroniza quando volta online

**Notificações:**
- Funciona em background
- Lembretes disparam mesmo com app fechado
- Clique abre o app

**Atalhos:**
- Clique longo no ícone (Android/Windows)
- "Nova Conta" - atalho rápido
- "Ver Contas" - atalho rápido

---

## 🔐 Segurança e Privacidade

### Dados Locais

- **Armazenamento:** IndexedDB (navegador)
- **Sincronização:** Nenhuma
- **Backup:** Manual (exportar JSON)
- **Acesso:** Apenas no dispositivo

### Proteção

- **Senha:** Hash criptografado (PBKDF2)
- **Notificações:** Permissão solicitada
- **Service Worker:** Cache-first para recursos estáticos

### O que NÃO é Coletado

- ✅ Nenhum dado é enviado para servidores
- ✅ Nenhuma telemetria
- ✅ Nenhum rastreamento
- ✅ Nenhuma sincronização em nuvem
- ✅ Nenhum login obrigatório

---

## 🚀 Como Usar Localmente

### Pré-requisitos

- Node.js 18+
- npm ou pnpm

### Instalação

```bash
# Clone o repositório
git clone <url-do-repo>
cd contas-a-pagar-pwa

# Instale dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev
```

O app abrirá em `http://localhost:3000`

### Build para Produção

```bash
# Build
pnpm build

# Preview
pnpm preview
```

---

## 🧪 Testando Notificações

### Passo 1: Permitir Notificações

1. Abra o app
2. Navegador pedirá permissão
3. Clique "Permitir"

### Passo 2: Criar Conta com Lembrete

1. "+ Nova Conta"
2. Preencha dados
3. Seção "Lembretes": ative
4. Escolha "3 dias antes"
5. Horário: defina para 5 minutos a partir de agora
6. Salve

### Passo 3: Aguarde Notificação

- Se o app está aberto, verifica a cada minuto
- Quando chegar a hora, notificação aparece
- Clique para abrir a conta

### Passo 4: Testar com Dados de Exemplo

1. Configurações → "Zona de Perigo"
2. Botão "Inserir Dados de Exemplo" (se disponível)
3. 10 contas com lembretes pré-configurados
4. Alguns lembretes vencendo hoje/amanhã

---

## 📋 Categorias Disponíveis

| Categoria | Ícone | Uso |
|-----------|-------|-----|
| Moradia | 🏠 | Aluguel, água, luz, gás |
| Cartão | 💳 | Fatura de cartão de crédito |
| Serviços | 🔧 | Internet, celular, TV |
| Saúde | 🏥 | Médico, farmácia, dentista |
| Educação | 📚 | Escola, curso, livros |
| Transporte | 🚗 | Combustível, seguro, estacionamento |
| Lazer | 🎮 | Cinema, academia, hobbies |
| Outros | 📌 | Categorias não listadas |

---

## 🎨 Formas de Pagamento

- **PIX** - Transferência instantânea
- **Boleto** - Código de barras
- **Cartão** - Débito ou crédito
- **Dinheiro** - Pagamento em espécie
- **Transferência** - Transferência bancária
- **Outro** - Outras formas

---

## 🔄 Recorrências

| Tipo | Descrição |
|------|-----------|
| Nenhuma | Conta única |
| Mensal | Repete todo mês |
| Semanal | Repete toda semana |
| Anual | Repete todo ano |
| Personalizada | Repete a cada X dias |

---

## 📞 Troubleshooting

### Notificações não funcionam

**Solução:**
1. Verifique se permitiu notificações (navegador)
2. Verifique se o app está aberto
3. Verifique se o lembrete está ativo
4. Verifique se o horário está correto
5. Recarregue o app (F5)

### Dados desapareceram

**Solução:**
1. Verifique se limpou cache/cookies
2. Tente importar backup (JSON)
3. Verifique se está usando mesmo navegador/perfil
4. Dados são específicos por navegador/perfil

### App não instala como PWA

**Solução:**
1. Use Chrome, Edge ou Safari
2. Verifique se está em HTTPS (ou localhost)
3. Verifique se manifest.json está carregando
4. Recarregue e tente novamente

### Performance lenta

**Solução:**
1. Feche outras abas
2. Limpe cache do navegador
3. Recarregue o app
4. Verifique se há muitas contas (1000+)

---

## 📝 Notas Importantes

- **Backup Regular:** Exporte seus dados regularmente
- **Senha Segura:** Use senha forte se ativar proteção
- **Navegador:** Use navegador moderno (Chrome, Edge, Safari, Firefox)
- **Sincronização:** Dados são específicos por navegador/dispositivo
- **Offline:** Funciona offline, mas notificações requerem app aberto

---

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique esta documentação
2. Consulte a seção Troubleshooting
3. Verifique console do navegador (F12 → Console)

---

## 📄 Licença

Uso pessoal. Todos os dados são seus e permanecem no seu dispositivo.

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026  
**Status:** ✅ Pronto para uso
