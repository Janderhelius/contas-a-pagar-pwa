/**
 * Funções para geração de relatórios a partir do banco de dados
 */

import { db } from './db';
import { Conta, StatusConta } from './types';

export interface FiltrosRelatorio {
  dataInicio: Date;
  dataFim: Date;
  status?: StatusConta[];
  categorias?: string[];
  formasPagamento?: string[];
  busca?: string;
}

export interface ResumoRelatorio {
  totalPrevisto: number;
  totalPago: number;
  totalAtrasado: number;
  quantidadePendentes: number;
  quantidadePagas: number;
  quantidadeAtrasadas: number;
  totalContas: number;
}

export interface ContaPorVencimento extends Conta {
  diasAteVencimento: number;
  statusVisual: 'vencendo-hoje' | 'vencendo-7dias' | 'atrasada' | 'normal';
}

export interface GastoPorCategoria {
  categoria: string;
  total: number;
  quantidade: number;
  percentual: number;
}

export interface PagamentoRealizado {
  dataPagamento: Date;
  titulo: string;
  valorOriginal: number;
  valorPago: number;
  categoria: string;
  formaPagamento: string;
}

export interface ContaAtrasada {
  diasAtraso: number;
  vencimento: Date;
  titulo: string;
  valor: number;
  categoria: string;
}

export interface VencimentoProximo {
  dias: number;
  titulo: string;
  valor: number;
  vencimento: Date;
  categoria: string;
  status: StatusConta;
}

/**
 * Gera resumo do período com totalizações
 */
export async function getReportSummary(filtros: FiltrosRelatorio): Promise<ResumoRelatorio> {
  const contas = await db.contas.toArray();
  const filtradas = filtrarContas(contas, filtros);

  const pendentes = filtradas.filter(c => c.status === 'Pendente');
  const pagas = filtradas.filter(c => c.status === 'Pago');
  const atrasadas = filtradas.filter(c => c.status === 'Atrasado');

  const totalPrevisto = pendentes.reduce((sum, c) => sum + c.valor, 0) +
                        atrasadas.reduce((sum, c) => sum + c.valor, 0);
  const totalPago = pagas.reduce((sum, c) => sum + (c.valorPago || 0), 0);
  const totalAtrasado = atrasadas.reduce((sum, c) => sum + c.valor, 0);

  return {
    totalPrevisto,
    totalPago,
    totalAtrasado,
    quantidadePendentes: pendentes.length,
    quantidadePagas: pagas.length,
    quantidadeAtrasadas: atrasadas.length,
    totalContas: filtradas.length,
  };
}

/**
 * Retorna contas ordenadas por vencimento com status visual
 */
export async function getBillsByDueDate(filtros: FiltrosRelatorio): Promise<ContaPorVencimento[]> {
  const contas = await db.contas.toArray();
  const filtradas = filtrarContas(contas, filtros);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return filtradas
    .map(conta => {
      const vencimento = new Date(conta.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      
      const diasAteVencimento = Math.floor((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      let statusVisual: 'vencendo-hoje' | 'vencendo-7dias' | 'atrasada' | 'normal' = 'normal';
      if (diasAteVencimento < 0) {
        statusVisual = 'atrasada';
      } else if (diasAteVencimento === 0) {
        statusVisual = 'vencendo-hoje';
      } else if (diasAteVencimento <= 7) {
        statusVisual = 'vencendo-7dias';
      }

      return {
        ...conta,
        diasAteVencimento,
        statusVisual,
      };
    })
    .sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());
}

/**
 * Retorna totalizações por categoria
 */
export async function getCategoryTotals(filtros: FiltrosRelatorio): Promise<GastoPorCategoria[]> {
  const contas = await db.contas.toArray();
  const filtradas = filtrarContas(contas, filtros);

  const totalGeral = filtradas.reduce((sum, c) => sum + c.valor, 0);

  const porCategoria: Record<string, { total: number; quantidade: number }> = {};

  filtradas.forEach(conta => {
    if (!porCategoria[conta.categoria]) {
      porCategoria[conta.categoria] = { total: 0, quantidade: 0 };
    }
    porCategoria[conta.categoria].total += conta.valor;
    porCategoria[conta.categoria].quantidade += 1;
  });

  return Object.entries(porCategoria)
    .map(([categoria, dados]) => ({
      categoria,
      total: dados.total,
      quantidade: dados.quantidade,
      percentual: (dados.total / totalGeral) * 100,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Retorna histórico de pagamentos realizados
 */
export async function getPaidHistory(filtros: FiltrosRelatorio): Promise<PagamentoRealizado[]> {
  const contas = await db.contas.toArray();
  
  const pagas = contas.filter(c => 
    c.status === 'Pago' && 
    c.dataPagamento &&
    c.dataPagamento >= filtros.dataInicio &&
    c.dataPagamento <= filtros.dataFim
  );

  return pagas
    .map(conta => ({
      dataPagamento: conta.dataPagamento!,
      titulo: conta.titulo,
      valorOriginal: conta.valor,
      valorPago: conta.valorPago || conta.valor,
      categoria: conta.categoria,
      formaPagamento: conta.formaPagamento,
    }))
    .sort((a, b) => b.dataPagamento.getTime() - a.dataPagamento.getTime());
}

/**
 * Retorna relatório de contas atrasadas
 */
export async function getOverdueReport(filtros: FiltrosRelatorio): Promise<ContaAtrasada[]> {
  const contas = await db.contas.toArray();
  const filtradas = filtrarContas(contas, filtros);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const atrasadas = filtradas
    .filter(c => c.status === 'Atrasado')
    .map(conta => {
      const vencimento = new Date(conta.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      
      const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));

      return {
        diasAtraso,
        vencimento,
        titulo: conta.titulo,
        valor: conta.valor,
        categoria: conta.categoria,
      };
    })
    .sort((a, b) => b.diasAtraso - a.diasAtraso);

  return atrasadas;
}

/**
 * Retorna próximos vencimentos em N dias
 */
export async function getUpcomingBills(dias: number, filtros: FiltrosRelatorio): Promise<VencimentoProximo[]> {
  const contas = await db.contas.toArray();
  const filtradas = filtrarContas(contas, filtros);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const futuro = new Date(hoje);
  futuro.setDate(futuro.getDate() + dias);

  return filtradas
    .filter(c => {
      const vencimento = new Date(c.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      return vencimento >= hoje && vencimento <= futuro && c.status !== 'Pago';
    })
    .map(conta => {
      const vencimento = new Date(conta.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);
      
      const diasAteVencimento = Math.floor((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      return {
        dias: diasAteVencimento,
        titulo: conta.titulo,
        valor: conta.valor,
        vencimento,
        categoria: conta.categoria,
        status: conta.status,
      };
    })
    .sort((a, b) => a.vencimento.getTime() - b.vencimento.getTime());
}

/**
 * Função auxiliar para filtrar contas
 */
function filtrarContas(contas: Conta[], filtros: FiltrosRelatorio): Conta[] {
  return contas.filter(conta => {
    // Filtro de período por vencimento
    const vencimento = new Date(conta.dataVencimento);
    if (vencimento < filtros.dataInicio || vencimento > filtros.dataFim) {
      return false;
    }

    // Filtro de status
    if (filtros.status && filtros.status.length > 0) {
      if (!filtros.status.includes(conta.status)) {
        return false;
      }
    }

    // Filtro de categorias
    if (filtros.categorias && filtros.categorias.length > 0) {
      if (!filtros.categorias.includes(conta.categoria)) {
        return false;
      }
    }

    // Filtro de formas de pagamento
    if (filtros.formasPagamento && filtros.formasPagamento.length > 0) {
      if (!filtros.formasPagamento.includes(conta.formaPagamento)) {
        return false;
      }
    }

    // Filtro de busca por texto
    if (filtros.busca && filtros.busca.trim()) {
      const busca = filtros.busca.toLowerCase();
      const temNoTitulo = conta.titulo.toLowerCase().includes(busca);
      const temNoBeneficiario = conta.beneficiario.toLowerCase().includes(busca);
      if (!temNoTitulo && !temNoBeneficiario) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Exporta dados para CSV
 */
export function exportarCSV(dados: any[], nomeArquivo: string = 'relatorio.csv'): void {
  if (!dados || dados.length === 0) {
    console.warn('Nenhum dado para exportar');
    return;
  }

  // Obter headers
  const headers = Object.keys(dados[0]);

  // Criar CSV
  let csv = headers.join(',') + '\n';
  dados.forEach(linha => {
    const valores = headers.map(header => {
      let valor = linha[header];
      
      // Tratar datas
      if (valor instanceof Date) {
        valor = valor.toLocaleDateString('pt-BR');
      }
      
      // Tratar números
      if (typeof valor === 'number') {
        valor = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      
      // Escapar aspas
      if (typeof valor === 'string' && valor.includes(',')) {
        valor = `"${valor}"`;
      }
      
      return valor || '';
    });
    csv += valores.join(',') + '\n';
  });

  // Fazer download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', nomeArquivo);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
