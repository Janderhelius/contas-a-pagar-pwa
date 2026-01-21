/**
 * Página DetalhesConta - Visualizar detalhes e gerenciar status da conta
 */

import { useState, useEffect } from 'react';
import { useContas } from '@/contexts/ContasContext';
import { useLembretes } from '@/contexts/LembretesContext';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatarMoeda, formatarData, obterIconeCategoria, descricaoDiasRestantes } from '@/lib/formatadores';
import { parseDataBrasileira } from '@/lib/formatadores';
import { ArrowLeft, Home, Edit2, Trash2, Check, X } from 'lucide-react';
import { Link } from 'wouter';

export default function DetalhesConta() {
  const [, params] = useRoute('/contas/:id');
  const { contas, obterConta, atualizarConta, deletarConta } = useContas();
  const { obterLembretesPorConta, deletarLembretesPorConta } = useLembretes();

  const contaId = params?.id;
  const conta = contaId ? obterConta(contaId) : null;

  const [modalAberto, setModalAberto] = useState(false);
  const [dataPagamento, setDataPagamento] = useState(formatarData(new Date()));
  const [valorPago, setValorPago] = useState(conta?.valor.toString() || '0');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (conta) {
      setValorPago(conta.valorPago?.toString() || conta.valor.toString());
      if (conta.dataPagamento) {
        setDataPagamento(formatarData(conta.dataPagamento));
      }
    }
  }, [conta]);

  if (!conta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Conta não encontrada</p>
          <Link href="/contas">
            <Button>Voltar para Contas</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleMarcarComoPago = async () => {
    try {
      setCarregando(true);
      const dataPagamentoObj = parseDataBrasileira(dataPagamento);
      
      await atualizarConta(conta.id, {
        status: 'Pago',
        dataPagamento: dataPagamentoObj,
        valorPago: Number(valorPago),
      });

      // Deletar lembretes futuros
      const lembretes = await obterLembretesPorConta(conta.id);
      for (const lembrete of lembretes) {
        if (lembrete.ativo) {
          await deletarLembretesPorConta(conta.id);
        }
      }

      toast.success('Conta marcada como paga!');
      setModalAberto(false);
      window.location.href = '/contas';
    } catch (erro) {
      console.error('Erro ao marcar como pago:', erro);
      toast.error('Erro ao marcar como pago');
    } finally {
      setCarregando(false);
    }
  };

  const handleMarcarComoPendente = async () => {
    if (!confirm('Tem certeza que deseja marcar esta conta como pendente? Isso removerá a data e valor de pagamento.')) {
      return;
    }

    try {
      setCarregando(true);
      await atualizarConta(conta.id, {
        status: 'Pendente',
        dataPagamento: undefined,
        valorPago: undefined,
      });

      toast.success('Conta marcada como pendente!');
      window.location.href = '/contas';
    } catch (erro) {
      console.error('Erro ao marcar como pendente:', erro);
      toast.error('Erro ao marcar como pendente');
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletar = async () => {
    if (!confirm('Tem certeza que deseja deletar esta conta? Esta ação é irreversível.')) {
      return;
    }

    try {
      await deletarConta(conta.id);
      toast.success('Conta deletada com sucesso!');
      window.location.href = '/contas';
    } catch (erro) {
      console.error('Erro ao deletar conta:', erro);
      toast.error('Erro ao deletar conta');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/contas">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Detalhes da Conta</h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              Início
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Informações Principais */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{obterIconeCategoria(conta.categoria)}</span>
                <div>
                  <CardTitle className="text-3xl">{conta.titulo}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{conta.beneficiario}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">{formatarMoeda(conta.valor)}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  conta.status === 'Pago' ? 'bg-green-100 text-green-800' :
                  conta.status === 'Atrasado' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {conta.status}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informações de Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Data de Emissão</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900">{formatarData(conta.dataEmissao)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Data de Vencimento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-gray-900">{formatarData(conta.dataVencimento)}</p>
              <p className="text-xs text-gray-500 mt-1">{descricaoDiasRestantes(conta.dataVencimento)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Informações de Pagamento */}
        {conta.status === 'Pago' && conta.dataPagamento && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-green-700">Data de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-green-900">{formatarData(conta.dataPagamento)}</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-green-700">Valor Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-green-900">{formatarMoeda(conta.valorPago || conta.valor)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detalhes Adicionais */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <CardTitle>Detalhes Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600">Categoria</Label>
              <p className="text-gray-900 font-medium">{conta.categoria}</p>
            </div>

            <div>
              <Label className="text-sm text-gray-600">Forma de Pagamento</Label>
              <p className="text-gray-900 font-medium">{conta.formaPagamento}</p>
            </div>

            <div>
              <Label className="text-sm text-gray-600">Recorrência</Label>
              <p className="text-gray-900 font-medium">
                {conta.recorrencia.tipo}
                {conta.recorrencia.intervalo && ` (a cada ${conta.recorrencia.intervalo} dias)`}
              </p>
            </div>

            {conta.linkCodigo && (
              <div>
                <Label className="text-sm text-gray-600">Link/Código</Label>
                <p className="text-gray-900 font-medium break-all text-sm">{conta.linkCodigo}</p>
              </div>
            )}

            {conta.observacoes && (
              <div>
                <Label className="text-sm text-gray-600">Observações</Label>
                <p className="text-gray-900 font-medium">{conta.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conta.status !== 'Pago' ? (
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => setModalAberto(true)}
              >
                <Check className="w-4 h-4" />
                Marcar como Pago
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleMarcarComoPendente}
                disabled={carregando}
              >
                <X className="w-4 h-4" />
                Marcar como Pendente
              </Button>
            )}

            <Link href={`/contas/${conta.id}`} className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Conta
              </Button>
            </Link>

            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={handleDeletar}
            >
              <Trash2 className="w-4 h-4" />
              Deletar Conta
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Modal de Pagamento */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Pago</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="dataPagamento">Data de Pagamento *</Label>
              <Input
                id="dataPagamento"
                type="text"
                placeholder="DD/MM/YYYY"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="valorPago">Valor Pago (BRL)</Label>
              <Input
                id="valorPago"
                type="number"
                step="0.01"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Valor original: {formatarMoeda(conta.valor)}</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalAberto(false)}
              disabled={carregando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleMarcarComoPago}
              disabled={carregando}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              {carregando ? 'Salvando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
