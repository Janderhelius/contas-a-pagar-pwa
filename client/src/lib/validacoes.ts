/**
 * Validações para formulários e dados
 */

import { Conta, CATEGORIAS_PADRAO } from './types';

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
  categoriasPersonalizadas: string[]
): string | null {
  const todasCategorias = [...CATEGORIAS_PADRAO, ...categoriasPersonalizadas];
  if (!todasCategorias.includes(categoria)) {
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
  if (!regex.test(horario)) {
    return 'Horário deve estar no formato HH:mm';
  }
  return null;
}

/**
 * Valida intervalo de recorrência personalizada
 */
export function validarIntervaloRecorrencia(intervalo: any): string | null {
  const num = Number(intervalo);
  if (isNaN(num)) {
    return 'Intervalo deve ser um número';
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
export function validarCategoriaPersonalizada(categoria: string): string | null {
  if (!categoria || categoria.trim().length === 0) {
    return 'Categoria não pode estar vazia';
  }
  if (categoria.length > 30) {
    return 'Categoria não pode ter mais de 30 caracteres';
  }
  if (CATEGORIAS_PADRAO.includes(categoria)) {
    return 'Esta categoria já existe';
  }
  return null;
}

/**
 * Valida uma conta completa
 */
export function validarConta(
  conta: Partial<Conta>,
  categoriasPersonalizadas: string[]
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
    const erroCategoria = validarCategoria(conta.categoria, categoriasPersonalizadas);
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
