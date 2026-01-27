/**
 * Inicialização e configuração do IndexedDB com Dexie.js
 */

import Dexie, { Table } from 'dexie';
import { Conta, Lembrete, Configuracoes } from './types';

export interface Categoria {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Rascunho {
  id: string;
  dados: Record<string, any>;
  criadoEm: Date;
  atualizadoEm: Date;
}

export class ContasDB extends Dexie {
  contas!: Table<Conta>;
  lembretes!: Table<Lembrete>;
  configuracoes!: Table<Configuracoes>;
  rascunhos!: Table<Rascunho>;
  categorias!: Table<Categoria>;

  constructor() {
    super('ContasDB');
    this.version(2).stores({
      contas: '++id, dataVencimento, status, categoria, criadoEm',
      lembretes: '++id, contaId, proximaNotificacao, ativo',
      configuracoes: '++id',
      rascunhos: 'id, atualizadoEm',
      categorias: 'id, isDefault, isActive, sortOrder',
    });
  }
}

export const db = new ContasDB();

/**
 * Categorias padrão obrigatórias do sistema
 */
const CATEGORIAS_PADRAO_SEED = [
  { name: 'Aluguel', sortOrder: 1 },
  { name: 'Condomínio', sortOrder: 2 },
  { name: 'Luz', sortOrder: 3 },
  { name: 'Internet', sortOrder: 4 },
  { name: 'Fornecedores', sortOrder: 5 },
  { name: 'Alimentação', sortOrder: 6 },
  { name: 'Lanche', sortOrder: 7 },
  { name: 'Passagem', sortOrder: 8 },
  { name: 'Mercado', sortOrder: 9 },
  { name: 'Serviços', sortOrder: 10 },
];

/**
 * Normaliza nome de categoria para comparação (case-insensitive, sem acentos)
 */
function normalizarNomeCategoria(nome: string): string {
  return nome
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Seed robusto de categorias padrão com upsert
 * - Cria categorias padrão se não existirem
 * - Reativa categorias padrão marcadas como inativas
 * - Evita duplicatas por normalização de nome
 */
export async function seedCategoriasPadrao() {
  try {
    const agora = new Date();
    const todasAsCategorias = await db.categorias.toArray();

    for (const catPadrao of CATEGORIAS_PADRAO_SEED) {
      const nomeNormalizado = normalizarNomeCategoria(catPadrao.name);

      // Procura por categoria com mesmo nome normalizado
      const categoriaExistente = todasAsCategorias.find(
        c => normalizarNomeCategoria(c.name) === nomeNormalizado
      );

      if (categoriaExistente) {
        // Se existe, garante que está ativa e marcada como padrão
        if (!categoriaExistente.isActive || !categoriaExistente.isDefault) {
          await db.categorias.update(categoriaExistente.id, {
            isActive: true,
            isDefault: true,
            atualizadoEm: agora,
          });
          console.log(`✓ Categoria padrão reativada: ${catPadrao.name}`);
        }
      } else {
        // Se não existe, cria nova
        const novaCategoria: Categoria = {
          id: `default-${Date.now()}-${Math.random()}`,
          name: catPadrao.name,
          isDefault: true,
          isActive: true,
          sortOrder: catPadrao.sortOrder,
          criadoEm: agora,
          atualizadoEm: agora,
        };

        await db.categorias.add(novaCategoria);
        console.log(`✓ Categoria padrão criada: ${catPadrao.name}`);
      }
    }

    console.log('✓ Seed de categorias padrão concluído com sucesso');
  } catch (erro) {
    console.error('Erro ao fazer seed de categorias padrão:', erro);
    throw erro;
  }
}

/**
 * Salva um rascunho automaticamente
 */
export async function salvarRascunho(id: string, dados: Record<string, any>) {
  try {
    const rascunhoExistente = await db.rascunhos.get(id);
    
    if (rascunhoExistente) {
      await db.rascunhos.update(id, {
        dados,
        atualizadoEm: new Date(),
      });
    } else {
      await db.rascunhos.add({
        id,
        dados,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      });
    }
  } catch (erro) {
    console.error('Erro ao salvar rascunho:', erro);
  }
}

/**
 * Recupera um rascunho salvo
 */
export async function obterRascunho(id: string) {
  try {
    return await db.rascunhos.get(id);
  } catch (erro) {
    console.error('Erro ao obter rascunho:', erro);
    return null;
  }
}

/**
 * Deleta um rascunho após salvar com sucesso
 */
export async function deletarRascunho(id: string) {
  try {
    await db.rascunhos.delete(id);
  } catch (erro) {
    console.error('Erro ao deletar rascunho:', erro);
  }
}

/**
 * Lista todos os rascunhos salvos
 */
export async function listarRascunhos() {
  try {
    return await db.rascunhos.toArray();
  } catch (erro) {
    console.error('Erro ao listar rascunhos:', erro);
    return [];
  }
}

/**
 * Inicializa as categorias padrão na primeira execução
 * DEPRECATED: Use seedCategoriasPadrao() em vez disso
 */
export async function inicializarCategoriasPadrao() {
  try {
    const existentes = await db.categorias.toArray();
    if (existentes.length === 0) {
      const categoriasPadrao = [
        { name: 'Moradia', sortOrder: 1 },
        { name: 'Cartão', sortOrder: 2 },
        { name: 'Serviços', sortOrder: 3 },
        { name: 'Saúde', sortOrder: 4 },
        { name: 'Educação', sortOrder: 5 },
        { name: 'Transporte', sortOrder: 6 },
        { name: 'Lazer', sortOrder: 7 },
        { name: 'Outros', sortOrder: 8 },
      ];

      const agora = new Date();
      const categoriasParaAdicionar = categoriasPadrao.map((cat, idx) => ({
        id: `default-${idx}`,
        name: cat.name,
        isDefault: true,
        isActive: true,
        sortOrder: cat.sortOrder,
        criadoEm: agora,
        atualizadoEm: agora,
      }));
      await db.categorias.bulkAdd(categoriasParaAdicionar);
    }
  } catch (erro) {
    console.error('Erro ao inicializar categorias padrão:', erro);
  }
}

/**
 * Inicializa as configurações padrão se não existirem
 */
export async function inicializarConfiguracoesDefault() {
  const configExistente = await db.configuracoes.get('config');

  if (!configExistente) {
    await db.configuracoes.add({
      id: 'config',
      categoriasPersonalizadas: [],
      notificacoesAtivas: true,
      temaEscuro: false,
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    });
  }
}

/**
 * Limpa todos os dados do banco (útil para testes)
 */
export async function limparBancoDados() {
  await db.contas.clear();
  await db.lembretes.clear();
  await db.configuracoes.clear();
}

/**
 * Exporta dados para JSON
 */
export async function exportarDados() {
  const contas = await db.contas.toArray();
  const lembretes = await db.lembretes.toArray();
  const configuracoes = await db.configuracoes.toArray();

  return {
    versao: '1.0',
    dataExportacao: new Date().toISOString(),
    contas,
    lembretes,
    configuracoes,
  };
}

/**
 * Importa dados de JSON
 */
export async function importarDados(dados: any) {
  try {
    if (dados.contas && Array.isArray(dados.contas)) {
      // Converte strings de data para Date objects
      const contasProcessadas = dados.contas.map((c: any) => ({
        ...c,
        dataEmissao: new Date(c.dataEmissao),
        dataVencimento: new Date(c.dataVencimento),
        dataPagamento: c.dataPagamento ? new Date(c.dataPagamento) : undefined,
        criadoEm: new Date(c.criadoEm),
        atualizadoEm: new Date(c.atualizadoEm),
        recorrencia: {
          ...c.recorrencia,
          dataProximaGeracao: c.recorrencia?.dataProximaGeracao
            ? new Date(c.recorrencia.dataProximaGeracao)
            : undefined,
        },
      }));

      await db.contas.bulkAdd(contasProcessadas);
    }

    if (dados.lembretes && Array.isArray(dados.lembretes)) {
      const lembretesProcessados = dados.lembretes.map((l: any) => ({
        ...l,
        proximaNotificacao: l.proximaNotificacao ? new Date(l.proximaNotificacao) : undefined,
        criadoEm: new Date(l.criadoEm),
        atualizadoEm: new Date(l.atualizadoEm),
      }));

      await db.lembretes.bulkAdd(lembretesProcessados);
    }

    return { sucesso: true, mensagem: 'Dados importados com sucesso' };
  } catch (erro) {
    console.error('Erro ao importar dados:', erro);
    return { sucesso: false, mensagem: 'Erro ao importar dados' };
  }
}
