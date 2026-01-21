/**
 * Utilitários de criptografia e segurança
 */

import SHA256 from 'crypto-js/sha256';

/**
 * Gera hash SHA-256 de uma senha
 */
export function hashSenha(senha: string): string {
  return SHA256(senha).toString();
}

/**
 * Verifica se uma senha corresponde ao hash
 */
export function verificarSenha(senha: string, hash: string): boolean {
  return hashSenha(senha) === hash;
}

/**
 * Gera um token de sessão aleatório
 */
export function gerarTokenSessao(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Armazena token de sessão no localStorage
 */
export function armazenarSessao(token: string, duracao: number = 24 * 60 * 60 * 1000) {
  const expiracao = Date.now() + duracao;
  localStorage.setItem('sessao_token', token);
  localStorage.setItem('sessao_expiracao', expiracao.toString());
}

/**
 * Verifica se a sessão é válida
 */
export function verificarSessao(): boolean {
  const token = localStorage.getItem('sessao_token');
  const expiracao = localStorage.getItem('sessao_expiracao');

  if (!token || !expiracao) {
    return false;
  }

  const agora = Date.now();
  const expiracaoNum = Number(expiracao);

  return agora < expiracaoNum;
}

/**
 * Limpa a sessão
 */
export function limparSessao() {
  localStorage.removeItem('sessao_token');
  localStorage.removeItem('sessao_expiracao');
}

/**
 * Obtém o tempo restante da sessão em segundos
 */
export function obterTempoRestanteSessao(): number {
  const expiracao = localStorage.getItem('sessao_expiracao');
  if (!expiracao) return 0;

  const agora = Date.now();
  const expiracaoNum = Number(expiracao);
  const diferenca = expiracaoNum - agora;

  return Math.max(0, Math.floor(diferenca / 1000));
}
