/**
 * Página Relatórios - Análise completa de contas a pagar
 */

import { useState, useEffect, useMemo } from 'react';
import { useContas } from '@/contexts/ContasContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CATEGORIAS_PADRAO, FormaPagamento } from '@/lib/types';
import { formatarData, formatarMoeda, parseDataBrasileira } from '@/lib/formatadores';
import { Home, Download, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';
import {
  FiltrosRelatorio,
  getReportSummary,
  getBillsByDueDate,
  getCategoryTotals,
  getPaidHistory,
  getOverdueReport,
  getUpcomingBills,
  exportarCSV,
} from '@/lib/relatorios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FORMAS_PAGAMENTO: FormaPagamento[] = ['PIX', 'Boleto', 'Cartão', 'Dinheiro', 'Transferência', 'Outro'];

export default function Relatorios() {
  const { contas } = useContas();
  const [carregando, setCarregando] = useState(false);

  // Filtros
  const [dataInicio, setDataInicio] = useState(() => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return formatarData(primeiroDia);
  });

  const [dataFim, setDataFim] = useState(() => formatarData(new Date()));
  const [statusSelecionados, setStatusSelecionados] = useState<string[]>([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  const [formasSelecionadas, setFormasSelecionadas] = useState<string[]>([]);
  const [busca, setBusca] = useState('');

  // Dados dos relatórios
  const [resumo, setResumo] = useState<any>(null);
  const [contasPorVencimento, setContasPorVencimento] = useState<any[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<any[]>([]);
  const [pagamentosRealizados, setPagamentosRealizados] = useState<any[]>([]);
  const [contasAtrasadas, setContasAtrasadas] = useState<any[]>([]);
  const [proximosVencimentos7, setProximosVencimentos7] = useState<any[]>([]);
  const [proximosVencimentos30, setProximosVencimentos30] = useState<any[]>([]);

  // Cores para gráfico
  const CORES = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  // Gerar filtros
  const filtros = useMemo((): FiltrosRelatorio => {
    return {
      dataInicio: parseDataBrasileira(dataInicio),
      dataFim: parseDataBrasileira(dataFim),
      status: statusSelecionados.length > 0 ? (statusSelecionados as any) : undefined,
      categorias: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : undefined,
      formasPagamento: formasSelecionadas.length > 0 ? formasSelecionadas : undefined,
      busca: busca || undefined,
    };
  }, [dataInicio, dataFim, statusSelecionados, categoriasSelecionadas, formasSelecionadas, busca]);

  // Carregar relatórios
  const carregarRelatorios = async () => {
    try {
      setCarregando(true);

      const [resumoData, contasVencimento, gastos, pagos, atrasados, prox7, prox30] = await Promise.all([
        getReportSummary(filtros),
        getBillsByDueDate(filtros),
        getCategoryTotals(filtros),
        getPaidHistory(filtros),
        getOverdueReport(filtros),
        getUpcomingBills(7, filtros),
        getUpcomingBills(30, filtros),
      ]);

      setResumo(resumoData);
      setContasPorVencimento(contasVencimento);
      setGastosPorCategoria(gastos);
      setPagamentosRealizados(pagos);
      setContasAtrasadas(atrasados);
      setProximosVencimentos7(prox7);
      setProximosVencimentos30(prox30);
    } catch (erro) {
      console.error('Erro ao carregar relatórios:', erro);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setCarregando(false);
    }
  };

  // Carregar ao montar e quando filtros mudam
  useEffect(() => {
    carregarRelatorios();
  }, [filtros]);

  const handleLimparFiltros = () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    setDataInicio(formatarData(primeiroDia));
    setDataFim(formatarData(hoje));
    setStatusSelecionados([]);
    setCategoriasSelecionadas([]);
    setFormasSelecionadas([]);
    setBusca('');
  };

  const handleExportarCSV = () => {
    if (!resumo) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    try {
      const dados = contasPorVencimento.map(c => ({
        Vencimento: formatarData(c.dataVencimento),
        Título: c.titulo,
        Categoria: c.categoria,
        Valor: c.valor,
        Status: c.status,
        Beneficiário: c.beneficiario,
      }));

      exportarCSV(dados, `relatorio-contas-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Relatório exportado com sucesso!');
    } catch (erro) {
      console.error('Erro ao exportar:', erro);
      toast.error('Erro ao exportar relatório');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Análise completa de contas a pagar</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              Início
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Data Início */}
              <div>
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Data Fim */}
              <div>
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Status */}
              <div>
                <Label>Status</Label>
                <div className="mt-2 space-y-2">
                  {['Pendente', 'Pago', 'Atrasado'].map(status => (
                    <div key={status} className="flex items-center">
                      <Checkbox
                        id={`status-${status}`}
                        checked={statusSelecionados.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStatusSelecionados([...statusSelecionados, status]);
                          } else {
                            setStatusSelecionados(statusSelecionados.filter(s => s !== status));
                          }
                        }}
                      />
                      <label htmlFor={`status-${status}`} className="ml-2 text-sm cursor-pointer">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorias */}
              <div>
                <Label>Categorias</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {CATEGORIAS_PADRAO.map(cat => (
                    <div key={cat} className="flex items-center">
                      <Checkbox
                        id={`cat-${cat}`}
                        checked={categoriasSelecionadas.includes(cat)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCategoriasSelecionadas([...categoriasSelecionadas, cat]);
                          } else {
                            setCategoriasSelecionadas(categoriasSelecionadas.filter(c => c !== cat));
                          }
                        }}
                      />
                      <label htmlFor={`cat-${cat}`} className="ml-2 text-sm cursor-pointer">
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formas de Pagamento e Busca */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Formas de Pagamento */}
              <div>
                <Label>Forma de Pagamento</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {FORMAS_PAGAMENTO.map(forma => (
                    <div key={forma} className="flex items-center">
                      <Checkbox
                        id={`forma-${forma}`}
                        checked={formasSelecionadas.includes(forma)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormasSelecionadas([...formasSelecionadas, forma]);
                          } else {
                            setFormasSelecionadas(formasSelecionadas.filter(f => f !== forma));
                          }
                        }}
                      />
                      <label htmlFor={`forma-${forma}`} className="ml-2 text-sm cursor-pointer">
                        {forma}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Busca */}
              <div className="lg:col-span-3">
                <Label htmlFor="busca">Buscar por título ou beneficiário</Label>
                <Input
                  id="busca"
                  placeholder="Digite para buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button onClick={carregarRelatorios} disabled={carregando} className="gap-2">
                {carregando ? 'Carregando...' : 'Aplicar Filtros'}
              </Button>
              <Button onClick={handleLimparFiltros} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Limpar
              </Button>
              <Button onClick={handleExportarCSV} variant="outline" className="gap-2 ml-auto">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo do Período */}
        {resumo && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Previsto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatarMoeda(resumo.totalPrevisto)}</div>
                <p className="text-xs text-gray-500 mt-1">{resumo.quantidadePendentes + resumo.quantidadeAtrasadas} contas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Total Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatarMoeda(resumo.totalPago)}</div>
                <p className="text-xs text-gray-500 mt-1">{resumo.quantidadePagas} contas pagas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">Total Atrasado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatarMoeda(resumo.totalAtrasado)}</div>
                <p className="text-xs text-gray-500 mt-1">{resumo.quantidadeAtrasadas} contas atrasadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Total de Contas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{resumo.totalContas}</div>
                <p className="text-xs text-gray-500 mt-1">no período selecionado</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráfico de Gastos por Categoria */}
        {gastosPorCategoria.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gastosPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatarMoeda(value as number)} />
                    <Bar dataKey="total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ranking de Categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gastosPorCategoria.map((cat, idx) => (
                    <div key={cat.categoria} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{idx + 1}. {cat.categoria}</p>
                        <p className="text-xs text-gray-500">{cat.quantidade} contas</p>
                      </div>
                      <p className="font-bold text-sm">{formatarMoeda(cat.total)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Próximos Vencimentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Próximos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              {proximosVencimentos7.length > 0 ? (
                <div className="space-y-3">
                  {proximosVencimentos7.map((v, idx) => (
                    <div key={idx} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{v.titulo}</p>
                        <p className="text-xs text-gray-500">{formatarData(v.vencimento)}</p>
                      </div>
                      <p className="font-bold text-sm">{formatarMoeda(v.valor)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhuma conta vencendo nos próximos 7 dias</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              {proximosVencimentos30.length > 0 ? (
                <div className="space-y-3">
                  {proximosVencimentos30.slice(0, 5).map((v, idx) => (
                    <div key={idx} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{v.titulo}</p>
                        <p className="text-xs text-gray-500">{formatarData(v.vencimento)}</p>
                      </div>
                      <p className="font-bold text-sm">{formatarMoeda(v.valor)}</p>
                    </div>
                  ))}
                  {proximosVencimentos30.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{proximosVencimentos30.length - 5} contas
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Nenhuma conta vencendo nos próximos 30 dias</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Contas por Vencimento */}
        {contasPorVencimento.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contas por Vencimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Vencimento</th>
                      <th className="text-left py-2 px-2">Título</th>
                      <th className="text-left py-2 px-2">Categoria</th>
                      <th className="text-right py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Beneficiário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasPorVencimento.slice(0, 20).map((conta, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{formatarData(conta.dataVencimento)}</td>
                        <td className="py-2 px-2 font-medium">{conta.titulo}</td>
                        <td className="py-2 px-2">{conta.categoria}</td>
                        <td className="py-2 px-2 text-right font-medium">{formatarMoeda(conta.valor)}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            conta.status === 'Pago' ? 'bg-green-100 text-green-800' :
                            conta.status === 'Atrasado' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {conta.status}
                          </span>
                        </td>
                        <td className="py-2 px-2">{conta.beneficiario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {contasPorVencimento.length > 20 && (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Mostrando 20 de {contasPorVencimento.length} contas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Pagamentos Realizados */}
        {pagamentosRealizados.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Pagamentos Realizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Data Pagamento</th>
                      <th className="text-left py-2 px-2">Título</th>
                      <th className="text-right py-2 px-2">Valor Original</th>
                      <th className="text-right py-2 px-2">Valor Pago</th>
                      <th className="text-left py-2 px-2">Categoria</th>
                      <th className="text-left py-2 px-2">Forma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentosRealizados.map((pag, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{formatarData(pag.dataPagamento)}</td>
                        <td className="py-2 px-2 font-medium">{pag.titulo}</td>
                        <td className="py-2 px-2 text-right">{formatarMoeda(pag.valorOriginal)}</td>
                        <td className="py-2 px-2 text-right font-medium text-green-600">{formatarMoeda(pag.valorPago)}</td>
                        <td className="py-2 px-2">{pag.categoria}</td>
                        <td className="py-2 px-2">{pag.formaPagamento}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-bold bg-gray-50">
                      <td colSpan={3} className="py-2 px-2">Total Pago</td>
                      <td className="py-2 px-2 text-right text-green-600">
                        {formatarMoeda(pagamentosRealizados.reduce((sum, p) => sum + p.valorPago, 0))}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Contas Atrasadas */}
        {contasAtrasadas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contas Atrasadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Dias de Atraso</th>
                      <th className="text-left py-2 px-2">Vencimento</th>
                      <th className="text-left py-2 px-2">Título</th>
                      <th className="text-right py-2 px-2">Valor</th>
                      <th className="text-left py-2 px-2">Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasAtrasadas.map((atraso, idx) => (
                      <tr key={idx} className="border-b hover:bg-red-50">
                        <td className="py-2 px-2 font-bold text-red-600">{atraso.diasAtraso}d</td>
                        <td className="py-2 px-2">{formatarData(atraso.vencimento)}</td>
                        <td className="py-2 px-2 font-medium">{atraso.titulo}</td>
                        <td className="py-2 px-2 text-right font-bold text-red-600">{formatarMoeda(atraso.valor)}</td>
                        <td className="py-2 px-2">{atraso.categoria}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t font-bold bg-red-50">
                      <td colSpan={3} className="py-2 px-2">
                        Média de atraso: {(contasAtrasadas.reduce((sum, a) => sum + a.diasAtraso, 0) / contasAtrasadas.length).toFixed(1)} dias
                      </td>
                      <td className="py-2 px-2 text-right text-red-600">
                        {formatarMoeda(contasAtrasadas.reduce((sum, a) => sum + a.valor, 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
