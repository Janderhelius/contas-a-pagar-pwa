# 📊 Meu Controle de Contas - Web App + PWA

Um aplicativo moderno para gerenciar contas a pagar com lembretes e notificações. Totalmente privado, com dados armazenados localmente no seu navegador.

## ✨ Características

- ✅ **CRUD Completo** - Criar, ler, atualizar e deletar contas
- ✅ **Lembretes Inteligentes** - Configure notificações para vencimentos
- ✅ **Dashboard Interativo** - Visualize estatísticas e gráficos
- ✅ **PWA Instalável** - Funciona como app nativo em Mac/PC/Mobile
- ✅ **Offline First** - Funciona sem internet
- ✅ **100% Privado** - Dados locais, sem sincronização
- ✅ **Importação/Exportação** - Backup em JSON
- ✅ **Proteção por Senha** - Segurança local
- ✅ **Notificações** - Alertas do navegador com Service Worker
- ✅ **Responsivo** - Funciona em qualquer dispositivo

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou pnpm

### Instalação

```bash
# 1. Clone ou extraia o projeto
cd contas-a-pagar-pwa

# 2. Instale dependências
pnpm install

# 3. Inicie o servidor de desenvolvimento
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

## 📱 Instalar como PWA

### Chrome/Edge (Windows/Mac)
1. Abra o app no navegador
2. Clique no ícone de instalação (canto superior direito)
3. Clique "Instalar"
4. O app abre em janela separada

### Safari (Mac/iPhone)
1. Abra o app no Safari
2. Menu "Compartilhar" → "Adicionar à Tela de Início"
3. Nomeie e adicione
4. O app aparece na home screen

### Android
1. Abra o app no Chrome
2. Menu (⋮) → "Instalar app"
3. O app é instalado na home screen

## 📋 Funcionalidades Principais

### 1. Gerenciar Contas

**Criar:**
- Clique em "+ Nova Conta"
- Preencha: título, categoria, valor, datas, beneficiário
- Configure lembretes
- Salve

**Listar:**
- "Ver Todas as Contas" mostra todas
- Filtros: categoria, período, status, valor
- Busca por texto
- Ordenação: vencimento, valor, categoria

**Editar/Deletar:**
- Clique na conta
- Modifique ou delete
- Confirme

### 2. Lembretes e Notificações

**Configurar:**
- Ao criar conta, seção "Lembretes"
- Tipo: "No vencimento" ou "X dias antes"
- Horário: defina HH:MM
- Ative/desative conforme necessário
- Opção: repetir diariamente se atrasado

**Central de Lembretes:**
- Visualize todos os lembretes
- Ative/desative
- Delete
- Veja próxima notificação

**Notificações:**
- Verifica a cada minuto quando app está aberto
- Dispara notificação do navegador
- Clique para abrir a conta

### 3. Dashboard

**Widgets:**
- Total a pagar no mês
- Total pago este mês
- Total atrasado
- Lembretes ativos

**Próximos Vencimentos:**
- Cards com próximas contas (30 dias)
- Clique para editar

### 4. Importação/Exportação

**Exportar:**
- Configurações → "Exportar como JSON"
- Baixa arquivo: `contas-backup-YYYY-MM-DD.json`

**Importar:**
- Configurações → "Importar Dados"
- Selecione arquivo JSON
- Confirme

### 5. Proteção por Senha

**Configurar:**
- Configurações → "Segurança"
- Defina senha (mínimo 4 caracteres)
- Confirme

**Usar:**
- Ao abrir app, pede para desbloquear
- Senha protege apenas acesso local

## 🏗️ Arquitetura Técnica

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| UI | shadcn/ui + Radix UI |
| Banco de Dados | IndexedDB (Dexie.js) |
| Roteamento | Wouter |
| Notificações | Web Notifications API |
| PWA | Service Worker |
| Gráficos | Recharts |

### Estrutura de Dados

**Contas:**
- ID, título, categoria, valor
- Data de emissão/vencimento
- Status (Pendente/Pago/Atrasado)
- Recorrência (Mensal/Semanal/Anual/Personalizada)
- Forma de pagamento (PIX/Boleto/Cartão/etc)
- Beneficiário, link/código, observações

**Lembretes:**
- ID, conta ID
- Tipo (vencimento ou dias antes)
- Horário, ativo, repetir se atrasado
- Próxima notificação

**Configurações:**
- Senha (hash)
- Notificações ativas
- Tema (claro/escuro)

## 🔐 Segurança e Privacidade

### Dados Locais
- Armazenados em IndexedDB (navegador)
- Nenhuma sincronização com servidores
- Backup manual (exportar JSON)

### Proteção
- Senha com hash criptografado
- Permissão de notificações solicitada
- Service Worker com cache-first

### O que NÃO é Coletado
- ✅ Nenhum dado enviado para servidores
- ✅ Nenhuma telemetria
- ✅ Nenhum rastreamento
- ✅ Nenhuma sincronização em nuvem
- ✅ Nenhum login obrigatório

## 📊 Schema de Dados

### Tabela: Contas

```typescript
{
  id: string;                    // UUID
  titulo: string;                // Nome da conta
  categoria: string;             // Categoria
  valor: number;                 // Valor em BRL
  dataEmissao: Date;            // Data de emissão
  dataVencimento: Date;         // Data de vencimento
  observacoes?: string;         // Notas
  status: 'Pendente' | 'Pago' | 'Atrasado';
  dataPagamento?: Date;         // Data que foi pago
  valorPago?: number;           // Valor realmente pago
  recorrencia: {
    tipo: 'Nenhuma' | 'Mensal' | 'Semanal' | 'Anual' | 'Personalizada';
    diasIntervalo?: number;
  };
  formaPagamento: 'PIX' | 'Boleto' | 'Cartão' | 'Dinheiro' | 'Transferência' | 'Outro';
  beneficiario: string;         // Quem recebe
  linkCodigo?: string;          // Código de barras ou PIX
  comprovante?: Blob;           // Upload de comprovante
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Tabela: Lembretes

```typescript
{
  id: string;                    // UUID
  contaId: string;              // Referência à conta
  tipo: 'vencimento' | 'diasAntes';
  diasAntes?: number;           // 1,2,3,5,7,10,15,30
  horario: string;              // HH:MM
  ativo: boolean;               // Se está ativo
  repetirSeAtrasado: boolean;   // Repetir se atrasado
  proximaNotificacao?: Date;    // Próxima notificação
  criadoEm: Date;
  atualizadoEm: Date;
}
```

## 🧪 Testando Notificações

1. **Permitir Notificações:**
   - Navegador pedirá permissão
   - Clique "Permitir"

2. **Criar Conta com Lembrete:**
   - "+ Nova Conta"
   - Preencha dados
   - Ative lembrete
   - Defina horário para 5 minutos a partir de agora
   - Salve

3. **Aguarde:**
   - Se app está aberto, verifica cada minuto
   - Quando chegar a hora, notificação aparece
   - Clique para abrir

## 📁 Estrutura do Projeto

```
contas-a-pagar-pwa/
├── client/
│   ├── public/
│   │   ├── manifest.json          # Configuração PWA
│   │   ├── service-worker.js      # Service Worker
│   │   ├── icon-192.png           # Ícone 192x192
│   │   ├── icon-512.png           # Ícone 512x512
│   │   └── index.html
│   ├── src/
│   │   ├── components/            # Componentes React
│   │   ├── contexts/              # Contextos (Contas, Lembretes)
│   │   ├── hooks/                 # Hooks customizados
│   │   ├── lib/                   # Utilitários (DB, tipos, etc)
│   │   ├── pages/                 # Páginas
│   │   ├── App.tsx                # Componente raiz
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Estilos globais
│   └── package.json
├── DOCUMENTACAO.md                # Documentação completa
├── GUIA_RAPIDO.md                 # Guia rápido
└── README_COMPLETO.md             # Este arquivo
```

## 🆘 Troubleshooting

### Notificações não funcionam

1. Verifique se permitiu notificações (navegador)
2. Verifique se app está aberto
3. Verifique se lembrete está ativo
4. Verifique se horário está correto
5. Recarregue app (F5)

### Dados desapareceram

1. Verifique se limpou cache/cookies
2. Tente importar backup (JSON)
3. Dados são específicos por navegador/perfil

### App não instala como PWA

1. Use navegador moderno (Chrome, Edge, Safari)
2. Verifique se está em HTTPS (ou localhost)
3. Verifique se manifest.json está carregando
4. Recarregue e tente novamente

### Performance lenta

1. Feche outras abas
2. Limpe cache do navegador
3. Recarregue app
4. Verifique se há muitas contas (1000+)

## 📝 Categorias Disponíveis

- 🏠 Moradia (aluguel, água, luz, gás)
- 💳 Cartão (fatura de cartão)
- 🔧 Serviços (internet, celular, TV)
- 🏥 Saúde (médico, farmácia, dentista)
- 📚 Educação (escola, curso, livros)
- 🚗 Transporte (combustível, seguro, estacionamento)
- 🎮 Lazer (cinema, academia, hobbies)
- 📌 Outros (categorias não listadas)

## 💡 Dicas Úteis

- **Backup Regular:** Exporte dados mensalmente
- **Lembretes Múltiplos:** Crie vários lembretes para mesma conta
- **Modo Offline:** App funciona sem internet
- **Dados Locais:** Nenhum dado é enviado para servidores
- **Sincronização:** Dados são específicos por navegador/dispositivo

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte DOCUMENTACAO.md (documentação completa)
2. Consulte GUIA_RAPIDO.md (guia rápido)
3. Verifique console do navegador (F12 → Console)

## 📄 Licença

Uso pessoal. Todos os dados são seus e permanecem no seu dispositivo.

---

## 🎯 Roadmap Futuro

- [ ] Sincronização com Google Drive (opcional)
- [ ] Suporte a múltiplos usuários
- [ ] Gráficos avançados
- [ ] Exportação para PDF
- [ ] Integração com bancos
- [ ] Modo escuro melhorado
- [ ] Suporte a mais idiomas

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026  
**Status:** ✅ Pronto para uso  
**Privacidade:** 🔒 100% Local
