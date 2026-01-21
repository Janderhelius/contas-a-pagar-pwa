/**
 * Página CentralLembretes - Visualização de lembretes
 */

import { useContas } from '@/contexts/ContasContext';
import { useLembretes } from '@/contexts/LembretesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { formatarData, formatarMoeda, obterIconeCategoria, descricaoDiasRestantes } from '@/lib/formatadores';
import { ArrowLeft, Bell, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

export default function CentralLembretes() {
  const { contas } = useContas();
  const { lembretes, atualizarLembrete, deletarLembrete } = useLembretes();
  const [filtro, setFiltro] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  const lembretesAtivos = lembretes.filter(l => l.ativo);
  const lembretesInativos = lembretes.filter(l => !l.ativo);

  const lembretesFiltrados = 
    filtro === 'ativos' ? lembretesAtivos :
    filtro === 'inativos' ? lembretesInativos :
    lembretes;

  // Agrupa lembretes por conta
  const lembretesAgrupados: Record<string, typeof lembretes> = {};
  lembretesFiltrados.forEach(lembrete => {
    if (!lembretesAgrupados[lembrete.contaId]) {
      lembretesAgrupados[lembrete.contaId] = [];
    }
    lembretesAgrupados[lembrete.contaId].push(lembrete);
  });

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    await atualizarLembrete(id, { ativo: !ativo });
  };

  const handleDeletar = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este lembrete?')) {
      await deletarLembrete(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Central de Lembretes</h1>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filtro === 'todos' ? 'default' : 'outline'}
            onClick={() => setFiltro('todos')}
          >
            Todos ({lembretes.length})
          </Button>
          <Button
            variant={filtro === 'ativos' ? 'default' : 'outline'}
            onClick={() => setFiltro('ativos')}
          >
            Ativos ({lembretesAtivos.length})
          </Button>
          <Button
            variant={filtro === 'inativos' ? 'default' : 'outline'}
            onClick={() => setFiltro('inativos')}
          >
            Inativos ({lembretesInativos.length})
          </Button>
        </div>

        {/* Lista de Lembretes */}
        {Object.keys(lembretesAgrupados).length === 0 ? (
          <Card className="bg-white">
            <CardContent className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum lembrete configurado</p>
              <Link href="/contas/nova">
                <Button>Criar Conta com Lembrete</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(lembretesAgrupados).map(([contaId, contasLembretes]) => {
              const conta = contas.find(c => c.id === contaId);
              if (!conta) return null;

              return (
                <Card key={contaId} className="bg-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{obterIconeCategoria(conta.categoria)}</span>
                        <div>
                          <Link href={`/contas/${conta.id}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                              {conta.titulo}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600">{conta.beneficiario}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatarMoeda(conta.valor)}</p>
                        <p className="text-xs text-gray-500">{descricaoDiasRestantes(conta.dataVencimento)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contasLembretes.map(lembrete => (
                        <div
                          key={lembrete.id}
                          className={`p-3 border rounded-lg flex items-center justify-between ${
                            lembrete.ativo
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Bell className={`w-4 h-4 ${lembrete.ativo ? 'text-blue-600' : 'text-gray-400'}`} />
                              <span className="font-medium text-gray-900">
                                {lembrete.tipo === 'vencimento'
                                  ? 'No dia do vencimento'
                                  : `${lembrete.diasAntes} dia(s) antes`}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Horário: {lembrete.horario}
                              {lembrete.repetirSeAtrasado && ' • Repetir se atrasado'}
                            </p>
                            {lembrete.proximaNotificacao && (
                              <p className="text-xs text-gray-500 mt-1">
                                Próxima notificação: {formatarData(lembrete.proximaNotificacao)}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleAtivo(lembrete.id, lembrete.ativo)}
                            >
                              {lembrete.ativo ? (
                                <ToggleRight className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeletar(lembrete.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Informações sobre notificações */}
        <Card className="bg-blue-50 border-blue-200 mt-8">
          <CardHeader>
            <CardTitle className="text-blue-900">ℹ️ Sobre Notificações</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              • As notificações funcionam quando o app está aberto ou em segundo plano
            </p>
            <p>
              • Você pode receber notificações do navegador (se permitir)
            </p>
            <p>
              • Lembretes inativos não geram notificações
            </p>
            <p>
              • Configure permissões de notificação nas configurações do seu navegador
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
