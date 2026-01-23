# Sistema de Gerenciamento de Categorias - Vencio

## Visão Geral

O Vencio implementa um sistema completo de gerenciamento de categorias que permite aos usuários trabalhar com categorias padrão pré-configuradas e criar suas próprias categorias personalizadas. O sistema foi projetado para ser intuitivo, flexível e totalmente integrado ao fluxo de contas a pagar.

## Arquitetura

### Banco de Dados

A tabela `categorias` foi adicionada ao IndexedDB com a seguinte estrutura:

```typescript
interface Categoria {
  id: string;              // UUID único
  name: string;            // Nome da categoria
  isDefault: boolean;      // Indica se é categoria padrão
  isActive: boolean;       // Controle de ativação/desativação
  sortOrder: number;       // Ordem de exibição
  criadoEm: Date;         // Data de criação
  atualizadoEm: Date;     // Data de última atualização
}
```

### Categorias Padrão

O sistema vem pré-configurado com 8 categorias padrão que não podem ser deletadas:

- **Moradia** - Aluguel, condomínio, IPTU
- **Cartão** - Faturas de cartão de crédito
- **Serviços** - Internet, telefone, streaming
- **Saúde** - Medicamentos, consultas, seguros
- **Educação** - Cursos, mensalidades, livros
- **Transporte** - Combustível, uber, estacionamento
- **Lazer** - Entretenimento, viagens, hobbies
- **Outros** - Despesas diversas (não pode ser deletada)

## Funcionalidades

### 1. Criar Nova Categoria

**Onde:** No formulário "Nova Conta", ao clicar em "+ Nova categoria" no Select de categorias.

**Como funciona:**
1. Um modal é exibido com campo para nome da categoria
2. Validações aplicadas:
   - Nome obrigatório
   - Mínimo 2 caracteres
   - Sem duplicação (case-insensitive)
3. Após criação, a categoria é automaticamente selecionada no formulário
4. A categoria fica imediatamente disponível em filtros e relatórios

**Código relevante:** `client/src/components/NovaCategoriModal.tsx`

### 2. Gerenciar Categorias

**Onde:** No formulário "Nova Conta", ao clicar em "⚙ Gerenciar categorias" no Select de categorias.

**Funcionalidades:**

#### Visualizar Categorias
- Seção "Categorias Padrão" (somente leitura)
- Seção "Categorias Personalizadas" (editáveis)
- Indicador de quantas contas usam cada categoria

#### Editar Nome
- Clicar no ícone de edição (✏️)
- Modificar nome da categoria
- Salvar com validações (sem duplicação)
- Todas as contas que usam a categoria são automaticamente atualizadas

#### Deletar Categoria
- Clicar no ícone de lixeira (🗑️)
- Se a categoria estiver em uso:
  - Modal pede para selecionar categoria substituta
  - Todas as contas são reatribuídas à nova categoria
  - Categoria é deletada
- Se não estiver em uso:
  - Deletar diretamente após confirmação

**Código relevante:** `client/src/components/GerenciarCategoriasModal.tsx`

### 3. Integração com Formulário de Contas

No formulário "Nova Conta" e "Editar Conta":

```typescript
<Select value={formData.categoria} onValueChange={(value) => {
  if (value === '__nova__') setShowNovaCategoria(true);
  else if (value === '__gerenciar__') setShowGerenciarCategorias(true);
  else handleChange('categoria', value);
}}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {categorias.map(cat => (
      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
    ))}
    <SelectItem value="__nova__">+ Nova categoria</SelectItem>
    <SelectItem value="__gerenciar__">⚙ Gerenciar categorias</SelectItem>
  </SelectContent>
</Select>
```

### 4. Filtros em Listagens

Na página "Todas as Contas" e "Relatórios", o filtro de categorias é carregado dinamicamente do banco:

```typescript
const [categorias, setCategorias] = useState<Categoria[]>([]);

useEffect(() => {
  const carregarCategorias = async () => {
    try {
      const cats = await obterCategorias();
      setCategorias(cats);
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro);
    }
  };
  carregarCategorias();
}, []);
```

## Funções Principais

### `obterCategorias()`
Retorna todas as categorias ativas ordenadas por `sortOrder`.

```typescript
const categorias = await obterCategorias();
```

### `obterCategoriasPadrao()`
Retorna apenas categorias padrão ativas.

```typescript
const padrao = await obterCategoriasPadrao();
```

### `obterCategoriasPersonalizadas()`
Retorna apenas categorias personalizadas ativas.

```typescript
const personalizadas = await obterCategoriasPersonalizadas();
```

### `criarCategoria(nome: string)`
Cria nova categoria personalizada com validações.

```typescript
const novaCategoria = await criarCategoria('Internet');
```

### `editarCategoria(id: string, novoNome: string)`
Edita nome de categoria existente e atualiza todas as contas.

```typescript
await editarCategoria(categoriaId, 'Novo Nome');
```

### `deletarCategoria(id: string)`
Deleta categoria personalizada se não estiver em uso.

```typescript
await deletarCategoria(categoriaId);
```

### `substituirCategoriaEmContas(categoriaDeletarId: string, categoriaSubstituirId: string)`
Substitui categoria em todas as contas e deleta a categoria original.

```typescript
const contasAtualizadas = await substituirCategoriaEmContas(idAntiga, idNova);
```

### `verificarCategoriaEmUso(id: string)`
Retorna número de contas que usam a categoria.

```typescript
const count = await verificarCategoriaEmUso(categoriaId);
```

## Fluxo de Dados

```
Usuário cria categoria
    ↓
NovaCategoriModal valida e salva em IndexedDB
    ↓
Categoria é selecionada automaticamente no formulário
    ↓
Ao salvar conta, categoria é referenciada por ID
    ↓
Filtros e relatórios carregam categorias do banco
    ↓
Se categoria é editada, todas as contas são atualizadas
    ↓
Se categoria é deletada, contas são reatribuídas
```

## Casos de Uso

### Caso 1: Criar Categoria Personalizada
1. Usuário clica em "Nova Conta"
2. No campo Categoria, clica em "+ Nova categoria"
3. Modal abre com campo de nome
4. Usuário digita "Gym" e clica em "Criar"
5. Categoria "Gym" é criada e selecionada automaticamente
6. Usuário completa o formulário e salva a conta

### Caso 2: Editar Nome de Categoria
1. Usuário clica em "Nova Conta"
2. No campo Categoria, clica em "⚙ Gerenciar categorias"
3. Modal abre mostrando todas as categorias
4. Usuário clica no ícone de edição de "Gym"
5. Campo fica editável, usuário muda para "Academia"
6. Clica em "Salvar"
7. Todas as contas com categoria "Gym" são atualizadas para "Academia"

### Caso 3: Deletar Categoria em Uso
1. Usuário clica em "⚙ Gerenciar categorias"
2. Clica no ícone de lixeira de "Academia"
3. Sistema detecta que 3 contas usam essa categoria
4. Modal pede para selecionar categoria substituta
5. Usuário seleciona "Saúde"
6. Clica em "Substituir e Deletar"
7. As 3 contas são reatribuídas para "Saúde"
8. Categoria "Academia" é deletada

## Validações

### Criar Categoria
- ✅ Nome obrigatório
- ✅ Mínimo 2 caracteres
- ✅ Sem duplicação (case-insensitive)
- ✅ Máximo 50 caracteres (recomendado)

### Editar Categoria
- ✅ Nome obrigatório
- ✅ Mínimo 2 caracteres
- ✅ Sem duplicação com outras categorias (case-insensitive)
- ✅ Não permite editar categorias padrão

### Deletar Categoria
- ✅ Não permite deletar categorias padrão
- ✅ Não permite deletar "Outros"
- ✅ Exige confirmação se categoria está em uso
- ✅ Exige seleção de categoria substituta

## Persistência

Todas as categorias são armazenadas em IndexedDB na tabela `categorias`. As operações são:

- **CREATE:** `db.categorias.add(categoria)`
- **READ:** `db.categorias.get(id)` ou `db.categorias.toArray()`
- **UPDATE:** `db.categorias.update(id, dados)`
- **DELETE:** `db.categorias.delete(id)`

## Integração com Outras Funcionalidades

### Formulário de Contas
- Campo Categoria carrega categorias do banco
- Permite criar categoria inline
- Permite gerenciar categorias inline

### Listagens
- Filtro de categoria usa categorias do banco
- Atualiza dinamicamente quando categorias são criadas/editadas

### Relatórios
- Gráfico "Gastos por Categoria" usa categorias do banco
- Filtro de categoria em relatórios é dinâmico
- Totalizações por categoria refletem mudanças em tempo real

### Auto-save de Rascunhos
- Rascunhos salvam categoria pelo nome
- Ao recuperar rascunho, categoria é restaurada corretamente

## Testes Recomendados

### Teste 1: Criar Categoria
1. Abrir "Nova Conta"
2. Clicar em "+ Nova categoria"
3. Digitar "Netflix"
4. Clicar em "Criar"
5. ✅ Categoria deve aparecer selecionada no Select

### Teste 2: Editar Categoria
1. Clicar em "⚙ Gerenciar categorias"
2. Clicar em editar "Netflix"
3. Mudar para "Streaming"
4. Clicar em "Salvar"
5. ✅ Categoria deve ser atualizada em todas as contas

### Teste 3: Deletar Categoria
1. Clicar em "⚙ Gerenciar categorias"
2. Clicar em deletar "Streaming"
3. Selecionar "Lazer" como substituta
4. Clicar em "Substituir e Deletar"
5. ✅ Contas devem ser reatribuídas e categoria deletada

### Teste 4: Filtrar por Categoria
1. Ir para "Todas as Contas"
2. Marcar checkbox de "Netflix" (ou categoria personalizada)
3. ✅ Apenas contas com essa categoria devem aparecer

### Teste 5: Relatório por Categoria
1. Ir para "Relatórios"
2. Gráfico "Gastos por Categoria" deve incluir categorias personalizadas
3. ✅ Valores devem estar corretos

## Arquivos Modificados/Criados

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `client/src/lib/db.ts` | Modificado | Adicionada tabela `categorias` e função de inicialização |
| `client/src/lib/categorias.ts` | Criado | Funções CRUD de categorias |
| `client/src/components/NovaCategoriModal.tsx` | Criado | Modal para criar nova categoria |
| `client/src/components/GerenciarCategoriasModal.tsx` | Criado | Modal para gerenciar categorias |
| `client/src/pages/FormularioConta.tsx` | Modificado | Integração de categorias no formulário |
| `client/src/pages/ListaContas.tsx` | Modificado | Filtro de categorias dinâmico |
| `client/src/pages/Relatorios.tsx` | Modificado | Gráfico e filtro de categorias dinâmicos |

## Próximos Passos

1. **Importação de Categorias via CSV:** Permitir que usuários importem categorias personalizadas de um arquivo CSV.

2. **Ícones Customizáveis:** Permitir que cada categoria tenha um ícone personalizado.

3. **Cores Customizáveis:** Permitir que cada categoria tenha uma cor associada para melhor visualização.

4. **Reordenação Drag-and-Drop:** Permitir reordenar categorias personalizadas via drag-and-drop.

5. **Histórico de Categorias:** Manter histórico de mudanças de nome de categorias para auditoria.

## Suporte

Para dúvidas ou problemas com o sistema de categorias, consulte:
- `client/src/lib/categorias.ts` - Implementação das funções
- `client/src/components/NovaCategoriModal.tsx` - Interface de criação
- `client/src/components/GerenciarCategoriasModal.tsx` - Interface de gerenciamento
