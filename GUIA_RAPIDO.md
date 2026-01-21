# Guia Rápido - Meu Controle de Contas

## ⚡ Primeiros Passos

### 1️⃣ Abrir o App

```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm build && pnpm preview
```

Acesse: `http://localhost:3000`

### 2️⃣ Criar Primeira Conta

1. Clique em **"+ Nova Conta"** (canto superior direito)
2. Preencha:
   - **Título:** ex. "Aluguel"
   - **Categoria:** ex. "Moradia"
   - **Valor:** ex. "1500.00"
   - **Data de Vencimento:** ex. "05/02/2026"
   - **Beneficiário:** ex. "Imobiliária XYZ"
   - **Forma de Pagamento:** ex. "Transferência"
3. Seção **"Lembretes"**: ative e configure
4. Clique **"Salvar"**

### 3️⃣ Configurar Lembretes

Na criação/edição da conta:

1. Ative **"Configurar Lembrete"**
2. Escolha tipo:
   - **No vencimento** - notifica no dia do vencimento
   - **X dias antes** - notifica 3, 5, 7, 10 dias antes
3. Defina **horário** (ex: "09:00")
4. Ative **"Repetir se atrasado"** (opcional)
5. Salve

### 4️⃣ Permitir Notificações

1. Navegador pedirá permissão
2. Clique **"Permitir"**
3. Pronto! Receberá notificações

---

## 📊 Dashboard

**Widgets principais:**
- **Total do Mês** - soma de todas as contas pendentes
- **Pago este Mês** - contas já pagas
- **Atrasado** - contas vencidas não pagas
- **Lembretes Ativos** - quantos lembretes estão ativos

**Próximos Vencimentos:**
- Lista dos próximos 30 dias
- Clique para editar

---

## 📋 Gerenciar Contas

### Ver Todas
Clique em **"Ver Todas as Contas"** para:
- Listar todas as contas
- Filtrar por categoria, status, período
- Buscar por texto
- Ordenar por vencimento, valor, categoria

### Editar
1. Clique na conta
2. Modifique os dados
3. Clique **"Salvar"**

### Marcar como Pago
1. Abra a conta
2. Clique **"Marcar como Pago"**
3. Confirme data e valor pago
4. Salve

### Deletar
1. Abra a conta
2. Clique **"Deletar"**
3. Confirme

---

## 🔔 Central de Lembretes

Acesse via **"Central de Lembretes"** para:
- Ver todos os lembretes
- Ativar/desativar lembretes
- Deletar lembretes
- Ver próxima notificação

---

## ⚙️ Configurações

### Segurança
- Defina senha para proteger o app
- Mínimo 4 caracteres

### Notificações
- Ative/desative notificações do navegador

### Backup
- **Exportar:** Baixa arquivo JSON com todos os dados
- **Importar:** Restaura dados de arquivo JSON

### Zona de Perigo
- **Limpar Dados:** Deleta tudo (irreversível!)

---

## 📱 Instalar como PWA

### Chrome/Edge (Windows/Mac)
1. Abra o app
2. Clique no ícone de instalação (canto superior direito)
3. "Instalar"

### Safari (Mac/iPhone)
1. Abra o app
2. Menu "Compartilhar" → "Adicionar à Tela de Início"
3. Nomeie e adicione

### Android
1. Abra no Chrome
2. Menu (⋮) → "Instalar app"

---

## 💡 Dicas Úteis

✅ **Backup Regular:** Exporte dados mensalmente  
✅ **Lembretes Múltiplos:** Crie vários lembretes para mesma conta  
✅ **Categorias Personalizadas:** Adicione suas próprias categorias  
✅ **Modo Offline:** App funciona sem internet  
✅ **Dados Locais:** Nenhum dado é enviado para servidores  

---

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Notificações não funcionam | Verifique permissão no navegador |
| Dados desapareceram | Verifique se limpou cache/cookies |
| App não instala | Use navegador moderno (Chrome, Edge, Safari) |
| Performance lenta | Feche outras abas, limpe cache |

---

## 📞 Suporte

Consulte **DOCUMENTACAO.md** para informações detalhadas.

---

**Versão:** 1.0.0 | **Status:** ✅ Pronto
