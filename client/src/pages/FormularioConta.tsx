/**
 * Página FormularioConta - Criar/Editar contas
 */

import { useState, useEffect } from 'react';
import { useContas } from '@/contexts/ContasContext';
import { useLembretes } from '@/contexts/LembretesContext';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { CATEGORIAS_PADRAO, FormaPagamento, TipoRecorrencia } from '@/lib/types';
import { validarConta, temErros } from '@/lib/validacoes';
import { parseDataBrasileira, formatarData } from '@/lib/formatadores';
import { ArrowLeft, Save, Home } from 'lucide-react';
import { Link } from 'wouter';

export default function FormularioConta() {
  const [, paramsNova] = useRoute('/contas/nova');
  const [, paramsEditar] = useRoute('/contas/:id/editar');
  const params = paramsEditar || paramsNova;
  const [, setLocation] = useLocation();
  const { contas, adicionarConta, atualizarConta, obterConta } = useContas();
  const { adicionarLembrete, deletarLembretesPorConta, obterLembretesPorConta } = useLembretes();

  const contaId = paramsEditar ? (paramsEditar as any).id : undefined;
  const isEdicao = !!contaId;
  const contaExistente = isEdicao ? obterConta(contaId!) : null;

  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'Outros',
    valor: '',
    dataEmissao: formatarData(new Date()),
    dataVencimento: formatarData(new Date()),
    observacoes: '',
    formaPagamento: 'PIX' as FormaPagamento,
    beneficiario: '',
    linkCodigo: '',
    recorrencia: 'Nenhuma' as TipoRecorrencia,
    intervaloRecorrencia: '',
    criarLembrete: true,
    diasAntes: '1',
    horarioLembrete: '09:00',
    repetirSeAtrasado: false,
    jaFoiPaga: false,
    dataPagamento: formatarData(new Date()),
    valorPago: '',
  });

  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);

  // Carrega dados da conta se estiver editando
  useEffect(() => {
    if (contaExistente) {
      setFormData({
        titulo: contaExistente.titulo,
        categoria: contaExistente.categoria,
        valor: contaExistente.valor.toString(),
        dataEmissao: formatarData(contaExistente.dataEmissao),
        dataVencimento: formatarData(contaExistente.dataVencimento),
        observacoes: contaExistente.observacoes,
        formaPagamento: contaExistente.formaPagamento,
        beneficiario: contaExistente.beneficiario,
        linkCodigo: contaExistente.linkCodigo,
        recorrencia: contaExistente.recorrencia.tipo,
        intervaloRecorrencia: contaExistente.recorrencia.intervalo?.toString() || '',
        criarLembrete: false,
        diasAntes: '1',
        horarioLembrete: '09:00',
        repetirSeAtrasado: false,
        jaFoiPaga: contaExistente.status === 'Pago',
        dataPagamento: contaExistente.dataPagamento ? formatarData(contaExistente.dataPagamento) : formatarData(new Date()),
        valorPago: contaExistente.valorPago?.toString() || '',
      });
    }
  }, [contaExistente]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa erro do campo
    if (erros[field]) {
      setErros(prev => {
        const novoErros = { ...prev };
        delete novoErros[field];
        return novoErros;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      // Validação
      const dataEmissao = parseDataBrasileira(formData.dataEmissao);
      const dataVencimento = parseDataBrasileira(formData.dataVencimento);
      
      // Se marcado como pago, validar data de pagamento
      let dataPagamento: Date | undefined;
      if (formData.jaFoiPaga) {
        if (!formData.dataPagamento) {
          setErros({ dataPagamento: 'Data de pagamento é obrigatória' });
          toast.error('Data de pagamento é obrigatória');
          setSalvando(false);
          return;
        }
        dataPagamento = parseDataBrasileira(formData.dataPagamento);
      }

      const contaParaValidar = {
        titulo: formData.titulo,
        categoria: formData.categoria,
        valor: Number(formData.valor),
        dataEmissao,
        dataVencimento,
        observacoes: formData.observacoes,
        formaPagamento: formData.formaPagamento,
        beneficiario: formData.beneficiario,
        linkCodigo: formData.linkCodigo,
        recorrencia: {
          tipo: formData.recorrencia as TipoRecorrencia,
          intervalo: formData.recorrencia === 'Personalizada' ? Number(formData.intervaloRecorrencia) : undefined,
        },
        status: (formData.jaFoiPaga ? 'Pago' : 'Pendente') as 'Pago' | 'Pendente' | 'Atrasado',
        dataPagamento: dataPagamento,
        valorPago: formData.jaFoiPaga ? Number(formData.valorPago || formData.valor) : undefined,
      };

      const novosErros = validarConta(contaParaValidar, []);
      if (temErros(novosErros)) {
        setErros(novosErros);
        toast.error('Preencha todos os campos obrigatórios corretamente');
        setSalvando(false);
        return;
      }

      if (isEdicao && contaExistente) {
        // Atualizar conta
        await atualizarConta(contaExistente.id, {
          ...contaParaValidar,
          status: formData.jaFoiPaga ? 'Pago' : 'Pendente',
        });
        toast.success('Conta atualizada com sucesso!');
      } else {
        // Criar nova conta
        await adicionarConta({
          ...contaParaValidar,
          status: formData.jaFoiPaga ? 'Pago' : 'Pendente',
        });
        toast.success('Conta criada com sucesso!');

        // Criar lembrete se solicitado e não for paga
        if (formData.criarLembrete && !formData.jaFoiPaga) {
          const proximaNotificacao = new Date(dataVencimento);
          const [hora, minuto] = formData.horarioLembrete.split(':').map(Number);
          proximaNotificacao.setHours(hora, minuto, 0, 0);

          // Se for "dias antes", subtrair os dias
          if (formData.diasAntes !== '0') {
            proximaNotificacao.setDate(proximaNotificacao.getDate() - Number(formData.diasAntes));
          }

          // Obter o ID da conta recém-criada
          const novasConta = await contas;
          const ultimaConta = novasConta[novasConta.length - 1];

          if (ultimaConta) {
            await adicionarLembrete({
              contaId: ultimaConta.id,
              tipo: formData.diasAntes === '0' ? 'vencimento' : 'diasAntes',
              diasAntes: formData.diasAntes === '0' ? undefined : Number(formData.diasAntes),
              horario: formData.horarioLembrete,
              ativo: true,
              repetirSeAtrasado: formData.repetirSeAtrasado,
              proximaNotificacao,
            });
          }
        }
      }

      // Redirecionar para lista
      window.location.href = '/contas';
    } catch (erro) {
      console.error('Erro ao salvar conta:', erro);
      toast.error('Erro ao salvar conta');
    } finally {
      setSalvando(false);
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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdicao ? 'Editar Conta' : 'Nova Conta'}
            </h1>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleChange('titulo', e.target.value)}
                    placeholder="Ex: Aluguel, Conta de Água"
                    className={erros.titulo ? 'border-red-500' : ''}
                  />
                  {erros.titulo && <p className="text-xs text-red-500 mt-1">{erros.titulo}</p>}
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleChange('categoria', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PADRAO.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor">Valor (BRL) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => handleChange('valor', e.target.value)}
                    placeholder="0.00"
                    className={erros.valor ? 'border-red-500' : ''}
                  />
                  {erros.valor && <p className="text-xs text-red-500 mt-1">{erros.valor}</p>}
                </div>

                <div>
                  <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                  <Select value={formData.formaPagamento} onValueChange={(value) => handleChange('formaPagamento', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Cartão">Cartão</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataEmissao">Data de Emissão *</Label>
                  <Input
                    id="dataEmissao"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.dataEmissao}
                    onChange={(e) => handleChange('dataEmissao', e.target.value)}
                    className={erros.dataEmissao ? 'border-red-500' : ''}
                  />
                </div>

                <div>
                  <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
                  <Input
                    id="dataVencimento"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.dataVencimento}
                    onChange={(e) => handleChange('dataVencimento', e.target.value)}
                    className={erros.dataVencimento ? 'border-red-500' : ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="beneficiario">Beneficiário/Empresa</Label>
                <Input
                  id="beneficiario"
                  value={formData.beneficiario}
                  onChange={(e) => handleChange('beneficiario', e.target.value)}
                  placeholder="Ex: Empresa XYZ"
                />
              </div>

              <div>
                <Label htmlFor="linkCodigo">Link/Código (PIX ou Código de Barras)</Label>
                <Textarea
                  id="linkCodigo"
                  value={formData.linkCodigo}
                  onChange={(e) => handleChange('linkCodigo', e.target.value)}
                  placeholder="Cole aqui o PIX copia e cola ou código de barras"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleChange('observacoes', e.target.value)}
                  placeholder="Adicione observações adicionais"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status de Pagamento */}
          <Card className="bg-white border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">Já foi paga?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="jaFoiPaga"
                  checked={formData.jaFoiPaga}
                  onCheckedChange={(checked) => handleChange('jaFoiPaga', checked)}
                />
                <Label htmlFor="jaFoiPaga" className="cursor-pointer font-medium">
                  Esta conta já foi paga
                </Label>
              </div>

              {formData.jaFoiPaga && (
                <div className="space-y-4 pl-6 border-l-2 border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataPagamento">Data de Pagamento *</Label>
                      <Input
                        id="dataPagamento"
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={formData.dataPagamento}
                        onChange={(e) => handleChange('dataPagamento', e.target.value)}
                        className={erros.dataPagamento ? 'border-red-500' : ''}
                      />
                      {erros.dataPagamento && <p className="text-xs text-red-500 mt-1">{erros.dataPagamento}</p>}
                    </div>

                    <div>
                      <Label htmlFor="valorPago">Valor Pago (BRL)</Label>
                      <Input
                        id="valorPago"
                        type="number"
                        step="0.01"
                        value={formData.valorPago || formData.valor}
                        onChange={(e) => handleChange('valorPago', e.target.value)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Se deixar em branco, usará o valor da conta</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recorrência */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Recorrência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recorrencia">Tipo de Recorrência</Label>
                <Select value={formData.recorrencia} onValueChange={(value) => handleChange('recorrencia', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nenhuma">Nenhuma</SelectItem>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Semanal">Semanal</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                    <SelectItem value="Personalizada">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.recorrencia === 'Personalizada' && (
                <div>
                  <Label htmlFor="intervaloRecorrencia">Intervalo (dias)</Label>
                  <Input
                    id="intervaloRecorrencia"
                    type="number"
                    value={formData.intervaloRecorrencia}
                    onChange={(e) => handleChange('intervaloRecorrencia', e.target.value)}
                    placeholder="Ex: 15"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lembretes (apenas para novas contas não pagas) */}
          {!isEdicao && !formData.jaFoiPaga && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Configurar Lembrete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="criarLembrete"
                    checked={formData.criarLembrete}
                    onCheckedChange={(checked) => handleChange('criarLembrete', checked)}
                  />
                  <Label htmlFor="criarLembrete" className="cursor-pointer">
                    Criar lembrete para esta conta
                  </Label>
                </div>

                {formData.criarLembrete && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="diasAntes">Lembrar</Label>
                        <Select value={formData.diasAntes} onValueChange={(value) => handleChange('diasAntes', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No dia do vencimento</SelectItem>
                            <SelectItem value="1">1 dia antes</SelectItem>
                            <SelectItem value="2">2 dias antes</SelectItem>
                            <SelectItem value="3">3 dias antes</SelectItem>
                            <SelectItem value="5">5 dias antes</SelectItem>
                            <SelectItem value="7">1 semana antes</SelectItem>
                            <SelectItem value="10">10 dias antes</SelectItem>
                            <SelectItem value="15">15 dias antes</SelectItem>
                            <SelectItem value="30">1 mês antes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="horarioLembrete">Horário do Lembrete</Label>
                        <Input
                          id="horarioLembrete"
                          type="time"
                          value={formData.horarioLembrete}
                          onChange={(e) => handleChange('horarioLembrete', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="repetirSeAtrasado"
                        checked={formData.repetirSeAtrasado}
                        onCheckedChange={(checked) => handleChange('repetirSeAtrasado', checked)}
                      />
                      <Label htmlFor="repetirSeAtrasado" className="cursor-pointer">
                        Repetir diariamente se estiver atrasado
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <Link href="/contas">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={salvando} className="gap-2">
              <Save className="w-4 h-4" />
              {salvando ? 'Salvando...' : isEdicao ? 'Atualizar' : 'Criar Conta'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
