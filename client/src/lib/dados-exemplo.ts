/**
 * Dados de exemplo para demonstração do aplicativo
 */

import { Conta, Lembrete } from './types';
import { v4 as uuid } from 'uuid';

export function gerarDadosExemplo(): { contas: Conta[]; lembretes: Lembrete[] } {
  const hoje = new Date();
  const proximos30Dias = new Date(hoje);
  proximos30Dias.setDate(proximos30Dias.getDate() + 30);

  const contas: Conta[] = [
    {
      id: uuid(),
      titulo: 'Aluguel',
      categoria: 'Aluguel',
      valor: 1500.00,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 5),
      observacoes: 'Aluguel do apartamento',
      status: 'Pendente',
      recorrencia: { tipo: 'Mensal' },
      formaPagamento: 'Transferência',
      beneficiario: 'Imobiliária XYZ',
      linkCodigo: '12345.67890 12345.678901 12345.678901 1 12345678901234',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: uuid(),
      titulo: 'Conta de Água',
      categoria: 'Serviços',
      valor: 85.50,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 10),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 20),
      observacoes: 'Consumo: 12m³',
      status: 'Pendente',
      recorrencia: { tipo: 'Mensal' },
      formaPagamento: 'Boleto',
      beneficiario: 'Companhia de Água',
      linkCodigo: '12345.67890 12345.678901 12345.678901 1 12345678901234',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: uuid(),
      titulo: 'Conta de Luz',
      categoria: 'Luz',
      valor: 250.00,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 10),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 25),
      observacoes: 'Consumo: 350 kWh',
      status: 'Pendente',
      recorrencia: { tipo: 'Mensal' },
      formaPagamento: 'Boleto',
      beneficiario: 'Companhia de Eletricidade',
      linkCodigo: '12345.67890 12345.678901 12345.678901 1 12345678901234',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: uuid(),
      titulo: 'Fatura Cartão de Crédito',
      categoria: 'Cartão',
      valor: 2345.67,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 5),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 15),
      observacoes: 'Fatura do mês',
      status: 'Pendente',
      recorrencia: { tipo: 'Mensal' },
      formaPagamento: 'Transferência',
      beneficiario: 'Banco ABC',
      linkCodigo: '00190.00009 01523.510046 91570.775008 1 12345678901234',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: uuid(),
      titulo: 'Plano de Internet',
      categoria: 'Serviços',
      valor: 99.90,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 8),
      observacoes: 'Plano 300 Mbps',
      status: 'Pendente',
      recorrencia: { tipo: 'Mensal' },
      formaPagamento: 'PIX',
      beneficiario: 'Provedor de Internet',
      linkCodigo: '00020.39240 91350.690071 91220.150008 2 12345678901234',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: uuid(),
      titulo: 'Plano de Celular',
      categoria: 'Serviços',
      valor: 79.90,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 12),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 12),
      observacoes: 'Plano ilimitado',
      status: 'Pago',
      dataPagamento: new Date(),
      valorPago: 79.90,
      recorrencia: { tipo: 'Mensal' },
      formaPagamento: 'PIX',
      beneficiario: 'Operadora de Celular',
      linkCodigo: '00020.39240 91350.690071 91220.150008 2 12345678901234',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: uuid(),
      titulo: 'Consulta Médica',
      categoria: 'Saúde',
      valor: 150.00,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 15),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5),
      observacoes: 'Consulta com cardiologista',
      status: 'Pendente',
      recorrencia: { tipo: 'Nenhuma' },
      formaPagamento: 'Dinheiro',
      beneficiario: 'Clínica de Saúde',
      linkCodigo: '',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: uuid(),
      titulo: 'Mensalidade Academia',
      categoria: 'Lazer',
      valor: 120.00,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 10),
      observacoes: 'Academia Premium',
      status: 'Pendente',
      recorrencia: { tipo: 'Mensal' },
      formaPagamento: 'Cartão',
      beneficiario: 'Academia XYZ',
      linkCodigo: '',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: uuid(),
      titulo: 'Seguro do Carro',
      categoria: 'Transporte',
      valor: 450.00,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1),
      observacoes: 'Seguro anual',
      status: 'Pendente',
      recorrencia: { tipo: 'Anual' },
      formaPagamento: 'Boleto',
      beneficiario: 'Seguradora ABC',
      linkCodigo: '12345.67890 12345.678901 12345.678901 1 12345678901234',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: uuid(),
      titulo: 'Mensalidade Escola',
      categoria: 'Educação',
      valor: 800.00,
      dataEmissao: new Date(hoje.getFullYear(), hoje.getMonth(), 5),
      dataVencimento: new Date(hoje.getFullYear(), hoje.getMonth(), 10),
      observacoes: 'Ensino fundamental',
      status: 'Pendente',
      recorrencia: { tipo: 'Mensal' },
      formaPagamento: 'Transferência',
      beneficiario: 'Escola ABC',
      linkCodigo: '',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
  ];

  // Gera lembretes para as contas
  const lembretes: Lembrete[] = contas.map(conta => ({
    id: uuid(),
    contaId: conta.id,
    tipo: 'diasAntes',
    diasAntes: 3,
    horario: '09:00',
    ativo: true,
    repetirSeAtrasado: true,
    proximaNotificacao: new Date(
      conta.dataVencimento.getFullYear(),
      conta.dataVencimento.getMonth(),
      conta.dataVencimento.getDate() - 3,
      9,
      0,
      0
    ),
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  }));

  return { contas, lembretes };
}

/**
 * Insere dados de exemplo no banco de dados
 */
export async function inserirDadosExemplo(db: any) {
  try {
    const { contas, lembretes } = gerarDadosExemplo();

    await db.contas.bulkAdd(contas);
    await db.lembretes.bulkAdd(lembretes);

    console.log('✓ Dados de exemplo inseridos com sucesso!');
    return { sucesso: true, contasInseridas: contas.length, lembretesInseridos: lembretes.length };
  } catch (erro) {
    console.error('Erro ao inserir dados de exemplo:', erro);
    return { sucesso: false, erro };
  }
}
