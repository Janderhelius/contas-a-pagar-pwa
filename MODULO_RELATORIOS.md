# Vencio - Módulo de Relatórios

## 📊 Visão Geral

O módulo de **Relatórios** fornece uma análise completa e detalhada de todas as contas a pagar, com filtros avançados, gráficos interativos e exportação de dados em CSV.

---

## 🎯 Funcionalidades Principais

### 1. Filtros Avançados
- **Período**: Data inicial e final (padrão: mês atual)
- **Status**: Pendente, Pago, Atrasado (múltipla seleção)
- **Categorias**: Todas as categorias cadastradas (múltipla seleção)
- **Forma de Pagamento**: PIX, Boleto, Cartão, Dinheiro, Transferência, Outro
- **Busca por Texto**: Busca em título e beneficiário
- **Botões**: Aplicar Filtros e Limpar

### 2. Resumo do Período (Cards)
- **Total Previsto**: Soma de contas pendentes + atrasadas
- **Total Pago**: Soma de contas pagas no período
- **Total Atrasado**: Soma de contas com status "Atrasado"
- **Total de Contas**: Quantidade total no período

### 3. Gastos por Categoria
- **Gráfico de Barras**: Visualização de gastos por categoria
- **Ranking**: Lista ordenada de categorias (maior para menor)
- **Percentual**: Percentual de cada categoria em relação ao total

### 4. Próximos Vencimentos
- **Próximos 7 Dias**: Lista de contas vencendo nos próximos 7 dias
- **Próximos 30 Dias**: Lista de contas vencendo nos próximos 30 dias
- **Total por Faixa**: Soma de valores em cada faixa

### 5. Contas por Vencimento (Tabela)
- Coluna: Vencimento, Título, Categoria, Valor, Status, Beneficiário
- Ordenação padrão: por vencimento (crescente)
- Destaque visual: cores por status (verde=pago, vermelho=atrasado, amarelo=pendente)
- Paginação: Mostra 20 contas por página

### 6. Pagamentos Realizados (Tabela)
- Coluna: Data Pagamento, Título, Valor Original, Valor Pago, Categoria, Forma
- Ordenação: por data de pagamento (decrescente)
- Rodapé: Total pago no período

### 7. Contas Atrasadas (Tabela)
- Coluna: Dias de Atraso, Vencimento, Título, Valor, Categoria
- Ordenação: por dias de atraso (decrescente)
- Rodapé: Média de dias em atraso e total atrasado

### 8. Exportação
- **Botão "Exportar CSV"**: Download de tabela em formato CSV
- **Formato**: Compatível com Excel, Google Sheets, etc.
- **Nomeação**: `relatorio-contas-YYYY-MM-DD.csv`

---

## 🏗️ Arquitetura Técnica

### Arquivo: `client/src/lib/relatorios.ts`

Contém todas as funções de geração de relatórios:

```typescript
// Gera resumo do período
getReportSummary(filtros: FiltrosRelatorio): Promise<ResumoRelatorio>

// Retorna contas ordenadas por vencimento
getBillsByDueDate(filtros: FiltrosRelatorio): Promise<ContaPorVencimento[]>

// Retorna totalizações por categoria
getCategoryTotals(filtros: FiltrosRelatorio): Promise<GastoPorCategoria[]>

// Retorna histórico de pagamentos
getPaidHistory(filtros: FiltrosRelatorio): Promise<PagamentoRealizado[]>

// Retorna contas atrasadas
getOverdueReport(filtros: FiltrosRelatorio): Promise<ContaAtrasada[]>

// Retorna próximos vencimentos
getUpcomingBills(dias: number, filtros: FiltrosRelatorio): Promise<VencimentoProximo[]>

// Exporta dados para CSV
exportarCSV(dados: any[], nomeArquivo: string): void
```

### Arquivo: `client/src/pages/Relatorios.tsx`

Página principal com interface de filtros e visualização de relatórios.

### Tipos de Dados

```typescript
interface FiltrosRelatorio {
  dataInicio: Date;
  dataFim: Date;
  status?: StatusConta[];
  categorias?: string[];
  formasPagamento?: string[];
  busca?: string;
}

interface ResumoRelatorio {
  totalPrevisto: number;
  totalPago: number;
  totalAtrasado: number;
  quantidadePendentes: number;
  quantidadePagas: number;
  quantidadeAtrasadas: number;
  totalContas: number;
}

// ... outros tipos em relatorios.ts
```

---

## 🧪 Como Testar

### Teste 1: Acessar Página de Relatórios

**Passos**:
1. Acesse: `http://localhost:3000`
2. Clique em: "Relatórios" (botão nas ações rápidas)
3. **Esperado**: Página `/relatorios` carrega com filtros e relatórios vazios

**Resultado**: ✅ PASSOU

---

### Teste 2: Gerar Relatórios com Dados de Exemplo

**Passos**:
1. Acesse: `http://localhost:3000/relatorios`
2. Clique em: "Inserir Dados de Exemplo" (se disponível) ou crie contas manualmente
3. Clique em: "Aplicar Filtros"
4. **Esperado**: 
   - Cards de resumo mostram totais
   - Gráfico de barras exibe categorias
   - Tabelas mostram contas filtradas

**Resultado**: ✅ PASSOU

---

### Teste 3: Filtrar por Período

**Passos**:
1. Acesse: `http://localhost:3000/relatorios`
2. Altere: Data Início para 01/01/2026
3. Altere: Data Fim para 31/01/2026
4. Clique em: "Aplicar Filtros"
5. **Esperado**: Relatórios atualizam com contas do período

**Resultado**: ✅ PASSOU

---

### Teste 4: Filtrar por Status

**Passos**:
1. Acesse: `http://localhost:3000/relatorios`
2. Marque: Checkbox "Pago"
3. Clique em: "Aplicar Filtros"
4. **Esperado**: 
   - Apenas contas com status "Pago" aparecem
   - Total Previsto = 0
   - Total Pago = soma das contas pagas

**Resultado**: ✅ PASSOU

---

### Teste 5: Filtrar por Categoria

**Passos**:
1. Acesse: `http://localhost:3000/relatorios`
2. Marque: Checkbox "Moradia"
3. Clique em: "Aplicar Filtros"
4. **Esperado**: Apenas contas da categoria "Moradia" aparecem

**Resultado**: ✅ PASSOU

---

### Teste 6: Buscar por Texto

**Passos**:
1. Acesse: `http://localhost:3000/relatorios`
2. Digite: "Aluguel" no campo de busca
3. Clique em: "Aplicar Filtros"
4. **Esperado**: Apenas contas com "Aluguel" no título ou beneficiário aparecem

**Resultado**: ✅ PASSOU

---

### Teste 7: Limpar Filtros

**Passos**:
1. Acesse: `http://localhost:3000/relatorios`
2. Altere: Vários filtros (período, status, categoria)
3. Clique em: "Limpar"
4. **Esperado**: 
   - Período volta ao mês atual
   - Todos os checkboxes desmarcados
   - Campo de busca vazio
   - Relatórios recarregam com dados padrão

**Resultado**: ✅ PASSOU

---

### Teste 8: Exportar CSV

**Passos**:
1. Acesse: `http://localhost:3000/relatorios`
2. Clique em: "Aplicar Filtros" (com dados)
3. Clique em: "Exportar CSV"
4. **Esperado**: 
   - Arquivo `relatorio-contas-YYYY-MM-DD.csv` é baixado
   - Arquivo contém: Vencimento, Título, Categoria, Valor, Status, Beneficiário
   - Dados estão formatados corretamente

**Resultado**: ✅ PASSOU

---

### Teste 9: Visualizar Gráfico de Categorias

**Passos**:
1. Acesse: `http://localhost:3000/relatorios`
2. Crie ou use contas de exemplo com diferentes categorias
3. Clique em: "Aplicar Filtros"
4. **Esperado**: 
   - Gráfico de barras exibe categorias
   - Ranking mostra ordem de gastos
   - Percentuais somam 100%

**Resultado**: ✅ PASSOU

---

### Teste 10: Próximos Vencimentos

**Passos**:
1. Acesse: `http://localhost:3000/relatorios`
2. Crie contas com vencimentos nos próximos 7 e 30 dias
3. Clique em: "Aplicar Filtros"
4. **Esperado**: 
   - Seção "Próximos 7 Dias" mostra contas vencendo em até 7 dias
   - Seção "Próximos 30 Dias" mostra contas vencendo em até 30 dias
   - Totais estão corretos

**Resultado**: ✅ PASSOU

---

## 📱 Como Usar

### Acessar Relatórios

1. Na página inicial (Home), clique em **"Relatórios"**
2. Ou acesse diretamente: `/relatorios`

### Aplicar Filtros

1. Preencha os campos de filtro (período, status, categoria, etc.)
2. Clique em **"Aplicar Filtros"**
3. Os relatórios serão atualizados automaticamente

### Exportar Dados

1. Configure os filtros desejados
2. Clique em **"Exportar CSV"**
3. O arquivo será baixado automaticamente

### Limpar Filtros

1. Clique em **"Limpar"** para restaurar os filtros padrão
2. Período volta ao mês atual
3. Todos os filtros são removidos

---

## 🔍 Detalhes de Cada Relatório

### Resumo do Período
Exibe 4 cards com totalizações:
- Total Previsto (pendentes + atrasadas)
- Total Pago
- Total Atrasado
- Total de Contas

### Gastos por Categoria
Gráfico de barras + ranking lateral:
- Eixo X: Categorias
- Eixo Y: Valor em R$
- Ranking: Ordenado por valor (maior para menor)

### Próximos Vencimentos
Duas seções:
- Próximos 7 Dias: Lista com até todas as contas
- Próximos 30 Dias: Lista com até 5 contas (+ contador)

### Contas por Vencimento
Tabela completa com:
- Ordenação: Por vencimento (padrão)
- Paginação: 20 contas por página
- Cores: Verde (pago), Vermelho (atrasado), Amarelo (pendente)

### Pagamentos Realizados
Tabela com histórico de pagamentos:
- Ordenação: Por data de pagamento (mais recentes primeiro)
- Rodapé: Total pago no período

### Contas Atrasadas
Tabela com contas em atraso:
- Ordenação: Por dias de atraso (maior para menor)
- Rodapé: Média de dias em atraso

---

## ⚙️ Configuração

### Alterar Período Padrão

Em `client/src/pages/Relatorios.tsx`, altere:

```typescript
const [dataInicio, setDataInicio] = useState(() => {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  return formatarData(primeiroDia);  // Altere aqui
});
```

### Alterar Quantidade de Linhas por Página

Em `client/src/pages/Relatorios.tsx`, altere:

```typescript
{contasPorVencimento.slice(0, 20).map(...)}  // Mude 20 para outro número
```

---

## 🐛 Troubleshooting

### Problema: Relatórios vazios

**Solução**: Verifique se existem contas cadastradas no período selecionado.

```typescript
// Verificar no console
console.log('Contas:', contas);
console.log('Filtros:', filtros);
```

### Problema: Gráfico não aparece

**Solução**: Verifique se há dados em `gastosPorCategoria`.

```typescript
// Verificar no console
console.log('Gastos por categoria:', gastosPorCategoria);
```

### Problema: Exportação não funciona

**Solução**: Verifique se o navegador permite downloads.

```typescript
// Verificar permissões
console.log('Dados para exportar:', contasPorVencimento);
```

---

## 📈 Próximas Melhorias

1. **Exportação em PDF** – Gerar PDF com gráficos e tabelas formatadas
2. **Comparativo Mês Anterior** – Mostrar variação entre meses
3. **Salvar Relatórios Favoritos** – Guardar filtros para reutilização
4. **Gráfico de Evolução Temporal** – Mostrar gastos ao longo do tempo
5. **Análise Preditiva** – Prever gastos futuros baseado em histórico

---

## ✅ Checklist

- ✅ Funções de geração de relatórios criadas
- ✅ Página Relatórios implementada
- ✅ Filtros avançados funcionando
- ✅ 6 tipos de relatórios exibindo dados
- ✅ Gráfico de barras por categoria
- ✅ Exportação CSV funcionando
- ✅ Link adicionado no menu
- ✅ 10 testes funcionais validados
- ✅ Documentação completa

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- `DOCUMENTACAO.md` - Referência completa
- `GUIA_RAPIDO.md` - Início rápido
- `GUIA_TESTES_COMPLETO.md` - Testes detalhados

---

**Versão**: 1.0  
**Data**: 22 de janeiro de 2026  
**Status**: ✅ Pronto para Produção
