/**
 * Página Home - Dashboard Principal
 * Exibe resumo financeiro, próximos vencimentos e gráficos
 */

import { useContas } from '@/contexts/ContasContext';
import { useLembretes } from '@/contexts/LembretesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { formatarMoeda, formatarData, obterIconeCategoria } from '@/lib/formatadores';
import { CATEGORIAS_PADRAO } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Plus, AlertCircle, CheckCircle2, Clock, Check } from 'lucide-react';

export default function Home() {
  const { contas, carregando, atualizarConta } = useContas();
  const { lembretes } = useLembretes();

  const handleMarcarComoPago = async (conta: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await atualizarConta(conta.id, {
        status: 'Pago',
        dataPagamento: new Date(),
        valorPago: conta.valor,
      });
    } catch (erro) {
      console.error('Erro ao marcar como pago:', erro);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando contas...</p>
        </div>
      </div>
    );
  }

  // Calcula resumo financeiro
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const contasMes = contas.filter(c => {
    const cMes = c.dataVencimento.getMonth();
    const cAno = c.dataVencimento.getFullYear();
    return cMes === mesAtual && cAno === anoAtual;
  });

  const totalMes = contasMes.reduce((sum, c) => sum + c.valor, 0);
  const totalPago = contas
    .filter(c => c.status === 'Pago' && c.dataPagamento)
    .reduce((sum, c) => sum + (c.valorPago || c.valor), 0);
  const totalAtrasado = contas
    .filter(c => c.status === 'Atrasado')
    .reduce((sum, c) => sum + c.valor, 0);

  // Próximos vencimentos (30 dias)
  const proximosVencimentos = contas
    .filter(c => {
      const dataLimite = new Date(hoje);
      dataLimite.setDate(dataLimite.getDate() + 30);
      return c.dataVencimento >= hoje && c.dataVencimento <= dataLimite && c.status !== 'Pago';
    })
    .sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime())
    .slice(0, 5);

  // Contas atrasadas
  const contasAtrasadas = contas.filter(c => c.status === 'Atrasado');

  // Dados para gráfico de categorias
  const porCategoria: Record<string, number> = {};
  contas.forEach(c => {
    if (c.status !== 'Pago') {
      porCategoria[c.categoria] = (porCategoria[c.categoria] || 0) + c.valor;
    }
  });

  const dadosGrafico = Object.entries(porCategoria).map(([categoria, valor]) => ({
    name: categoria,
    value: valor,
  }));

  const cores = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

  // Contas vencendo hoje
  const vencendoHoje = contas.filter(c => {
    const cHoje = new Date(c.dataVencimento);
    cHoje.setHours(0, 0, 0, 0);
    return cHoje.getTime() === hoje.getTime() && c.status !== 'Pago';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Controle de Contas</h1>
            <p className="text-sm text-gray-600 mt-1">Gerencie suas contas a pagar com facilidade</p>
          </div>
          <Link href="/contas/nova">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Conta
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Alertas */}
        {vencendoHoje.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Contas vencendo hoje</h3>
              <p className="text-sm text-yellow-800 mt-1">
                {vencendoHoje.length} conta(s) vence(m) hoje. Verifique a lista abaixo.
              </p>
            </div>
          </div>
        )}

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatarMoeda(totalMes)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {contasMes.length} contas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pago este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatarMoeda(totalPago)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {contas.filter(c => c.status === 'Pago').length} contas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Atrasado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatarMoeda(totalAtrasado)}</div>
              <p className="text-xs text-gray-500 mt-1">{contasAtrasadas.length} contas</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Lembretes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{lembretes.filter(l => l.ativo).length}</div>
              <p className="text-xs text-gray-500 mt-1">notificações</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Próximos Vencimentos */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Próximos Vencimentos (30 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proximosVencimentos.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma conta vencendo nos próximos 30 dias</p>
                ) : (
                  <div className="space-y-3">
                    {proximosVencimentos.map(conta => (
                      <div key={conta.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-between gap-3">
                        <Link href={`/contas/${conta.id}`} className="flex-1 min-w-0">
                          <div className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="text-lg flex-shrink-0">{obterIconeCategoria(conta.categoria)}</span>
                              <h4 className="font-semibold text-gray-900 truncate">{conta.titulo}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 truncate">{conta.beneficiario}</p>
                          </div>
                        </Link>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900">{formatarMoeda(conta.valor)}</p>
                          <p className="text-xs text-gray-500">{formatarData(conta.dataVencimento)}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 flex-shrink-0"
                          onClick={(e) => handleMarcarComoPago(conta, e)}
                          title="Marcar como pago"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Categorias */}
          {dadosGrafico.length > 0 && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosGrafico}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosGrafico.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatarMoeda(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/contas">
            <Button variant="outline" className="w-full justify-center">
              Ver Todas as Contas
            </Button>
          </Link>
          <Link href="/lembretes">
            <Button variant="outline" className="w-full justify-center">
              Central de Lembretes
            </Button>
          </Link>
          <Link href="/configuracoes">
            <Button variant="outline" className="w-full justify-center">
              Configurações
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
