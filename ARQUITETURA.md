# Arquitetura - Meu Controle de Contas (PWA)

## 1. Visão Geral

Aplicativo web + PWA para gerenciamento pessoal de contas a pagar com armazenamento local (IndexedDB), notificações e funcionalidades avançadas de lembretes.

**Stack:**
- Frontend: React 19 + TypeScript
- UI: Tailwind CSS 4 + shadcn/ui
- Banco de Dados Local: IndexedDB (via Dexie.js)
- PWA: Service Worker + Web Manifest
- Notificações: Web Notifications API + Service Worker
- Exportação: CSV e PDF

## 2. Schema de Dados (IndexedDB)

### Tabela: `contas`

```typescript
interface Conta {
  id: string;                    // UUID
  titulo: string;                // Obrigatório
  categoria: string;             // Enum: Moradia, Cartão, Serviços, Saúde, Educação, Transporte, Lazer, Outros
  valor: number;                 // BRL, > 0
  dataEmissao: Date;             // Obrigatório
  dataVencimento: Date;          // Obrigatório, >= dataEmissao
  observacoes: string;           // Opcional
  status: 'Pendente' | 'Pago' | 'Atrasado'; // Calculado/manual
  recorrencia: {
    tipo: 'Nenhuma' | 'Mensal' | 'Semanal' | 'Anual' | 'Personalizada';
    intervalo?: number;          // Para personalizada (em dias)
    dataProximaGeracao?: Date;   // Próxima data para gerar conta recorrente
  };
  formaPagamento: 'PIX' | 'Boleto' | 'Cartão' | 'Dinheiro' | 'Transferência' | 'Outro';
  beneficiario: string;          // Empresa/pessoa
  linkCodigo: string;            // PIX copia e cola ou código de barras
  comprovante?: {
    nome: string;
    dados: Blob;                 // Arquivo armazenado como Blob
    dataUpload: Date;
  };
  dataPagamento?: Date;          // Preenchida quando marcado como pago
  valorPago?: number;            // Pode diferir do valor original
  observacaoPagamento?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Tabela: `lembretes`

```typescript
interface Lembrete {
  id: string;                    // UUID
  contaId: string;               // FK para contas.id
  tipo: 'vencimento' | 'diasAntes';
  diasAntes?: number;            // Se tipo === 'diasAntes': 1, 2, 3, 5, 7, 10, 15, 30
  horario: string;               // HH:mm (ex: "09:00")
  ativo: boolean;
  repetirSeAtrasado: boolean;    // Se true, repete diariamente se conta estiver atrasada
  proximaNotificacao?: Date;     // Próxima data/hora para notificar
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Tabela: `configuracoes`

```typescript
interface Configuracoes {
  id: string;                    // "config" (singleton)
  senha?: string;                // Hash SHA-256 (opcional, proteção local)
  categoriasPersonalizadas: string[]; // Categorias adicionadas pelo usuário
  ultimoBackup?: Date;
  notificacoesAtivas: boolean;
  temaEscuro: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

## 3. Arquitetura de Camadas

```
client/src/
├── pages/
│   ├── Home.tsx                 # Dashboard principal
│   ├── ListaContas.tsx          # Listagem com filtros
│   ├── FormularioConta.tsx      # CRUD de contas
│   ├── CentralLembretes.tsx     # Visualização de lembretes
│   ├── Configuracoes.tsx        # Senha, backup, temas
│   └── NotFound.tsx
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── CartaoConta.tsx          # Card de conta individual
│   ├── GraficoCategoria.tsx     # Gráfico pizza/barras
│   ├── FiltroAvancado.tsx       # Filtros da listagem
│   └── NotificacaoToast.tsx     # Toast de notificações
├── contexts/
│   ├── ContasContext.tsx        # Estado global de contas
│   ├── LembretesContext.tsx     # Estado global de lembretes
│   └── ThemeContext.tsx         # Tema escuro/claro
├── hooks/
│   ├── useContas.ts             # Hook para CRUD de contas
│   ├── useLembretes.ts          # Hook para gerenciar lembretes
│   ├── useNotificacoes.ts       # Hook para notificações
│   ├── useExportacao.ts         # Hook para CSV/PDF
│   └── useImportacao.ts         # Hook para importar CSV
├── lib/
│   ├── db.ts                    # Inicialização Dexie
│   ├── notificacoes.ts          # Lógica de notificações
│   ├── validacoes.ts            # Validações de formulário
│   ├── formatadores.ts          # Formatação de datas, moeda
│   ├── crypto.ts                # Hash de senha
│   └── gerador-uuid.ts          # Geração de UUIDs
├── App.tsx
├── main.tsx
└── index.css
```

## 4. Fluxos Principais

### 4.1 Criar Conta
1. Usuário clica "+ Nova Conta"
2. Abre modal/página com formulário
3. Valida campos obrigatórios
4. Salva em IndexedDB
5. Se recorrência ativa, agenda próxima geração
6. Se lembretes configurados, cria registros em `lembretes`
7. Toast de sucesso

### 4.2 Notificações e Lembretes
1. Service Worker verifica a cada minuto (via `setInterval` em background)
2. Compara `lembretes.proximaNotificacao` com hora atual
3. Se vencido, dispara `showNotification()`
4. Usuário clica na notificação → abre app/página da conta
5. Se `repetirSeAtrasado`, recalcula próxima notificação para amanhã

### 4.3 Marcar como Pago
1. Usuário clica "Pagar" no card da conta
2. Abre modal com campos: data pagamento, valor pago, observação
3. Salva `dataPagamento`, `valorPago`, `status = 'Pago'`
4. Cancela todos os lembretes futuros da conta
5. Atualiza dashboard

### 4.4 Importação CSV
1. Usuário faz upload de arquivo CSV
2. Exibe preview com mapeamento de colunas
3. Usuário confirma mapeamento
4. Insere registros em batch no IndexedDB
5. Toast com quantidade importada

### 4.5 Exportação PDF/CSV
1. Usuário clica "Exportar"
2. Filtra contas conforme seleção
3. Gera CSV ou PDF com formatação
4. Download automático

## 5. Service Worker e Notificações

### Arquivo: `public/service-worker.js`

```javascript
// Verifica lembretes a cada minuto
setInterval(async () => {
  const db = new Dexie('ContasDB');
  const lembretes = await db.table('lembretes').toArray();
  
  for (const lembrete of lembretes) {
    if (lembrete.proximaNotificacao <= new Date() && lembrete.ativo) {
      // Dispara notificação
      self.registration.showNotification('Conta a Vencer', {
        body: `${lembrete.contaTitulo} vence em ${lembrete.dataVencimento}`,
        tag: `lembrete-${lembrete.id}`,
        requireInteraction: true,
      });
      
      // Recalcula próxima notificação
      // ...
    }
  }
}, 60000); // A cada 1 minuto
```

## 6. PWA - Web Manifest e Service Worker

### Arquivo: `public/manifest.json`

```json
{
  "name": "Meu Controle de Contas",
  "short_name": "Contas",
  "description": "Aplicativo para gerenciar contas a pagar com lembretes",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

## 7. Proteção por Senha

1. Usuário define PIN/senha nas configurações
2. Hash SHA-256 armazenado em IndexedDB
3. Ao abrir app, verifica se senha está ativa
4. Se sim, exibe tela de login antes de carregar dashboard
5. Após login, mantém sessão por 24h (localStorage com timestamp)

## 8. Validações

- **Valor**: Deve ser > 0
- **Datas**: Vencimento >= Emissão
- **Título**: Obrigatório, máx 100 caracteres
- **Categoria**: Deve estar na lista (padrão + personalizadas)
- **Recorrência**: Se personalizada, intervalo deve ser > 0
- **Lembretes**: Horário em formato HH:mm válido

## 9. Cálculo de Status

```typescript
function calcularStatus(conta: Conta): 'Pendente' | 'Pago' | 'Atrasado' {
  if (conta.dataPagamento) return 'Pago';
  if (new Date() > conta.dataVencimento && !conta.dataPagamento) return 'Atrasado';
  return 'Pendente';
}
```

## 10. Recorrência

- **Mensal**: Gera nova conta no mesmo dia do mês seguinte
- **Semanal**: Gera nova conta 7 dias depois
- **Anual**: Gera nova conta 365 dias depois
- **Personalizada**: Gera nova conta após X dias

Ao gerar conta recorrente:
1. Copia dados da conta original
2. Incrementa `dataEmissao` e `dataVencimento`
3. Define `status = 'Pendente'`
4. Cria novos lembretes
5. Atualiza `dataProximaGeracao` na conta original

## 11. Segurança e Privacidade

- ✅ Tudo armazenado localmente (IndexedDB)
- ✅ Sem telemetria ou tracking
- ✅ Sem login público
- ✅ Proteção opcional por senha (hash SHA-256)
- ✅ Backup/export manual
- ✅ Notificações locais (sem envio para servidor)

## 12. Dependências

```json
{
  "dexie": "^4.x",                 // IndexedDB ORM
  "recharts": "^2.x",              // Gráficos
  "papaparse": "^5.x",             // Parsing CSV
  "html2pdf": "^0.10.x",           // Geração PDF
  "crypto-js": "^4.x",             // Hash SHA-256
  "uuid": "^9.x"                   // Geração UUID
}
```

## 13. Performance

- Lazy loading de páginas via React Router
- Indexação de IndexedDB para queries rápidas
- Service Worker cache-first para assets estáticos
- Debounce em filtros de busca
- Paginação de listagens (20 itens por página)

## 14. Testes

- Vitest para testes unitários de hooks e utilitários
- Testes de validação, cálculo de status, formatação
- Testes de importação/exportação
- Testes de notificações (mock de Service Worker)
