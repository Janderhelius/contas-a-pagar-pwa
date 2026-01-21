/**
 * Utilitários de formatação para datas, moeda e outros tipos
 */

/**
 * Formata data para o padrão brasileiro DD/MM/YYYY
 */
export function formatarData(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/**
 * Formata data e hora para o padrão brasileiro DD/MM/YYYY HH:mm
 */
export function formatarDataHora(data: Date | string): string {
  const d = typeof data === 'string' ? new Date(data) : data;
  const data_formatada = formatarData(d);
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');
  return `${data_formatada} ${hora}:${minuto}`;
}

/**
 * Formata valor em BRL
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Converte string DD/MM/YYYY para Date
 */
export function parseDataBrasileira(dataStr: string): Date {
  const [dia, mes, ano] = dataStr.split('/').map(Number);
  return new Date(ano, mes - 1, dia);
}

/**
 * Retorna a diferença em dias entre duas datas
 */
export function diasEntre(data1: Date, data2: Date): number {
  const ms = data2.getTime() - data1.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Retorna uma descrição legível da diferença de dias
 */
export function descricaoDiasRestantes(dataVencimento: Date): string {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);

  const dias = diasEntre(hoje, vencimento);

  if (dias < 0) {
    return `Atrasado há ${Math.abs(dias)} dia(s)`;
  }
  if (dias === 0) {
    return 'Vence hoje';
  }
  if (dias === 1) {
    return 'Vence amanhã';
  }
  return `Vence em ${dias} dias`;
}

/**
 * Retorna o status visual (cor) baseado no status da conta
 */
export function obterCorStatus(status: string): string {
  switch (status) {
    case 'Pago':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Atrasado':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'Pendente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Retorna o ícone emoji para uma categoria
 */
export function obterIconeCategoria(categoria: string): string {
  const iconesCategoria: Record<string, string> = {
    Moradia: '🏠',
    Cartão: '💳',
    Serviços: '🔧',
    Saúde: '⚕️',
    Educação: '📚',
    Transporte: '🚗',
    Lazer: '🎮',
    Outros: '📦',
  };
  return iconesCategoria[categoria] || '📋';
}

/**
 * Retorna o ícone para uma forma de pagamento
 */
export function obterIconeFormaPagamento(forma: string): string {
  const iconesForma: Record<string, string> = {
    PIX: '📱',
    Boleto: '📄',
    Cartão: '💳',
    Dinheiro: '💵',
    Transferência: '🏦',
    Outro: '❓',
  };
  return iconesForma[forma] || '❓';
}

/**
 * Formata um horário HH:mm para exibição
 */
export function formatarHorario(horario: string): string {
  return horario; // Já está no formato correto
}

/**
 * Calcula a próxima data de vencimento baseada na recorrência
 */
export function calcularProximoVencimento(
  dataVencimentoAtual: Date,
  tipoRecorrencia: string,
  intervalo?: number
): Date {
  const proxima = new Date(dataVencimentoAtual);

  switch (tipoRecorrencia) {
    case 'Mensal':
      proxima.setMonth(proxima.getMonth() + 1);
      break;
    case 'Semanal':
      proxima.setDate(proxima.getDate() + 7);
      break;
    case 'Anual':
      proxima.setFullYear(proxima.getFullYear() + 1);
      break;
    case 'Personalizada':
      if (intervalo) {
        proxima.setDate(proxima.getDate() + intervalo);
      }
      break;
    default:
      return dataVencimentoAtual;
  }

  return proxima;
}

/**
 * Retorna o nome do mês em português
 */
export function obterNomeMes(data: Date): string {
  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return meses[data.getMonth()];
}

/**
 * Retorna o nome do dia da semana em português
 */
export function obterNomeDiaSemana(data: Date): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return dias[data.getDay()];
}
