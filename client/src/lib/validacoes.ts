/**
 * Validações para formulários e dados
 * Sistema robusto com suporte a campos condicionais
 */

import { Conta } from './types';

export interface ErrosValidacao {
  [campo: string]: string;
}

/**
 * Valida um valor monetário
 */
export function validarValor(valor: any): string | null {
  const num = Number(valor);
  if (isNaN(num)) {
    return 'Valor deve ser um número';
  }
  if (num <= 0) {
    return 'Valor deve ser maior que zero';
  }
  if (num > 999999999.99) {
    return 'Valor muito alto';
  }
  return null;
}

/**
 * Valida um título
 */
export function validarTitulo(titulo: string): string | null {
  if (!titulo || titulo.trim().length === 0) {
    return 'Título é obrigatório';
  }
  if (titulo.length > 100) {
    return 'Título não pode ter mais de 100 caracteres';
  }
  return null;
}

/**
 * Valida uma categoria
 */
export function validarCategoria(
  categoria: string,
  categoriasDisponiveis: string[]
): string | null {
  if (!categoria || categoria.trim().length === 0) {
    return 'Categoria é obrigatória';
  }
  
  // Se não houver categorias disponíveis, não validar (pode estar carregando)
  if (categoriasDisponiveis.length === 0) {
    return null;
  }
  
  if (!categoriasDisponiveis.includes(categoria)) {
    return 'Categoria inválida';
  }
  return null;
}

/**
 * Valida datas
 */
export function validarDatas(
  dataEmissao: Date,
  dataVencimento: Date
): string | null {
  if (!(dataEmissao instanceof Date) || isNaN(dataEmissao.getTime())) {
    return 'Data de emissão inválida';
  }
  if (!(dataVencimento instanceof Date) || isNaN(dataVencimento.getTime())) {
    return 'Data de vencimento inválida';
  }
  if (dataVencimento < dataEmissao) {
    return 'Data de vencimento não pode ser anterior à data de emissão';
  }
  return null;
}

/**
 * Valida um horário HH:mm
 */
export function validarHorario(horario: string): string | null {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!horario || !regex.test(horario)) {
    return 'Horário deve estar no formato HH:mm';
  }
  return null;
}

/**
 * Valida intervalo de recorrência personalizada
 */
export function validarIntervaloRecorrencia(intervalo: any): string | null {
  const num = Number(intervalo);
  if (isNaN(num) || intervalo === '' || intervalo === undefined) {
    return 'Intervalo é obrigatório para recorrência personalizada';
  }
  if (num <= 0) {
    return 'Intervalo deve ser maior que zero';
  }
  if (num > 365) {
    return 'Intervalo não pode ser maior que 365 dias';
  }
  return null;
}

/**
 * Valida uma senha/PIN
 */
export function validarSenha(senha: string): string | null {
  if (!senha || senha.trim().length === 0) {
    return 'Senha é obrigatória';
  }
  if (senha.length < 4) {
    return 'Senha deve ter no mínimo 4 caracteres';
  }
  if (senha.length > 20) {
    return 'Senha não pode ter mais de 20 caracteres';
  }
  return null;
}

/**
 * Valida uma categoria personalizada
 */
export function validarCategoriaPersonalizada(
  categoria: string,
  categoriasExistentes: string[]
): string | null {
  if (!categoria || categoria.trim().length === 0) {
    return 'Categoria não pode estar vazia';
  }
  if (categoria.length > 30) {
    return 'Categoria não pode ter mais de 30 caracteres';
  }
  // Normaliza para comparação case-insensitive
  const categoriaNormalizada = categoria.toLowerCase().trim();
  if (categoriasExistentes.some(c => c.toLowerCase() === categoriaNormalizada)) {
    return 'Esta categoria já existe';
  }
  return null;
}

/**
 * Interface para dados do formulário de conta
 */
export interface FormDataConta {
  titulo: string;
  categoria: string;
  valor: string | number;
  dataEmissao: Date;
  dataVencimento: Date;
  observacoes?: string;
  formaPagamento: string;
  beneficiario?: string;
  linkCodigo?: string;
  recorrencia: string;
  intervaloRecorrencia?: string | number;
  jaFoiPaga?: boolean;
  dataPagamento?: Date;
  valorPago?: string | number;
  criarLembrete?: boolean;
  diasAntes?: string | number;
  horarioLembrete?: string;
  repetirSeAtrasado?: boolean;
}

/**
 * Valida uma conta completa com suporte a campos condicionais
 * @param formData - Dados do formulário
 * @param categoriasDisponiveis - Lista de categorias válidas
 * @returns Objeto com erros por campo (vazio se válido)
 */
export function validarContaCompleta(
  formData: FormDataConta,
  categoriasDisponiveis: string[] = []
): ErrosValidacao {
  const erros: ErrosValidacao = {};

  // === CAMPOS SEMPRE OBRIGATÓRIOS ===

  // Título
  if (formData.titulo) {
    const erroTitulo = validarTitulo(formData.titulo);
    if (erroTitulo) erros.titulo = erroTitulo;
  } else {
    erros.titulo = 'Título é obrigatório';
  }

  // Valor
  if (formData.valor !== undefined && formData.valor !== '') {
    const erroValor = validarValor(formData.valor);
    if (erroValor) erros.valor = erroValor;
  } else {
    erros.valor = 'Valor é obrigatório';
  }

  // Categoria
  if (formData.categoria) {
    const erroCategoria = validarCategoria(formData.categoria, categoriasDisponiveis);
    if (erroCategoria) erros.categoria = erroCategoria;
  } else {
    erros.categoria = 'Categoria é obrigatória';
  }

  // Datas
  if (formData.dataEmissao && formData.dataVencimento) {
    const erroDatas = validarDatas(formData.dataEmissao, formData.dataVencimento);
    if (erroDatas) erros.datas = erroDatas;
  } else {
    if (!formData.dataEmissao) erros.dataEmissao = 'Data de emissão é obrigatória';
    if (!formData.dataVencimento) erros.dataVencimento = 'Data de vencimento é obrigatória';
  }

  // === CAMPOS CONDICIONAIS ===

  // Se marcado como pago
  if (formData.jaFoiPaga) {
    if (!formData.dataPagamento) {
      erros.dataPagamento = 'Data de pagamento é obrigatória para contas pagas';
    }
    if (formData.valorPago === undefined || formData.valorPago === '') {
      erros.valorPago = 'Valor pago é obrigatório para contas pagas';
    } else {
      const erroValorPago = validarValor(formData.valorPago);
      if (erroValorPago) erros.valorPago = erroValorPago;
    }
  }

  // Se recorrência é personalizada
  if (formData.recorrencia === 'Personalizada') {
    const erroIntervalo = validarIntervaloRecorrencia(formData.intervaloRecorrencia);
    if (erroIntervalo) erros.intervaloRecorrencia = erroIntervalo;
  }

  // Se criar lembrete está ativo
  if (formData.criarLembrete) {
    if (!formData.horarioLembrete) {
      erros.horarioLembrete = 'Horário do lembrete é obrigatório';
    } else {
      const erroHorario = validarHorario(formData.horarioLembrete);
      if (erroHorario) erros.horarioLembrete = erroHorario;
    }

    if (formData.diasAntes === undefined || formData.diasAntes === '') {
      erros.diasAntes = 'Dias antes é obrigatório para lembretes';
    } else {
      const num = Number(formData.diasAntes);
      if (isNaN(num) || num < 0) {
        erros.diasAntes = 'Dias antes deve ser um número não-negativo';
      }
    }
  }

  return erros;
}

/**
 * Valida uma conta completa (compatibilidade com código antigo)
 * @deprecated Use validarContaCompleta() em vez disso
 */
export function validarConta(
  conta: Partial<Conta>,
  categoriasDisponiveis: string[] = []
): ErrosValidacao {
  const erros: ErrosValidacao = {};

  if (conta.titulo) {
    const erroTitulo = validarTitulo(conta.titulo);
    if (erroTitulo) erros.titulo = erroTitulo;
  } else {
    erros.titulo = 'Título é obrigatório';
  }

  if (conta.valor !== undefined) {
    const erroValor = validarValor(conta.valor);
    if (erroValor) erros.valor = erroValor;
  } else {
    erros.valor = 'Valor é obrigatório';
  }

  if (conta.categoria) {
    const erroCategoria = validarCategoria(conta.categoria, categoriasDisponiveis);
    if (erroCategoria) erros.categoria = erroCategoria;
  } else {
    erros.categoria = 'Categoria é obrigatória';
  }

  if (conta.dataEmissao && conta.dataVencimento) {
    const erroDatas = validarDatas(conta.dataEmissao, conta.dataVencimento);
    if (erroDatas) erros.datas = erroDatas;
  } else {
    if (!conta.dataEmissao) erros.dataEmissao = 'Data de emissão é obrigatória';
    if (!conta.dataVencimento) erros.dataVencimento = 'Data de vencimento é obrigatória';
  }

  if (conta.formaPagamento && !['PIX', 'Boleto', 'Cartão', 'Dinheiro', 'Transferência', 'Outro'].includes(conta.formaPagamento)) {
    erros.formaPagamento = 'Forma de pagamento inválida';
  }

  if (conta.recorrencia?.tipo === 'Personalizada' && conta.recorrencia.intervalo) {
    const erroIntervalo = validarIntervaloRecorrencia(conta.recorrencia.intervalo);
    if (erroIntervalo) erros.intervalo = erroIntervalo;
  }

  return erros;
}

/**
 * Verifica se há erros de validação
 */
export function temErros(erros: ErrosValidacao): boolean {
  return Object.keys(erros).length > 0;
}

/**
 * Retorna a primeira mensagem de erro
 */
export function obterPrimeiroErro(erros: ErrosValidacao): string | null {
  const chaves = Object.keys(erros);
  return chaves.length > 0 ? erros[chaves[0]] : null;
}

/**
 * Retorna lista formatada de erros para exibição
 */
export function formatarErros(erros: ErrosValidacao): string {
  const mensagens = Object.values(erros);
  if (mensagens.length === 0) return '';
  if (mensagens.length === 1) return mensagens[0];
  return mensagens.map((msg, i) => `${i + 1}. ${msg}`).join('\n');
}
