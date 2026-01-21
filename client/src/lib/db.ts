/**
 * Inicialização e configuração do IndexedDB com Dexie.js
 */

import Dexie, { Table } from 'dexie';
import { Conta, Lembrete, Configuracoes } from './types';

export class ContasDB extends Dexie {
  contas!: Table<Conta>;
  lembretes!: Table<Lembrete>;
  configuracoes!: Table<Configuracoes>;

  constructor() {
    super('ContasDB');
    this.version(1).stores({
      contas: '++id, dataVencimento, status, categoria, criadoEm',
      lembretes: '++id, contaId, proximaNotificacao, ativo',
      configuracoes: '++id',
    });
  }
}

export const db = new ContasDB();

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
