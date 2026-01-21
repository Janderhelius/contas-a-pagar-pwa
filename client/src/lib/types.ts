/**
 * Tipos e interfaces do aplicativo de contas a pagar
 * Definem a estrutura de dados em IndexedDB
 */

export type StatusConta = 'Pendente' | 'Pago' | 'Atrasado';
export type TipoRecorrencia = 'Nenhuma' | 'Mensal' | 'Semanal' | 'Anual' | 'Personalizada';
export type FormaPagamento = 'PIX' | 'Boleto' | 'Cartão' | 'Dinheiro' | 'Transferência' | 'Outro';
export type TipoLembrete = 'vencimento' | 'diasAntes';

export const CATEGORIAS_PADRAO = [
  'Moradia',
  'Cartão',
  'Serviços',
  'Saúde',
  'Educação',
  'Transporte',
  'Lazer',
  'Outros',
];

export interface Comprovante {
  nome: string;
  dados: Blob;
  dataUpload: Date;
}

export interface ConfiguracaoRecorrencia {
  tipo: TipoRecorrencia;
  intervalo?: number; // Para personalizada (em dias)
  dataProximaGeracao?: Date;
}

export interface Conta {
  id: string;
  titulo: string;
  categoria: string;
  valor: number;
  dataEmissao: Date;
  dataVencimento: Date;
  observacoes: string;
  status: StatusConta;
  recorrencia: ConfiguracaoRecorrencia;
  formaPagamento: FormaPagamento;
  beneficiario: string;
  linkCodigo: string;
  comprovante?: Comprovante;
  dataPagamento?: Date;
  valorPago?: number;
  observacaoPagamento?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Lembrete {
  id: string;
  contaId: string;
  tipo: TipoLembrete;
  diasAntes?: number;
  horario: string; // HH:mm
  ativo: boolean;
  repetirSeAtrasado: boolean;
  proximaNotificacao?: Date;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Configuracoes {
  id: string; // "config" (singleton)
  senha?: string; // Hash SHA-256
  categoriasPersonalizadas: string[];
  ultimoBackup?: Date;
  notificacoesAtivas: boolean;
  temaEscuro: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface FiltrosListagem {
  categorias: string[];
  status: StatusConta[];
  dataInicio?: Date;
  dataFim?: Date;
  valorMin?: number;
  valorMax?: number;
  busca: string;
  ordenacao: 'vencimento' | 'valor' | 'categoria';
}

export interface ResumoFinanceiro {
  totalMes: number;
  totalAtrasado: number;
  totalPago: number;
  proximosVencimentos: Conta[];
  porCategoria: Record<string, number>;
}
