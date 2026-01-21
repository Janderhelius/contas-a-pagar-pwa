/**
 * Página ListaContas - Listagem com filtros avançados
 */

import { useState, useMemo } from 'react';
import { useContas } from '@/contexts/ContasContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { formatarMoeda, formatarData, obterIconeCategoria, descricaoDiasRestantes } from '@/lib/formatadores';
import { CATEGORIAS_PADRAO, StatusConta } from '@/lib/types';
import { Plus, Search, Filter, Trash2, Edit2, Check, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function ListaContas() {
  const { contas, carregando, deletarConta, atualizarConta } = useContas();
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusConta[]>(['Pendente', 'Atrasado']);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string[]>([]);
  const [ordenacao, setOrdenacao] = useState<'vencimento' | 'valor' | 'categoria'>('vencimento');
  const [valorMin, setValorMin] = useState('');
  const [valorMax, setValorMax] = useState('');

  const contasFiltradas = useMemo(() => {
    let resultado = contas.filter(c => {
      // Filtro de busca
      if (busca && !c.titulo.toLowerCase().includes(busca.toLowerCase()) &&
          !c.beneficiario.toLowerCase().includes(busca.toLowerCase())) {
        return false;
      }

      // Filtro de status
      if (statusFiltro.length > 0 && !statusFiltro.includes(c.status)) {
        return false;
      }

      // Filtro de categoria
      if (categoriaFiltro.length > 0 && !categoriaFiltro.includes(c.categoria)) {
        return false;
      }

      // Filtro de valor
      if (valorMin && c.valor < Number(valorMin)) return false;
      if (valorMax && c.valor > Number(valorMax)) return false;

      return true;
    });

    // Ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'vencimento':
          return a.dataVencimento.getTime() - b.dataVencimento.getTime();
        case 'valor':
          return b.valor - a.valor;
        case 'categoria':
          return a.categoria.localeCompare(b.categoria);
        default:
          return 0;
      }
    });

    return resultado;
  }, [contas, busca, statusFiltro, categoriaFiltro, ordenacao, valorMin, valorMax]);

  const handleToggleStatus = (status: StatusConta) => {
    setStatusFiltro(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleToggleCategoria = (categoria: string) => {
    setCategoriaFiltro(prev =>
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  const handleDeletar = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta conta?')) {
      await deletarConta(id);
    }
  };

  const handleMarcarComoPago = async (conta: any) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Todas as Contas</h1>
            <p className="text-sm text-gray-600 mt-1">{contasFiltradas.length} contas encontradas</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                Início
              </Button>
            </Link>
            <Link href="/contas/nova">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="bg-white mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Busca */}
            <div>
              <Label className="mb-2 block">Buscar por título ou beneficiário</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Digite para buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status */}
              <div>
                <Label className="mb-2 block font-semibold">Status</Label>
                <div className="space-y-2">
                  {(['Pendente', 'Pago', 'Atrasado'] as StatusConta[]).map(status => (
                    <div key={status} className="flex items-center">
                      <Checkbox
                        id={`status-${status}`}
                        checked={statusFiltro.includes(status)}
                        onCheckedChange={() => handleToggleStatus(status)}
                      />
                      <Label htmlFor={`status-${status}`} className="ml-2 cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categoria */}
              <div>
                <Label className="mb-2 block font-semibold">Categoria</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {CATEGORIAS_PADRAO.map(categoria => (
                    <div key={categoria} className="flex items-center">
                      <Checkbox
                        id={`cat-${categoria}`}
                        checked={categoriaFiltro.includes(categoria)}
                        onCheckedChange={() => handleToggleCategoria(categoria)}
                      />
                      <Label htmlFor={`cat-${categoria}`} className="ml-2 cursor-pointer">
                        {obterIconeCategoria(categoria)} {categoria}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Valor */}
              <div>
                <Label className="mb-2 block font-semibold">Valor (BRL)</Label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={valorMin}
                    onChange={(e) => setValorMin(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={valorMax}
                    onChange={(e) => setValorMax(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Ordenação */}
            <div>
              <Label className="mb-2 block font-semibold">Ordenar por</Label>
              <Select value={ordenacao} onValueChange={(value: any) => setOrdenacao(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vencimento">Data de Vencimento</SelectItem>
                  <SelectItem value="valor">Valor (maior primeiro)</SelectItem>
                  <SelectItem value="categoria">Categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão Limpar Filtros */}
            <Button
              variant="outline"
              onClick={() => {
                setBusca('');
                setStatusFiltro(['Pendente', 'Atrasado']);
                setCategoriaFiltro([]);
                setValorMin('');
                setValorMax('');
              }}
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        {contasFiltradas.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhuma conta encontrada com os filtros aplicados</p>
              <Link href="/contas/nova">
                <Button>Criar Primeira Conta</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {contasFiltradas.map(conta => (
              <Card key={conta.id} className="bg-white hover:shadow-md transition">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/contas/${conta.id}`} className="flex-1">
                      <div className="cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{obterIconeCategoria(conta.categoria)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600">{conta.titulo}</h3>
                            <p className="text-sm text-gray-600">{conta.beneficiario}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{conta.categoria}</span>
                          <span>•</span>
                          <span>{descricaoDiasRestantes(conta.dataVencimento)}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            conta.status === 'Pago' ? 'bg-green-100 text-green-800' :
                            conta.status === 'Atrasado' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {conta.status}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-gray-900">{formatarMoeda(conta.valor)}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatarData(conta.dataVencimento)}</p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Link href={`/contas/${conta.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          Ver Detalhes
                        </Button>
                      </Link>
                      {conta.status !== 'Pago' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleMarcarComoPago(conta)}
                          title="Marcar como pago"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Link href={`/contas/${conta.id}/editar`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeletar(conta.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
